CREATE TABLE IF NOT EXISTS "accelerators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(16) NOT NULL,
	"memory_gb" numeric(10, 2) NOT NULL,
	"manufacturer" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benchmark_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"system_id" integer,
	"accelerator_id" integer,
	"model_variant_id" integer,
	"runtime_id" integer,
	"run_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benchmark_systems" (
	"id" serial PRIMARY KEY NOT NULL,
	"cpu_name" varchar(255),
	"cpu_arch" varchar(255),
	"ram_gb" numeric(10, 2),
	"kernel_type" varchar(255),
	"kernel_release" varchar(255),
	"system_version" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "model_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" integer,
	"quantization" varchar(50),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "models" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"params" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "models_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtimes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"version" varchar(255),
	"commit_hash" varchar(255),
	"release_date" date,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"benchmark_run_id" integer,
	"name" varchar(255),
	"n_prompt" integer,
	"n_gen" integer,
	"avg_time_ms" numeric(15, 2),
	"power_watts" numeric(10, 2),
	"prompt_tps" numeric(10, 2),
	"gen_tps" numeric(10, 2),
	"prompt_tps_watt" numeric(10, 4),
	"gen_tps_watt" numeric(10, 4),
	"vram_used_mb" numeric(10, 2),
	"ttft_ms" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "benchmark_runs" ADD CONSTRAINT "benchmark_runs_system_id_benchmark_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."benchmark_systems"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "benchmark_runs" ADD CONSTRAINT "benchmark_runs_accelerator_id_accelerators_id_fk" FOREIGN KEY ("accelerator_id") REFERENCES "public"."accelerators"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "benchmark_runs" ADD CONSTRAINT "benchmark_runs_model_variant_id_model_variants_id_fk" FOREIGN KEY ("model_variant_id") REFERENCES "public"."model_variants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "benchmark_runs" ADD CONSTRAINT "benchmark_runs_runtime_id_runtimes_id_fk" FOREIGN KEY ("runtime_id") REFERENCES "public"."runtimes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "model_variants" ADD CONSTRAINT "model_variants_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_results" ADD CONSTRAINT "test_results_benchmark_run_id_benchmark_runs_id_fk" FOREIGN KEY ("benchmark_run_id") REFERENCES "public"."benchmark_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "accelerator_unique_idx" ON "accelerators" USING btree ("name","type","memory_gb");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "model_variant_unique_idx" ON "model_variants" USING btree ("model_id","quantization");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "runtime_unique_idx" ON "runtimes" USING btree ("name","version","commit_hash");--> statement-breakpoint
CREATE VIEW "public"."accelerator_model_performance_scores" AS (
    SELECT 
      a.id as accelerator_id,
      a.name as accelerator_name,
      a.type as accelerator_type,
      a.memory_gb as accelerator_memory_gb,
      m.id as model_id,
      m.name as model_name,
      mv.id as model_variant_id,
      mv.quantization as model_variant_quant,
      AVG(CASE WHEN tr.prompt_tps = 0 THEN NULL ELSE tr.prompt_tps END) as avg_prompt_tps,
      AVG(CASE WHEN tr.gen_tps = 0 THEN NULL ELSE tr.gen_tps END) as avg_gen_tps,
      AVG(CASE WHEN tr.ttft_ms = 0 THEN NULL ELSE tr.ttft_ms END) as avg_ttft,
      CASE 
        WHEN AVG(tr.power_watts) = 0 THEN NULL 
        ELSE AVG(tr.prompt_tps_watt) 
      END as avg_prompt_tps_watt,
      CASE 
        WHEN AVG(tr.power_watts) = 0 THEN NULL 
        ELSE AVG(tr.gen_tps_watt) 
      END as avg_gen_tps_watt,
      AVG(tr.avg_time_ms * tr.power_watts / 1000) as avg_joules,
      CASE
        WHEN AVG(tr.prompt_tps) <= 0 OR AVG(tr.gen_tps) <= 0 OR AVG(tr.ttft_ms) <= 0 THEN NULL
        ELSE POWER(
          AVG(tr.prompt_tps) * 
          AVG(tr.gen_tps) * 
          (1000/AVG(tr.ttft_ms)),
          1.0/3.0
        )
      END as performance_score,
      CASE
        WHEN AVG(tr.power_watts) <= 0 OR 
             AVG(tr.prompt_tps_watt) <= 0 OR 
             AVG(tr.gen_tps_watt) <= 0 OR 
             AVG(tr.avg_time_ms * tr.power_watts) <= 0 THEN NULL
        ELSE POWER(
          AVG(tr.prompt_tps_watt) * 
          AVG(tr.gen_tps_watt) * 
          (1000/(AVG(tr.avg_time_ms * tr.power_watts))),
          1.0/3.0
        )
      END as efficiency_score
    FROM "accelerators" a
    JOIN "benchmark_runs" br ON br.accelerator_id = a.id
    JOIN "test_results" tr ON tr.benchmark_run_id = br.id
    JOIN "model_variants" mv ON br.model_variant_id = mv.id
    JOIN "models" m ON mv.model_id = m.id
    GROUP BY 
      a.id, 
      a.name,
      a.type,
      a.memory_gb,
      m.id,
      m.name,
      mv.id,
      mv.quantization
  );--> statement-breakpoint
CREATE VIEW "public"."benchmark_performance_scores" AS (
  WITH avg_metrics AS (
    SELECT 
      benchmark_run_id,
      AVG(prompt_tps) as avg_prompt_tps,
      AVG(gen_tps) as avg_gen_tps,
      AVG(ttft_ms) as avg_ttft_ms
    FROM "test_results"
    GROUP BY benchmark_run_id
  )
  SELECT 
    benchmark_run_id,
    avg_prompt_tps,
    avg_gen_tps,
    avg_ttft_ms,
    POWER(
      (avg_prompt_tps * avg_gen_tps * (1000.0 / NULLIF(avg_ttft_ms, 0))),
      (1.0/3.0)
    ) * 10 as performance_score
  FROM avg_metrics
);
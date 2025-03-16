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
	"avg_prompt_tps" numeric(10, 2) NOT NULL,
	"avg_gen_tps" numeric(10, 2) NOT NULL,
	"avg_ttft_ms" numeric(10, 2) NOT NULL,
	"performance_score" numeric(10, 2) NOT NULL,
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
CREATE UNIQUE INDEX IF NOT EXISTS "system_unique_idx" ON "benchmark_systems" USING btree ("cpu_name","cpu_arch","ram_gb","kernel_type","kernel_release","system_version");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "model_variant_unique_idx" ON "model_variants" USING btree ("model_id","quantization");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "runtime_unique_idx" ON "runtimes" USING btree ("name","version","commit_hash");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."accelerator_model_performance_scores" AS (
    SELECT 
      a.id as accelerator_id,
      a.name as accelerator_name,
      a.type as accelerator_type,
      a.memory_gb as accelerator_memory_gb,
      m.id as model_id,
      m.name as model_name,
      mv.id as model_variant_id,
      mv.quantization as model_variant_quant,
      AVG(CASE WHEN br.avg_prompt_tps = 0 THEN NULL ELSE br.avg_prompt_tps END) as avg_prompt_tps,
      AVG(CASE WHEN br.avg_gen_tps = 0 THEN NULL ELSE br.avg_gen_tps END) as avg_gen_tps,
      AVG(CASE WHEN br.avg_ttft_ms = 0 THEN NULL ELSE br.avg_ttft_ms END) as avg_ttft,
      AVG(CASE WHEN br.performance_score = 0 THEN NULL ELSE br.performance_score END) as performance_score
    FROM "accelerators" a
    JOIN "benchmark_runs" br ON br.accelerator_id = a.id
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
  );
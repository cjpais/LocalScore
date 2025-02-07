import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  decimal,
  timestamp,
  integer,
  date,
  uniqueIndex,
  bigint,
  pgView,
  serial,
} from "drizzle-orm/pg-core";

// Core tables
export const accelerators = pgTable(
  "accelerators",
  {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 16 }).notNull(),
    memory_gb: decimal({ precision: 10, scale: 2 }).notNull(),
    manufacturer: varchar({ length: 255 }),
    created_at: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueAccelerator: uniqueIndex("accelerator_unique_idx").on(
      table.name,
      table.type,
      table.memory_gb
    ),
  })
);

export const models = pgTable("models", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  params: bigint({ mode: "number" }).notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
});

export const modelVariants = pgTable(
  "model_variants",
  {
    id: serial().primaryKey(),
    model_id: integer().references(() => models.id),
    quantization: varchar({ length: 50 }),
    created_at: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // A model should only have one variant per quantization
    modelQuantizationIndex: uniqueIndex("model_variant_unique_idx").on(
      table.model_id,
      table.quantization
    ),
  })
);

export const runtimes = pgTable(
  "runtimes",
  {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    version: varchar({ length: 255 }),
    commit_hash: varchar({ length: 255 }),
    release_date: date(),
    created_at: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // A runtime should be unique based on name, version, and commit_hash
    runtimeUniqueIndex: uniqueIndex("runtime_unique_idx").on(
      table.name,
      table.version,
      table.commit_hash
    ),
  })
);

export const benchmarkSystems = pgTable("benchmark_systems", {
  id: serial().primaryKey(),
  cpu_name: varchar({ length: 255 }),
  cpu_arch: varchar({ length: 255 }),
  ram_gb: decimal({ precision: 10, scale: 2 }),
  kernel_type: varchar({ length: 255 }),
  kernel_release: varchar({ length: 255 }),
  system_version: varchar({ length: 255 }),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
});

// TODO add score for efficiency and performance?!!!
export const benchmarkRuns = pgTable("benchmark_runs", {
  id: serial().primaryKey(),
  system_id: integer().references(() => benchmarkSystems.id),
  accelerator_id: integer().references(() => accelerators.id),
  model_variant_id: integer().references(() => modelVariants.id),
  runtime_id: integer().references(() => runtimes.id),
  run_date: timestamp({ withTimezone: true }),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
});

export const testResults = pgTable("test_results", {
  id: serial().primaryKey(),
  benchmark_run_id: integer().references(() => benchmarkRuns.id),
  name: varchar({ length: 255 }),
  n_prompt: integer(),
  n_gen: integer(),
  avg_time_ms: decimal({ precision: 15, scale: 2 }),
  power_watts: decimal({ precision: 10, scale: 2 }),
  prompt_tps: decimal({
    precision: 10,
    scale: 2,
  }),
  gen_tps: decimal({
    precision: 10,
    scale: 2,
  }),
  prompt_tps_watt: decimal({
    precision: 10,
    scale: 4,
  }),
  gen_tps_watt: decimal({
    precision: 10,
    scale: 4,
  }),
  vram_used_mb: decimal({ precision: 10, scale: 2 }),
  ttft_ms: decimal({
    precision: 10,
    scale: 2,
  }),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
});

export const benchmarkPerformanceScores = pgView(
  "benchmark_performance_scores",
  {
    id: serial(),
    benchmark_run_id: integer(),
    avg_prompt_tps: decimal({ precision: 10, scale: 2 }),
    avg_gen_tps: decimal({ precision: 10, scale: 2 }),
    avg_ttft_ms: decimal({ precision: 10, scale: 2 }), // TODO avg ttft instead
    performance_score: decimal({
      precision: 15,
      scale: 4,
    }),
  }
).as(sql`
  WITH avg_metrics AS (
    SELECT 
      benchmark_run_id,
      AVG(prompt_tps) as avg_prompt_tps,
      AVG(gen_tps) as avg_gen_tps,
      AVG(ttft_ms) as avg_ttft_ms
    FROM ${testResults}
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
`);

export const acceleratorModelPerformanceScores = pgView(
  "accelerator_model_performance_scores",
  {
    accelerator_id: integer(),
    accelerator_name: varchar({ length: 255 }),
    accelerator_type: varchar({ length: 16 }),
    accelerator_memory_gb: decimal({
      precision: 10,
      scale: 2,
    }),
    model_id: integer(),
    model_name: varchar({ length: 255 }),
    model_variant_id: integer(),
    model_variant_quant: varchar({ length: 50 }),
    model_variant_name: varchar({ length: 255 }),
    avg_prompt_tps: decimal({ precision: 10, scale: 2 }),
    avg_gen_tps: decimal({ precision: 10, scale: 2 }),
    avg_ttft: decimal({ precision: 10, scale: 2 }),
    avg_prompt_tps_watt: decimal({
      precision: 10,
      scale: 4,
    }),
    avg_gen_tps_watt: decimal({ precision: 10, scale: 4 }),
    avg_joules: decimal({ precision: 10, scale: 2 }),
    performance_score: decimal({
      precision: 10,
      scale: 2,
    }),
    efficiency_score: decimal({ precision: 10, scale: 2 }),
  }
).as(
  sql`
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
    FROM ${accelerators} a
    JOIN ${benchmarkRuns} br ON br.accelerator_id = a.id
    JOIN ${testResults} tr ON tr.benchmark_run_id = br.id
    JOIN ${modelVariants} mv ON br.model_variant_id = mv.id
    JOIN ${models} m ON mv.model_id = m.id
    GROUP BY 
      a.id, 
      a.name,
      a.type,
      a.memory_gb,
      m.id,
      m.name,
      mv.id,
      mv.quantization
  `
);

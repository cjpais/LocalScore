import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  integer,
  date,
  uniqueIndex,
  bigint,
  pgView,
} from "drizzle-orm/pg-core";

// Core tables
export const accelerators = pgTable(
  "accelerators",
  {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 16 }).notNull(),
    memory_gb: decimal("memory_gb", { precision: 10, scale: 2 }).notNull(),
    manufacturer: varchar("manufacturer", { length: 255 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
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
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  params: bigint({ mode: "number" }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const modelVariants = pgTable(
  "model_variants",
  {
    id: uuid("id").primaryKey(),
    model_id: uuid("model_id").references(() => models.id),
    quantization: varchar("quantization", { length: 50 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
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
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    version: varchar("version", { length: 255 }),
    commit_hash: varchar("commit_hash", { length: 255 }),
    release_date: date("release_date"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
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
  id: uuid("id").primaryKey(),
  cpu_name: varchar("cpu_name", { length: 255 }),
  cpu_arch: varchar("cpu_arch", { length: 255 }),
  ram_gb: decimal("ram_gb", { precision: 10, scale: 2 }),
  kernel_type: varchar("kernel_type", { length: 255 }),
  kernel_release: varchar("kernel_release", { length: 255 }),
  system_version: varchar("system_version", { length: 255 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// TODO add score for efficiency and performance?!!!
export const benchmarkRuns = pgTable("benchmark_runs", {
  id: uuid("id").primaryKey(),
  system_id: uuid("system_id").references(() => benchmarkSystems.id),
  accelerator_id: uuid("accelerator_id").references(() => accelerators.id),
  model_variant_id: uuid("model_variant_id").references(() => modelVariants.id),
  runtime_id: uuid("runtime_id").references(() => runtimes.id),
  run_date: timestamp("run_date", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// TODO how to handle different kinds of benchmarks.
export const testResults = pgTable("test_results", {
  id: uuid("id").primaryKey(),
  benchmark_run_id: uuid("benchmark_run_id").references(() => benchmarkRuns.id),
  name: varchar("name", { length: 255 }),
  n_prompt: integer("n_prompt"),
  n_gen: integer("n_gen"),
  avg_time_ms: decimal("avg_time_ms", { precision: 15, scale: 2 }),
  power_watts: decimal("power_watts", { precision: 10, scale: 2 }),
  prompt_tps: decimal("prompt_tps", {
    precision: 10,
    scale: 2,
  }),
  gen_tps: decimal("gen_tps", {
    precision: 10,
    scale: 2,
  }),
  prompt_tps_watt: decimal("prompt_tps_watt", {
    precision: 10,
    scale: 4,
  }),
  gen_tps_watt: decimal("gen_tps_watt", {
    precision: 10,
    scale: 4,
  }),
  // context_window_size: integer("context_window_size"),
  vram_used_mb: decimal("vram_used_mb", { precision: 10, scale: 2 }),
  ttft_ms: decimal("ttft_ms", {
    precision: 10,
    scale: 2,
  }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const acceleratorModelPerformanceScores = pgView(
  "accelerator_model_performance_scores",
  {
    accelerator_id: uuid("accelerator_id"),
    accelerator_name: varchar("accelerator_name", { length: 255 }),
    accelerator_type: varchar("accelerator_type", { length: 16 }),
    accelerator_memory_gb: decimal("accelerator_memory_gb", {
      precision: 10,
      scale: 2,
    }),
    model_id: uuid("model_id"),
    model_name: varchar("model_name", { length: 255 }),
    model_variant_id: uuid("model_variant_id"),
    model_variant_quant: varchar("model_variant_quant", { length: 50 }),
    model_variant_name: varchar("model_variant_name", { length: 255 }),
    avg_prompt_tps: decimal("avg_prompt_tps", { precision: 10, scale: 2 }),
    avg_gen_tps: decimal("avg_gen_tps", { precision: 10, scale: 2 }),
    avg_ttft: decimal("avg_ttft", { precision: 10, scale: 2 }),
    avg_prompt_tps_watt: decimal("avg_prompt_tps_watt", {
      precision: 10,
      scale: 4,
    }),
    avg_gen_tps_watt: decimal("avg_gen_tps_watt", { precision: 10, scale: 4 }),
    avg_joules: decimal("avg_joules", { precision: 10, scale: 2 }),
    performance_score: decimal("performance_score", {
      precision: 10,
      scale: 2,
    }),
    efficiency_score: decimal("efficiency_score", { precision: 10, scale: 2 }),
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
      AVG(tr.prompt_tps) as avg_prompt_tps,
      AVG(tr.gen_tps) as avg_gen_tps,
      AVG(tr.ttft_ms) as avg_ttft,
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

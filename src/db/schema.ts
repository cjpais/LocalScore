import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  real,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const accelerators = sqliteTable(
  "accelerators",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    memory_gb: real("memory_gb").notNull(),
    manufacturer: text("manufacturer"),
    created_at: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    acceleratorUniqueIdx: uniqueIndex("accelerator_unique_idx").on(
      table.name,
      table.type,
      table.memory_gb
    ),
  })
);

export const models = sqliteTable(
  "models",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    params: integer("params").notNull(),
    created_at: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    nameIdx: uniqueIndex("model_name_idx").on(table.name),
  })
);

export const modelVariants = sqliteTable(
  "model_variants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    model_id: integer("model_id").references(() => models.id),
    quantization: text("quantization").notNull(),
    created_at: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    modelVariantUniqueIdx: uniqueIndex("model_variant_unique_idx").on(
      table.model_id,
      table.quantization
    ),
  })
);

export const runtimes = sqliteTable(
  "runtimes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    version: text("version"),
    commit_hash: text("commit_hash"),
    created_at: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    runtimeUniqueIdx: uniqueIndex("runtime_unique_idx").on(
      table.name,
      table.version,
      table.commit_hash
    ),
  })
);

export const benchmarkSystems = sqliteTable(
  "benchmark_systems",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cpu_name: text("cpu_name"),
    cpu_arch: text("cpu_arch"),
    ram_gb: real("ram_gb"),
    kernel_type: text("kernel_type"),
    kernel_release: text("kernel_release"),
    system_version: text("system_version"),
    created_at: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    systemUniqueIdx: uniqueIndex("system_unique_idx").on(
      table.cpu_name,
      table.cpu_arch,
      table.ram_gb,
      table.kernel_type,
      table.kernel_release,
      table.system_version
    ),
  })
);

export const benchmarkRuns = sqliteTable("benchmark_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  system_id: integer("system_id").references(() => benchmarkSystems.id),
  accelerator_id: integer("accelerator_id").references(() => accelerators.id),
  model_variant_id: integer("model_variant_id").references(
    () => modelVariants.id
  ),
  runtime_id: integer("runtime_id").references(() => runtimes.id),
  avg_prompt_tps: real("avg_prompt_tps").notNull(),
  avg_gen_tps: real("avg_gen_tps").notNull(),
  avg_ttft_ms: real("avg_ttft_ms").notNull(),
  performance_score: real("performance_score").notNull(),
  created_at: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const testResults = sqliteTable("test_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  benchmark_run_id: integer("benchmark_run_id").references(
    () => benchmarkRuns.id
  ),
  name: text("name"),
  n_prompt: integer("n_prompt"),
  n_gen: integer("n_gen"),
  avg_time_ms: real("avg_time_ms"),
  power_watts: real("power_watts"),
  prompt_tps: real("prompt_tps"),
  gen_tps: real("gen_tps"),
  prompt_tps_watt: real("prompt_tps_watt"),
  gen_tps_watt: real("gen_tps_watt"),
  vram_used_mb: real("vram_used_mb"),
  ttft_ms: real("ttft_ms"),
  created_at: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const acceleratorModelPerformanceScores = sqliteTable(
  "accelerator_model_performance_scores",
  {
    accelerator_id: integer("accelerator_id")
      .notNull()
      .references(() => accelerators.id),
    accelerator_name: text("accelerator_name").notNull(),
    accelerator_type: text("accelerator_type").notNull(),
    accelerator_memory_gb: real("accelerator_memory_gb").notNull(),
    model_id: integer("model_id")
      .notNull()
      .references(() => models.id),
    model_name: text("model_name").notNull(),
    model_variant_id: integer("model_variant_id")
      .notNull()
      .references(() => modelVariants.id),
    model_variant_quant: text("model_variant_quant").notNull(),
    avg_prompt_tps: real("avg_prompt_tps"),
    avg_gen_tps: real("avg_gen_tps"),
    avg_ttft: real("avg_ttft"),
    performance_score: real("performance_score"),
  },
  (table) => ({
    acceleratorModelPerformanceScoresUniqueIdx: uniqueIndex(
      "accelerator_model_performance_scores_unique_idx"
    ).on(table.accelerator_id, table.model_id, table.model_variant_id),
  })
);

export type DbAccelerator = typeof accelerators.$inferSelect;
export type DbBenchmarkRun = typeof benchmarkRuns.$inferSelect;
export type DbBenchmarkSystem = typeof benchmarkSystems.$inferSelect;
export type DbModel = typeof models.$inferSelect;
export type DbModelVariant = typeof modelVariants.$inferSelect;
export type DbRuntime = typeof runtimes.$inferSelect;
export type DbTestResult = typeof testResults.$inferSelect;
export type DbAcceleratorModelPerformanceScore =
  typeof acceleratorModelPerformanceScores.$inferSelect;

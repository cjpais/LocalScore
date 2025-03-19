import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  real,
  integer,
  uniqueIndex,
  sqliteView,
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
    quantization: text("quantization"),
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

export const acceleratorModelPerformanceScores = sqliteView(
  "accelerator_model_performance_scores"
).as((qb) => {
  return qb
    .select({
      accelerator_id: accelerators.id,
      accelerator_name: accelerators.name,
      accelerator_type: accelerators.type,
      accelerator_memory_gb: accelerators.memory_gb,
      model_id: models.id,
      model_name: models.name,
      model_variant_id: modelVariants.id,
      model_variant_quant: modelVariants.quantization,
      avg_prompt_tps:
        sql`AVG(CASE WHEN ${benchmarkRuns.avg_prompt_tps} = 0 THEN NULL ELSE ${benchmarkRuns.avg_prompt_tps} END)`.as(
          "avg_prompt_tps"
        ),
      avg_gen_tps:
        sql`AVG(CASE WHEN ${benchmarkRuns.avg_gen_tps} = 0 THEN NULL ELSE ${benchmarkRuns.avg_gen_tps} END)`.as(
          "avg_gen_tps"
        ),
      avg_ttft:
        sql`AVG(CASE WHEN ${benchmarkRuns.avg_ttft_ms} = 0 THEN NULL ELSE ${benchmarkRuns.avg_ttft_ms} END)`.as(
          "avg_ttft"
        ),
      performance_score:
        sql`AVG(CASE WHEN ${benchmarkRuns.performance_score} = 0 THEN NULL ELSE ${benchmarkRuns.performance_score} END)`.as(
          "performance_score"
        ),
    })
    .from(accelerators)
    .innerJoin(
      benchmarkRuns,
      sql`${accelerators.id} = ${benchmarkRuns.accelerator_id}`
    )
    .innerJoin(
      modelVariants,
      sql`${benchmarkRuns.model_variant_id} = ${modelVariants.id}`
    )
    .innerJoin(models, sql`${modelVariants.model_id} = ${models.id}`)
    .groupBy(
      accelerators.id,
      accelerators.name,
      accelerators.type,
      accelerators.memory_gb,
      models.id,
      models.name,
      modelVariants.id,
      modelVariants.quantization
    );
});

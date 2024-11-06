import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  integer,
  date,
  uniqueIndex,
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
  cpu_architecture: varchar("cpu_architecture", { length: 255 }),
  ram_gb: decimal("ram_gb", { precision: 10, scale: 2 }),
  kernel_type: varchar("kernel_type", { length: 255 }),
  kernel_release: varchar("kernel_release", { length: 255 }),
  system_version: varchar("system_version", { length: 255 }),
  system_architecture: varchar("system_architecture", { length: 255 }),
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
  test_name: varchar("test_name", { length: 255 }),
  prompt_length: integer("prompt_length"),
  generation_length: integer("generation_length"),
  avg_time_ms: decimal("avg_time_ms", { precision: 15, scale: 2 }),
  power_watts: decimal("power_watts", { precision: 10, scale: 2 }),
  prompt_tokens_per_second: decimal("prompt_tokens_per_second", {
    precision: 10,
    scale: 2,
  }),
  generated_tokens_per_second: decimal("generated_tokens_per_second", {
    precision: 10,
    scale: 2,
  }),
  prompt_tokens_per_second_per_watt: decimal(
    "prompt_tokens_per_second_per_watt",
    {
      precision: 10,
      scale: 4,
    }
  ),
  generated_tokens_per_second_per_watt: decimal(
    "generated_tokens_per_second_per_watt",
    {
      precision: 10,
      scale: 4,
    }
  ),
  context_window_size: integer("context_window_size"),
  vram_used_mb: decimal("vram_used_mb", { precision: 10, scale: 2 }),
  time_to_first_token_ms: decimal("time_to_first_token_ms", {
    precision: 10,
    scale: 2,
  }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

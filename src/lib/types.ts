import { z } from "zod";

export const stringOrDateToString = z
  .union([z.string(), z.date(), z.null()])
  .transform((val) => {
    if (!val) return "";
    if (val instanceof Date) return val.toISOString();
    return String(val);
  });

export const stringOrDateToDate = z
  .union([z.string(), z.date(), z.null()])
  .transform((val) => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    return new Date(val);
  });

export const numberOrStringToNumber = z
  .union([z.string(), z.number(), z.null()])
  .transform((val) => (val ? Number(val) : 0));

export const AcceleratorTypes = ["CPU", "GPU", "ALL"] as const;
export const AcceleratorTypeSchema = z.enum(AcceleratorTypes);
export type AcceleratorType = (typeof AcceleratorTypes)[number];

export const UniqueModelSchema = z.object({
  name: z.string(),
  quant: z.string(),
});

export type UniqueModel = z.infer<typeof UniqueModelSchema>;

export const ModelSchema = UniqueModelSchema.extend({
  id: z.string(),
  variantId: z.string(),
  params: z.number(),
});

export const UniqueAcceleratorSchema = z.object({
  name: z.string(),
  memory: z.string(),
});

export const AcceleratorSchema = z.object({
  name: z.string(),
  type: z.string(),
  id: z.string(),
  memory_gb: z.string(),
  manufacturer: z.string().nullable(),
  created_at: stringOrDateToString.nullable(),
});

export type Model = z.infer<typeof ModelSchema>;
export type Accelerator = z.infer<typeof AcceleratorSchema>;

export type UniqueAccelerator = z.infer<typeof UniqueAcceleratorSchema>;

export const SortableResultSchema = z.object({
  avg_prompt_tps: numberOrStringToNumber,
  avg_gen_tps: numberOrStringToNumber,
  avg_ttft: numberOrStringToNumber,
  // avg_prompt_tps_watt: numberOrStringToNumber,
  // avg_joules: numberOrStringToNumber,
  // avg_gen_tps_watt: numberOrStringToNumber,
  performance_score: numberOrStringToNumber,
});

export type SortableResult = z.infer<typeof SortableResultSchema>;
export type PerformanceMetricKey = keyof z.infer<typeof SortableResultSchema>;
export const sortableResultKeys: PerformanceMetricKey[] = Object.keys(
  SortableResultSchema.shape
) as PerformanceMetricKey[];

export const MetricLabels: Record<PerformanceMetricKey, string> = {
  avg_prompt_tps: "Prompt tokens/s",
  avg_gen_tps: "Generation tokens/s",
  avg_ttft: "Time to First Token (ms)",
  // avg_prompt_tps_watt: "Prompt Tokens Per Second per Watt",
  // avg_joules: "Joules",
  // avg_gen_tps_watt: "Generation Tokens Per Second per Watt",
  performance_score: "LocalScore",
};

export const MetricSortDirection: Record<PerformanceMetricKey, "asc" | "desc"> =
  {
    avg_prompt_tps: "desc",
    avg_gen_tps: "desc",
    avg_ttft: "asc",
    // avg_prompt_tps_watt: "desc",
    // avg_joules: "asc",
    // avg_gen_tps_watt: "desc",
    performance_score: "desc",
  };

export const LeaderboardResultSchema = SortableResultSchema.extend({
  performance_rank: numberOrStringToNumber,
  number_ranked: numberOrStringToNumber,
  accelerator_id: z.string(),
  accelerator_name: z.string(),
  accelerator_type: AcceleratorTypeSchema,
  accelerator_memory_gb: numberOrStringToNumber,
  model_name: z.string(),
  model_quant: z.string(),
  model_id: z.string(),
});

export type LeaderboardResult = z.infer<typeof LeaderboardResultSchema>;

export const PerformanceScoreSchema = z.object({
  model: ModelSchema,
  results: z.array(LeaderboardResultSchema),
});

export const PerformanceScoresSchema = z.array(PerformanceScoreSchema);

export type PerformanceScore = z.infer<typeof PerformanceScoreSchema>;

export type SearchTypes = "model" | "accelerator";

export interface SearchBarOption {
  value: string;
  label: any;
  group: SearchTypes;
  modelName?: string;
  variantId?: string;
  quantization?: string;
  acceleratorId?: string;
  acceleratorName?: string;
  acceleratorType?: AcceleratorType;
  acceleratorMemory?: string;
}

export const SearchResponseSchema = z.object({
  models: z.array(
    z.object({
      name: z.string(),
      quantization: z.string(),
      variantId: z.string(),
      modelId: z.string(),
    })
  ),
  accelerators: z.array(
    z.object({
      name: z.string(),
      memory_gb: z.string(),
      acceleratorId: z.string(),
      type: AcceleratorTypeSchema,
    })
  ),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const SystemSchema = z.object({
  id: z.string(),
  cpu_name: z.string(),
  cpu_arch: z.string(),
  ram_gb: numberOrStringToNumber,
  kernel_type: z.string(),
  kernel_release: z.string(),
  system_version: z.string(),
  created_at: stringOrDateToString,
});

export const RunSchema = z.object({
  id: z.string().uuid(),
  system_id: z.string().uuid(),
  accelerator_id: z.string().uuid(),
  model_variant_id: z.string().uuid(),
  runtime_id: z.string().uuid(),
  run_date: stringOrDateToString,
  created_at: stringOrDateToString,
  accelerator: z.string(),
  accelerator_type: z.string(),
  accelerator_memory_gb: z.string(),
  model: ModelSchema,
  // quantization: z.string(),
  avg_prompt_tps: numberOrStringToNumber,
  avg_gen_tps: numberOrStringToNumber,
  avg_ttft: numberOrStringToNumber,
  performance_score: numberOrStringToNumber,
  system: SystemSchema,
});

export const TestResultSchema = z.object({
  id: z.string().uuid(),
  benchmark_run_id: z.string().uuid(),
  name: z.string(),
  n_prompt: z.number(),
  n_gen: z.number(),
  avg_time_ms: z.number(),
  power_watts: z.number(),
  prompt_tps: z.number(),
  gen_tps: z.number(),
  prompt_tps_watt: z.number(),
  gen_tps_watt: z.number(),
  // vram_used_mb: z.number(),
  ttft_ms: z.number(),
  created_at: z.string(),
});

export const RunsSchemaWithDetailedResults = RunSchema.extend({
  results: z.array(TestResultSchema),
});

export const RunsSchema = z.array(RunSchema);

export type Run = z.infer<typeof RunSchema>;
export type DetailedRun = z.infer<typeof RunsSchemaWithDetailedResults>;
export type System = z.infer<typeof SystemSchema>;

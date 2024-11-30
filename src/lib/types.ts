import { z } from "zod";

export const AcceleratorTypes = ["CPU", "GPU"] as const;
export const AcceleratorTypeSchema = z.enum(AcceleratorTypes);
export type AcceleratorType = (typeof AcceleratorTypes)[number];

const ModelSchema = z.object({
  name: z.string(),
  id: z.string(),
  quant: z.string(),
});

const numberOrStringToNumber = z
  .union([z.string(), z.number(), z.null()])
  .transform((val) => (val ? Number(val) : 0));

export const SortableResultSchema = z.object({
  avg_prompt_tps: numberOrStringToNumber,
  avg_gen_tps: numberOrStringToNumber,
  avg_ttft: numberOrStringToNumber,
  avg_prompt_tps_watt: numberOrStringToNumber,
  avg_joules: numberOrStringToNumber,
  avg_gen_tps_watt: numberOrStringToNumber,
  performance_score: numberOrStringToNumber,
  efficiency_score: numberOrStringToNumber,
});

export type SortableResult = z.infer<typeof SortableResultSchema>;
export type PerformanceMetricKey = keyof z.infer<typeof SortableResultSchema>;
export const sortableResultKeys: PerformanceMetricKey[] = Object.keys(
  SortableResultSchema.shape
) as PerformanceMetricKey[];

export const MetricLabels: Record<PerformanceMetricKey, string> = {
  avg_prompt_tps: "Prompt Tokens Per Second",
  avg_gen_tps: "Generation Tokens Per Second",
  avg_ttft: "Time to First Token (ms)",
  avg_prompt_tps_watt: "Prompt Tokens Per Second per Watt",
  avg_joules: "Joules",
  avg_gen_tps_watt: "Generation Tokens Per Second per Watt",
  performance_score: "Performance Score",
  efficiency_score: "Efficiency Score",
};

export const MetricSortDirection: Record<PerformanceMetricKey, "asc" | "desc"> =
  {
    avg_prompt_tps: "desc",
    avg_gen_tps: "desc",
    avg_ttft: "asc",
    avg_prompt_tps_watt: "desc",
    avg_joules: "asc",
    avg_gen_tps_watt: "desc",
    performance_score: "desc",
    efficiency_score: "desc",
  };

export const LeaderboardResultSchema = SortableResultSchema.extend({
  accelerator_name: z.string(),
  accelerator_type: AcceleratorTypeSchema,
  accelerator_memory_gb: numberOrStringToNumber,
  model_name: z.string(),
  model_quant: z.string(),
  model_id: z.string(),
});

export type LeaderboardResult = z.infer<typeof LeaderboardResultSchema>;

export const PerformanceScoresSchema = z.array(
  z.object({
    model: ModelSchema,
    results: z.array(LeaderboardResultSchema),
  })
);

export type PerformanceScore = z.infer<typeof PerformanceScoresSchema>;

export type SearchTypes = "model" | "accelerator";

export interface SearchBarOption {
  value: string;
  label: string;
  group: SearchTypes;
  modelName?: string;
  quantization?: string;
  acceleratorName?: string;
  acceleratorType?: AcceleratorType;
  acceleratorMemory?: string;
}

export const SearchResponseSchema = z.object({
  models: z.array(
    z.object({
      name: z.string(),
      quantizations: z.array(z.string()),
    })
  ),
  accelerators: z.array(
    z.object({
      name: z.string(),
      memory_gb: z.string(),
    })
  ),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

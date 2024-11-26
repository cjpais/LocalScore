import { z } from "zod";

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
export type SortableResultKeys = keyof z.infer<typeof SortableResultSchema>;
export const sortableResultKeys: SortableResultKeys[] = Object.keys(
  SortableResultSchema.shape
) as SortableResultKeys[];

export const LeaderboardResultSchema = SortableResultSchema.extend({
  accelerator_name: z.string(),
  accelerator_type: z.string(),
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

export interface SearchBarOption {
  value: string;
  label: string;
  group: "model" | "accelerator";
  modelName?: string;
  quantization?: string;
  acceleratorName?: string;
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

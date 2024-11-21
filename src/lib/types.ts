import { z } from "zod";

const ModelSchema = z.object({
  name: z.string(),
  id: z.string(),
  quant: z.string(),
});

export const LeaderboardResultSchema = z.object({
  accelerator_name: z.string(),
  accelerator_type: z.string(),
  accelerator_memory_gb: z.string().transform((val) => Number(val)),
  model_name: z.string(),
  model_quant: z.string(),
  model_id: z.string(),
  avg_prompt_tps: z.string().transform((val) => Number(val)),
  avg_gen_tps: z.string().transform((val) => Number(val)),
  avg_ttft: z.string().transform((val) => Number(val)),
  avg_prompt_tps_watt: z.string().transform((val) => Number(val)),
  avg_joules: z.string().transform((val) => Number(val)),
  avg_gen_tps_watt: z.string().transform((val) => Number(val)),
  performance_score: z.string().transform((val) => Number(val)),
  efficiency_score: z.string().transform((val) => Number(val)),
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

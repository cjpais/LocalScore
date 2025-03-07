import { PerformanceMetricKey, SortDirection } from "./types";

export const MetricLabels: Record<PerformanceMetricKey, string> = {
  avg_prompt_tps: "Prompt tokens/s",
  avg_gen_tps: "Generation tokens/s",
  avg_ttft: "Time to First Token (ms)",
  performance_score: "LocalScore",
};

export const MetricUnits: Record<PerformanceMetricKey, string> = {
  avg_prompt_tps: "tokens/s",
  avg_gen_tps: "tokens/s",
  avg_ttft: "ms",
  performance_score: "LocalScore",
};

export const MetricSortDirection: Record<PerformanceMetricKey, SortDirection> =
  {
    avg_prompt_tps: "desc",
    avg_gen_tps: "desc",
    avg_ttft: "asc",
    performance_score: "desc",
  };

import chroma from "chroma-js";
import { PerformanceMetricKey } from "./types";

export const capitalize = (str: string) => {
  // Check if the input is a string and not empty
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }

  // Capitalize the first letter and concatenate with the rest of the string
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const scale = chroma
  .cubehelix()
  .start(280)
  .rotations(-0.5)
  .gamma(0.8)
  .lightness([0.3, 0.8])
  .scale();

export const getColor = (index: number, max: number = 10) => {
  return scale(index / max).hex();
};

export function formatMetricValue(
  key: PerformanceMetricKey,
  value: number
): { formatted: string; suffix: string | null } {
  switch (key) {
    case "avg_prompt_tps":
      return {
        formatted: value.toFixed(),
        suffix: "tokens/s",
      };

    case "avg_gen_tps":
      return {
        formatted: value > 100 ? value.toFixed() : value.toFixed(1),
        suffix: "tokens/s",
      };

    case "avg_ttft":
      return {
        formatted: value >= 1000 ? (value / 1000).toFixed(2) : value.toFixed(),
        suffix: value >= 1000 ? "sec" : "ms",
      };

    case "performance_score":
      return {
        formatted: value.toFixed(),
        suffix: null,
      };

    default:
      throw new Error(`Unsupported column key: ${key}`);
  }
}

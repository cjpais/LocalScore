import chroma from "chroma-js";
import { PerformanceMetricKey } from "./types";
import { z } from "zod";

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
): { formatted: string; suffix: string | null; simple: string } {
  if (!value) return { formatted: "N/A", suffix: null, simple: "N/A" };
  switch (key) {
    case "avg_prompt_tps":
      return {
        formatted: value.toFixed(),
        suffix: "tokens/s",
        simple: value.toFixed(),
      };

    case "avg_gen_tps":
      return {
        formatted: value > 100 ? value.toFixed() : value.toFixed(1),
        suffix: "tokens/s",
        simple: value > 100 ? value.toFixed() : value.toFixed(1),
      };

    case "avg_ttft":
      return {
        formatted: value >= 1000 ? (value / 1000).toFixed(2) : value.toFixed(),
        suffix: value >= 1000 ? "sec" : "ms",
        simple: value.toFixed(),
      };

    case "performance_score":
      return {
        formatted: value.toFixed(),
        suffix: null,
        simple: value.toFixed(),
      };

    default:
      throw new Error(`Unsupported column key: ${key}`);
  }
}

export const getModelParamsString = (params: number): string => {
  if (params >= 1e12) {
    return (params / 1e12).toFixed(1) + "T";
  } else if (params >= 1e9) {
    return (params / 1e9).toFixed(1) + "B";
  } else {
    return (params / 1e6).toFixed() + "M";
  }
};

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

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { and, avg, count, eq, sql } from "drizzle-orm";
import db from "@/db";
import {
  accelerators,
  benchmarkRuns,
  models,
  modelVariants,
  testResults,
} from "@/db/schema";
import chroma from "chroma-js";

const RequestSchema = z.object({
  model: z.string(),
  quantization: z.string(),
});

interface AcceleratorData {
  acceleratorName: string;
  acceleratorType: string;
  acceleratorMemory: string;
  sampleCount: number;
  avgPromptTokensPerSecond: string | null;
  stdDevPromptTokensPerSecond: number | null;
  avgPromptTokensPerSecondPerWatt: string | null;
  stdDevPromptTokensPerSecondPerWatt: number | null;
  avgGeneratedTokensPerSecond: string | null;
  stdDevGeneratedTokensPerSecond: number | null;
  avgGeneratedTokensPerSecondPerWatt: string | null;
  stdDevGeneratedTokensPerSecondPerWatt: number | null;
  avgTimeToFirstTokenMs: string | null;
  stdDevTimeToFirstTokenMs: number | null;
  avgTime: string | null;
  stdDevTime: number | null;
  avgPower: string | null;
  stdDevPower: number | null;
}

function calculateGeometricMean(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.pow(
    values.reduce((product, value) => product * value, 1),
    1 / values.length
  );
}

function calculatePerformanceGeometricMean(data: AcceleratorData): number {
  const promptTokensPerSecond = parseFloat(
    data.avgPromptTokensPerSecond ?? "0"
  );
  const generatedTokensPerSecond = parseFloat(
    data.avgGeneratedTokensPerSecond ?? "0"
  );
  const timeToFirstTokenMs = data.avgTimeToFirstTokenMs
    ? 1 / parseFloat(data.avgTimeToFirstTokenMs)
    : 0;
  const avgTime = data.avgTime ? 1 / parseFloat(data.avgTime) : 0;

  const values = [
    promptTokensPerSecond,
    generatedTokensPerSecond,
    timeToFirstTokenMs,
    avgTime,
  ];

  // If any value is 0, the geometric mean will be 0
  if (values.some((value) => value === 0)) return 0;

  return calculateGeometricMean(values);
}

function calculateEfficiencyGeometricMean(data: AcceleratorData): number {
  const promptTokensPerSecondPerWatt = parseFloat(
    data.avgPromptTokensPerSecondPerWatt ?? "0"
  );
  const generatedTokensPerSecondPerWatt = parseFloat(
    data.avgGeneratedTokensPerSecondPerWatt ?? "0"
  );

  const values = [
    promptTokensPerSecondPerWatt,
    generatedTokensPerSecondPerWatt,
  ];

  // If any value is 0, the geometric mean will be 0
  if (values.some((value) => value === 0)) return 0;

  return calculateGeometricMean(values);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const data = parsed.data;
  console.log(data);

  // TODO need to do better averages.. Dropping 0's or letting them be NULL
  const result = await db
    .select({
      acceleratorName: accelerators.name,
      acceleratorType: accelerators.type,
      acceleratorMemory: accelerators.memory_gb,
      sampleCount: count(testResults.prompt_tps),
      avgPromptTokensPerSecond: avg(
        sql<number>`CASE WHEN ${testResults.prompt_tps} != 0 THEN ${testResults.prompt_tps} END`
      ),
      stdDevPromptTokensPerSecond: sql<number>`stddev(CASE WHEN ${testResults.prompt_tps} != 0 THEN ${testResults.prompt_tps} END)`,
      avgPromptTokensPerSecondPerWatt: avg(
        sql<number>`CASE WHEN ${testResults.prompt_tps_watt} != 0 THEN ${testResults.prompt_tps_watt} END`
      ),
      stdDevPromptTokensPerSecondPerWatt: sql<number>`stddev(CASE WHEN ${testResults.prompt_tps_watt} != 0 THEN ${testResults.prompt_tps_watt} END)`,
      avgGeneratedTokensPerSecond: avg(
        sql<number>`CASE WHEN ${testResults.gen_tps} != 0 THEN ${testResults.gen_tps} END`
      ),
      stdDevGeneratedTokensPerSecond: sql<number>`stddev(CASE WHEN ${testResults.gen_tps} != 0 THEN ${testResults.gen_tps} END)`,
      avgGeneratedTokensPerSecondPerWatt: avg(
        sql<number>`CASE WHEN ${testResults.gen_tps_watt} != 0 THEN ${testResults.gen_tps_watt} END`
      ),
      stdDevGeneratedTokensPerSecondPerWatt: sql<number>`stddev(CASE WHEN ${testResults.gen_tps_watt} != 0 THEN ${testResults.gen_tps_watt} END)`,
      avgTimeToFirstTokenMs: avg(
        sql<number>`CASE WHEN ${testResults.ttft_ms} != 0 THEN ${testResults.ttft_ms} END`
      ),
      stdDevTimeToFirstTokenMs: sql<number>`stddev(CASE WHEN ${testResults.ttft_ms} != 0 THEN ${testResults.ttft_ms} END)`,
      avgTime: avg(
        sql<number>`CASE WHEN ${testResults.avg_time_ms} != 0 THEN ${testResults.avg_time_ms} END`
      ),
      stdDevTime: sql<number>`stddev(CASE WHEN ${testResults.avg_time_ms} != 0 THEN ${testResults.avg_time_ms} END)`,
      avgPower: avg(
        sql<number>`CASE WHEN ${testResults.power_watts} != 0 THEN ${testResults.power_watts} END`
      ),
      stdDevPower: sql<number>`stddev(CASE WHEN ${testResults.power_watts} != 0 THEN ${testResults.power_watts} END)`,
    })
    .from(models)
    .innerJoin(modelVariants, eq(modelVariants.model_id, models.id))
    .innerJoin(
      benchmarkRuns,
      eq(benchmarkRuns.model_variant_id, modelVariants.id)
    )
    .innerJoin(accelerators, eq(benchmarkRuns.accelerator_id, accelerators.id))
    .innerJoin(testResults, eq(testResults.benchmark_run_id, benchmarkRuns.id))
    .where(
      and(
        eq(models.name, data.model),
        eq(modelVariants.quantization, data.quantization)
      )
    )
    .groupBy(
      accelerators.id,
      accelerators.name,
      accelerators.type,
      accelerators.memory_gb
    );

  const scale = chroma
    .scale(["#ff4f5e", "#fff44f", "54ffbd", "00ffff", "6e008b"])
    .mode("lch")
    .colors(result.length);

  const finalResults = result
    .map((d, i) => ({
      ...d,
      performanceGeometricMean: calculatePerformanceGeometricMean(d) * 1e3,
      efficiencyGeometricMean: calculateEfficiencyGeometricMean(d) * 1e3,
      color: scale[i],
    }))
    .sort((a, b) => b.performanceGeometricMean - a.performanceGeometricMean);

  res.status(200).json(finalResults);
}

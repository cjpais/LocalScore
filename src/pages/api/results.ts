// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from "@/db";
import {
  accelerators,
  benchmarkPerformanceScores,
  benchmarkRuns,
  benchmarkSystems,
  models,
  modelVariants,
} from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get pagination parameters from query
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  let limit = parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE;

  // Enforce limit boundaries
  limit = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, limit));

  // Calculate offset
  const offset = (page - 1) * limit;

  // Get sort direction from query
  const sortDirection = req.query.sortDirection === "asc" ? "asc" : "desc";

  const selected = await db
    .select({
      system: benchmarkSystems,
      benchmarkRun: benchmarkRuns,
      accelerator: accelerators,
      modelVariant: modelVariants,
      model: models,
      avg_prompt_tps: benchmarkPerformanceScores.avg_prompt_tps,
      avg_gen_tps: benchmarkPerformanceScores.avg_gen_tps,
      avg_ttft: benchmarkPerformanceScores.avg_ttft_ms,
      performance_score: benchmarkPerformanceScores.performance_score,
    })
    .from(benchmarkRuns)
    .innerJoin(accelerators, eq(accelerators.id, benchmarkRuns.accelerator_id))
    .innerJoin(
      modelVariants,
      eq(modelVariants.id, benchmarkRuns.model_variant_id)
    )
    .innerJoin(models, eq(models.id, modelVariants.model_id))
    .innerJoin(
      benchmarkSystems,
      eq(benchmarkSystems.id, benchmarkRuns.system_id)
    )
    .innerJoin(
      benchmarkPerformanceScores,
      eq(benchmarkPerformanceScores.benchmark_run_id, benchmarkRuns.id)
    )
    .orderBy(
      sortDirection === "desc"
        ? desc(benchmarkRuns.created_at)
        : asc(benchmarkRuns.created_at)
    )
    .limit(limit)
    .offset(offset);

  // TODO get score too
  const results = selected.map((row) => ({
    ...row.benchmarkRun,
    system: row.system,
    accelerator: row.accelerator.name,
    accelerator_type: row.accelerator.type,
    accelerator_memory_gb: row.accelerator.memory_gb,
    model: row.model.name,
    quantization: row.modelVariant.quantization,
    avg_prompt_tps: parseFloat(row.avg_prompt_tps || "0"),
    avg_gen_tps: parseFloat(row.avg_gen_tps || "0"),
    avg_ttft: parseFloat(row.avg_ttft || "0"),
    performance_score: parseFloat(row.performance_score || "0") * 10,
  }));

  res.status(200).json(results);
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from "@/db";
import {
  accelerators,
  benchmarkRuns,
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
    .select()
    .from(benchmarkRuns)
    .innerJoin(accelerators, eq(accelerators.id, benchmarkRuns.accelerator_id))
    .innerJoin(
      modelVariants,
      eq(modelVariants.id, benchmarkRuns.model_variant_id)
    )
    .innerJoin(models, eq(models.id, modelVariants.model_id))
    .orderBy(
      sortDirection === "desc"
        ? desc(benchmarkRuns.created_at)
        : asc(benchmarkRuns.created_at)
    )
    .limit(limit)
    .offset(offset);

  // TODO get score too
  const results = selected.map((row) => ({
    ...row.benchmark_runs,
    accelerator: row.accelerators.name,
    accelerator_type: row.accelerators.type,
    accelerator_memory_gb: row.accelerators.memory_gb,
    model: row.models.name,
    quantization: row.model_variants.quantization,
  }));

  res.status(200).json(results);
}

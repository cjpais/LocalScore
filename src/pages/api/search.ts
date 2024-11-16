// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from "@/db";
import { accelerators, models, modelVariants } from "@/db/schema";
import { desc, ilike, eq, sql } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q } = req.query;
  if (typeof q !== "string") {
    return res.status(400).json({ error: "Search query required" });
  }

  const searchTerm = `%${q.trim()}%`;

  const modelResults = await db
    .select({
      name: models.name,
      quantizations: sql<string[]>`array_agg(${modelVariants.quantization})`,
    })
    .from(models)
    .leftJoin(modelVariants, eq(models.id, modelVariants.model_id))
    .where(ilike(models.name, searchTerm))
    .groupBy(models.id, models.name)
    .orderBy(desc(models.created_at))
    .limit(10);

  const acceleratorResults = await db
    .select({
      name: accelerators.name,
      memory_gb: accelerators.memory_gb,
    })
    .from(accelerators)
    .where(ilike(accelerators.name, searchTerm))
    .orderBy(desc(accelerators.created_at))
    .limit(10);

  res.status(200).json({
    models: modelResults,
    accelerators: acceleratorResults,
  });
}

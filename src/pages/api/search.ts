// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from "@/db";
import { accelerators, models, modelVariants } from "@/db/schema";
import { desc, ilike, eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q, type } = req.query;
  if (typeof q !== "string") {
    return res.status(400).json({ error: "Search query required" });
  }

  const searchTerm = `%${q.trim()}%`;

  if (type === "model" || !type) {
    const modelResults = await db
      .select({
        name: models.name,
        quantization: modelVariants.quantization,
        variantId: modelVariants.id,
        modelId: models.id,
      })
      .from(models)
      .leftJoin(modelVariants, eq(models.id, modelVariants.model_id))
      .where(ilike(models.name, searchTerm))
      .orderBy(desc(models.created_at))
      .limit(10);

    if (type === "model") {
      return res.status(200).json({ models: modelResults });
    }

    const acceleratorResults = await db
      .select({
        name: accelerators.name,
        memory_gb: accelerators.memory_gb,
      })
      .from(accelerators)
      .where(ilike(accelerators.name, searchTerm))
      .orderBy(desc(accelerators.created_at))
      .limit(10);

    return res.status(200).json({
      models: modelResults,
      accelerators: acceleratorResults,
    });
  }

  if (type === "accelerator") {
    const acceleratorResults = await db
      .select({
        name: accelerators.name,
        memory_gb: accelerators.memory_gb,
      })
      .from(accelerators)
      .where(ilike(accelerators.name, searchTerm))
      .orderBy(desc(accelerators.created_at))
      .limit(10);

    return res.status(200).json({ accelerators: acceleratorResults });
  }

  return res.status(400).json({ error: "Invalid search type" });
}

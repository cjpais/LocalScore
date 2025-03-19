import db from "@/db";
import { accelerators, models, modelVariants } from "@/db/schema";
import { Column, desc, eq, SQL, sql } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

function ilike(column: Column, pattern: string): SQL {
  return sql`${column} LIKE ${pattern} COLLATE NOCASE`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q, type } = req.query;
  if (typeof q !== "string") {
    return res.status(400).json({ error: "Search query required" });
  }

  if (!["model", "accelerator", undefined].includes(type as string)) {
    return res.status(400).json({ error: "Invalid search type" });
  }

  const searchTerm = `%${q.trim()}%`.toLowerCase();

  const result = await db.transaction(async (tx) => {
    const modelResults =
      type === "model" || !type
        ? await tx
            .select({
              name: models.name,
              quant: modelVariants.quantization,
              variantId: modelVariants.id,
              id: models.id,
              params: models.params,
            })
            .from(models)
            .leftJoin(modelVariants, eq(models.id, modelVariants.model_id))
            .where(ilike(models.name, searchTerm))
            .orderBy(desc(models.created_at))
            .limit(10)
        : [];

    const acceleratorResults =
      type === "accelerator" || !type
        ? await tx
            .select({
              id: accelerators.id,
              name: accelerators.name,
              memory_gb: accelerators.memory_gb,
              type: accelerators.type,
              manufacturer: accelerators.manufacturer,
              created_at: accelerators.created_at,
            })
            .from(accelerators)
            .where(ilike(accelerators.name, searchTerm))
            .orderBy(desc(accelerators.created_at))
            .limit(10)
        : [];

    return {
      models: modelResults,
      accelerators: acceleratorResults,
    };
  });

  return res
    .status(200)
    .json(
      type === "model"
        ? { models: result.models }
        : type === "accelerator"
        ? { accelerators: result.accelerators }
        : result
    );
}

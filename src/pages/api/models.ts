// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from "@/db";
import { models, modelVariants } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const results = await db
    .select({
      model: models.name,
      quantization: modelVariants.quantization,
    })
    .from(modelVariants)
    .leftJoin(models, eq(modelVariants.model_id, models.id))
    .orderBy(desc(modelVariants.created_at));

  res.status(200).json(results);
}

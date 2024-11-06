// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from "@/db";
import { models, accelerators } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const results = await db
    .select({
      name: accelerators.name,
      type: accelerators.type,
      memory: accelerators.memory_gb,
      manufacturer: accelerators.manufacturer,
    })
    .from(accelerators)
    .orderBy(desc(accelerators.created_at));

  res.status(200).json(results);
}

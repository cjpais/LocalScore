import db from "@/db";
import {
  getAccelerators,
  getModelVariants,
  getPerformanceScores,
  getTopAcceleratorsByModelVariants,
} from "@/db/queries";
import { acceleratorModelPerformanceScores, accelerators } from "@/db/schema";
import { UniqueAcceleratorSchema, UniqueModelSchema } from "@/lib/types";
import { inArray, sql, eq, and } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const RequestSchema = z.object({
  accelerators: z.array(UniqueAcceleratorSchema).optional(),
  models: z.array(UniqueModelSchema),
  numResults: z.number().optional().default(10),
  numSimilar: z.number().optional().default(0),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const parse = RequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error });
    return;
  }

  const data = parse.data;

  // Get the model variant IDs
  const modelVariants = await getModelVariants(data.models);
  const modelVariantIds = modelVariants.map((mv) => mv.variantId);

  let acceleratorIds = [];
  if (data.accelerators) {
    // Get the accelerator IDs
    acceleratorIds = await getAccelerators(data.accelerators);
  } else {
    // Get the top accelerators for the specified models
    acceleratorIds = await getTopAcceleratorsByModelVariants({
      modelVariantIds,
      numResults: data.numResults,
    });
  }

  // Fetch performance scores for chosen accelerators and models
  const chosenScores = await db
    .select({
      accelerator_id: acceleratorModelPerformanceScores.accelerator_id,
      model_variant_id: acceleratorModelPerformanceScores.model_variant_id,
      performance_score: acceleratorModelPerformanceScores.performance_score,
    })
    .from(acceleratorModelPerformanceScores)
    .where(
      and(
        inArray(
          acceleratorModelPerformanceScores.accelerator_id,
          acceleratorIds
        ),
        inArray(
          acceleratorModelPerformanceScores.model_variant_id,
          modelVariants.map((mv) => mv.variantId)
        )
      )
    );

  // For each chosen score, find similar accelerators
  const similarAcceleratorsPromises = chosenScores.map(async (score) => {
    const { model_variant_id, performance_score } = score;

    // Get accelerators with higher scores
    const higherScores = db
      .select({
        id: accelerators.id,
      })
      .from(accelerators)
      .innerJoin(
        acceleratorModelPerformanceScores,
        eq(accelerators.id, acceleratorModelPerformanceScores.accelerator_id)
      )
      .where(
        and(
          eq(
            acceleratorModelPerformanceScores.model_variant_id,
            model_variant_id as string
          ),
          sql`${acceleratorModelPerformanceScores.performance_score} > ${performance_score}`
        )
      )
      .orderBy(sql`${acceleratorModelPerformanceScores.performance_score} ASC`)
      .limit(data.numSimilar);

    // Get accelerators with lower scores
    const lowerScores = db
      .select({
        id: accelerators.id,
      })
      .from(accelerators)
      .innerJoin(
        acceleratorModelPerformanceScores,
        eq(accelerators.id, acceleratorModelPerformanceScores.accelerator_id)
      )
      .where(
        and(
          eq(
            acceleratorModelPerformanceScores.model_variant_id,
            model_variant_id as string
          ),
          sql`${acceleratorModelPerformanceScores.performance_score} < ${performance_score}`
        )
      )
      .orderBy(sql`${acceleratorModelPerformanceScores.performance_score} DESC`)
      .limit(data.numSimilar);

    const higher = await higherScores;
    const lower = await lowerScores;

    return [...higher, ...lower];
  });

  console.log("HERE");

  const similarAcceleratorLists = await Promise.all(
    similarAcceleratorsPromises
  );
  const similarAccelerators = Array.prototype
    .concat(...similarAcceleratorLists)
    .map((a) => a.id)
    .filter((id, index, self) => self.indexOf(id) === index); // Unique IDs

  // Combine chosen and similar accelerator IDs
  const allAcceleratorIds = [...acceleratorIds, ...similarAccelerators];

  console.log("HERE2");

  // Fetch performance scores for all selected accelerators and models
  try {
    const results = await getPerformanceScores(
      allAcceleratorIds,
      modelVariantIds
    );
    res.status(200).json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred" });
    return;
  }
}

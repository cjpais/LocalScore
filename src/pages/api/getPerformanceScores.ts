import db from "@/db";
import {
  acceleratorModelPerformanceScores,
  accelerators,
  models,
  modelVariants,
} from "@/db/schema";
import { PerformanceScoresSchema } from "@/lib/types";
import { inArray, sql, eq, and } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const AcceleratorSchema = z.object({
  name: z.string(),
  memory: z.string(),
});

const ModelSchema = z.object({
  name: z.string(),
  quantization: z.string(),
});

const RequestSchema = z.object({
  accelerators: z.array(AcceleratorSchema).optional(),
  models: z.array(ModelSchema),
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
  const modelVariantIds = await db
    .select({ id: modelVariants.id })
    .from(modelVariants)
    .innerJoin(models, eq(models.id, modelVariants.model_id))
    .where(
      inArray(
        sql`(${models.name}, ${modelVariants.quantization})`,
        data.models.map((spec) => [spec.name, spec.quantization])
      )
    );

  let acceleratorIds = [];
  if (data.accelerators) {
    // Get the accelerator IDs
    acceleratorIds = await db
      .select({ id: accelerators.id })
      .from(accelerators)
      .where(
        inArray(
          sql`(${accelerators.name}, ${accelerators.memory_gb})`,
          data.accelerators.map((spec) => [spec.name, spec.memory])
        )
      );
  } else {
    // Get the top 100 accelerators for the specified models
    acceleratorIds = await db
      .select({ id: accelerators.id })
      .from(accelerators)
      .innerJoin(
        acceleratorModelPerformanceScores,
        eq(accelerators.id, acceleratorModelPerformanceScores.accelerator_id)
      )
      .where(
        inArray(
          acceleratorModelPerformanceScores.model_variant_id,
          modelVariantIds.map((mv) => mv.id)
        )
      )
      .groupBy(accelerators.id)
      .orderBy(
        sql`AVG(${acceleratorModelPerformanceScores.performance_score}) DESC`
      )
      .limit(data.numResults);
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
          acceleratorIds.map((a) => a.id)
        ),
        inArray(
          acceleratorModelPerformanceScores.model_variant_id,
          modelVariantIds.map((mv) => mv.id)
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
  const allAcceleratorIds = [
    ...acceleratorIds.map((a) => a.id),
    ...similarAccelerators,
  ];

  console.log("HERE2");

  // Fetch performance scores for all selected accelerators and models
  const results = await db
    .select({
      accelerator_name: acceleratorModelPerformanceScores.accelerator_name,
      accelerator_type: acceleratorModelPerformanceScores.accelerator_type,
      accelerator_memory_gb:
        acceleratorModelPerformanceScores.accelerator_memory_gb,
      model_name: acceleratorModelPerformanceScores.model_name,
      model_quant: acceleratorModelPerformanceScores.model_variant_quant,
      model_id: acceleratorModelPerformanceScores.model_variant_id,
      avg_prompt_tps: acceleratorModelPerformanceScores.avg_prompt_tps,
      avg_gen_tps: acceleratorModelPerformanceScores.avg_gen_tps,
      avg_ttft: acceleratorModelPerformanceScores.avg_ttft,
      avg_prompt_tps_watt:
        acceleratorModelPerformanceScores.avg_prompt_tps_watt,
      avg_joules: acceleratorModelPerformanceScores.avg_joules,
      avg_gen_tps_watt: acceleratorModelPerformanceScores.avg_gen_tps_watt,
      performance_score: acceleratorModelPerformanceScores.performance_score,
      efficiency_score: acceleratorModelPerformanceScores.efficiency_score,
    })
    .from(acceleratorModelPerformanceScores)
    .where(
      and(
        inArray(
          acceleratorModelPerformanceScores.accelerator_id,
          allAcceleratorIds
        ),
        inArray(
          acceleratorModelPerformanceScores.model_variant_id,
          modelVariantIds.map((mv) => mv.id)
        )
      )
    )
    .orderBy(sql`${acceleratorModelPerformanceScores.performance_score} DESC`);

  console.log("HERE3");

  // Group the results by model id
  const groupedResults = Object.values(
    results.reduce((acc, curr) => {
      if (curr.model_id) {
        if (!acc[curr.model_id]) {
          acc[curr.model_id] = {
            model: {
              name: curr.model_name,
              id: curr.model_id,
              quant: curr.model_quant,
            },
            results: [],
          };
        }
        acc[curr.model_id].results.push({
          ...curr,
          performance_score: (parseFloat(curr.performance_score || "0") * 10)
            .toFixed()
            .toString(),
          efficiency_score: (parseFloat(curr.efficiency_score || "0") * 10)
            .toFixed(2)
            .toString(),
        });
      }
      return acc;
    }, {} as Record<string, { model: { name: string | null; id: string; quant: string | null }; results: typeof results }>)
  );

  const validatedResults = PerformanceScoresSchema.safeParse(groupedResults);
  if (!validatedResults.success) {
    res.status(500).json({ error: validatedResults.error });
    return;
  }

  res.status(200).json(validatedResults.data);
}

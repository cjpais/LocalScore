// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from "@/db";
import {
  accelerators,
  benchmarkRuns,
  benchmarkSystems,
  models,
  modelVariants,
  runtimes,
  testResults,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const GetSingleResultSchema = z.object({
  id: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const parse = GetSingleResultSchema.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: parse.error });
    return;
  }

  const { id } = parse.data;

  const results = await db
    .select({
      benchmarkRun: benchmarkRuns,
      system: benchmarkSystems,
      accelerator: accelerators,
      modelVariant: modelVariants,
      model: models,
      runtime: runtimes,
      testResults: sql`json_agg(${testResults})`,
    })
    .from(benchmarkRuns)
    .innerJoin(
      benchmarkSystems,
      eq(benchmarkSystems.id, benchmarkRuns.system_id)
    )
    .innerJoin(accelerators, eq(accelerators.id, benchmarkRuns.accelerator_id))
    .innerJoin(
      modelVariants,
      eq(modelVariants.id, benchmarkRuns.model_variant_id)
    )
    .innerJoin(models, eq(models.id, modelVariants.model_id))
    .innerJoin(runtimes, eq(runtimes.id, benchmarkRuns.runtime_id))
    .leftJoin(testResults, eq(testResults.benchmark_run_id, benchmarkRuns.id))
    .where(eq(benchmarkRuns.id, id))
    .groupBy(
      benchmarkRuns.id,
      benchmarkSystems.id,
      accelerators.id,
      modelVariants.id,
      models.id,
      runtimes.id
    );
  // .groupBy(benchmarkRuns.id);

  console.log(results);

  const selected = results[0];
  if (!selected) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const result = {
    ...selected.benchmarkRun,
    system: selected.system,
    accelerator: selected.accelerator,
    model: { ...selected.modelVariant, ...selected.model },
    runtime: selected.runtime,
    results: selected.testResults,
  };

  res.status(200).json(result);
}

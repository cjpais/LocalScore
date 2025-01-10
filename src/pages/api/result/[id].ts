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

// TODO simplify everything here. the query can be much simpler with the new view that we have.
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
      avg_prompt_tps: sql`AVG(${testResults.prompt_tps})`,
      avg_gen_tps: sql`AVG(${testResults.gen_tps})`,
      avg_ttft: sql`AVG(${testResults.ttft_ms})`,
      performance_score: sql`POWER(
        AVG(${testResults.prompt_tps}) * 
        AVG(${testResults.gen_tps}) * 
        (1000.0 / COALESCE(NULLIF(AVG(${testResults.ttft_ms}), 0), 1)), 
        1.0/3.0
      ) * 10.0`,
      avg_prompt_tps_watt: sql`AVG(${testResults.prompt_tps_watt})`,
      avg_gen_tps_watt: sql`AVG(${testResults.gen_tps_watt})`,
      avg_time_power: sql`AVG(${testResults.avg_time_ms} * ${testResults.power_watts})`,
      efficiency_score: sql`POWER(
        AVG(${testResults.prompt_tps_watt}) * 
        AVG(${testResults.gen_tps_watt}) * 
        (1000.0 / COALESCE(NULLIF(AVG(${testResults.avg_time_ms} * ${testResults.power_watts}), 0), 1)), 
        1.0/3.0
      ) * 10.0`,
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
    avg_prompt_tps: selected.avg_prompt_tps,
    avg_gen_tps: selected.avg_gen_tps,
    avg_ttft: selected.avg_ttft,
    performance_score: selected.performance_score,
    avg_prompt_tps_watt: selected.avg_prompt_tps_watt,
    avg_gen_tps_watt: selected.avg_gen_tps_watt,
    avg_joules: selected.avg_time_power,
    efficiency_score: selected.efficiency_score,
  };

  res.status(200).json(result);
}

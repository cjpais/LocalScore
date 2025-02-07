// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  accelerators,
  benchmarkRuns,
  models,
  modelVariants,
  testResults,
} from "@/db/schema";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import db from "@/db";

const RequestSchema = z.object({
  accelerator: z.string(),
  memory: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const data = parsed.data;

  const acceleratorResults = await db
    .select({
      accelerator: {
        id: accelerators.id,
        name: accelerators.name,
        memory_gb: accelerators.memory_gb,
      },
      model: {
        id: models.id,
        name: models.name,
      },
      modelVariant: {
        id: modelVariants.id,
        quantization: modelVariants.quantization,
      },
      testResults: {
        avg_time_ms: testResults.avg_time_ms,
        power_watts: testResults.power_watts,
        tokens_per_second: testResults.prompt_tps,
        tokens_per_second_per_watt: testResults.prompt_tps_watt,
        vram_used_mb: testResults.vram_used_mb,
        time_to_first_token_ms: testResults.ttft_ms,
      },
    })
    .from(accelerators)
    .innerJoin(benchmarkRuns, eq(benchmarkRuns.accelerator_id, accelerators.id))
    .innerJoin(
      modelVariants,
      eq(benchmarkRuns.model_variant_id, modelVariants.id)
    )
    .innerJoin(models, eq(modelVariants.model_id, models.id))
    .innerJoin(testResults, eq(testResults.benchmark_run_id, benchmarkRuns.id))
    .where(
      and(
        eq(accelerators.name, data.accelerator),
        eq(accelerators.memory_gb, data.memory)
      )
    )
    .groupBy(
      accelerators.id,
      models.id,
      modelVariants.id,
      testResults.avg_time_ms,
      testResults.power_watts,
      testResults.prompt_tps,
      testResults.prompt_tps_watt,
      testResults.vram_used_mb,
      testResults.ttft_ms
    );

  res.status(200).json(acceleratorResults);
}

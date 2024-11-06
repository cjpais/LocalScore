// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from "@/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  accelerators,
  benchmarkRuns,
  benchmarkSystems,
  models,
  modelVariants,
  runtimes,
  testResults,
} from "@/db/schema";
import { sql } from "drizzle-orm";

const AcceleratorTypeEnum = z.enum(["CPU", "GPU", "TPU"]);

const SystemInfoSchema = z.object({
  cpu_name: z.string(),
  cpu_architecture: z.string(),
  ram_gb: z.number(),
  kernel_type: z.string(),
  kernel_release: z.string(),
  system_version: z.string(),
  system_architecture: z.string(),
});

const AcceleratorSchema = z.object({
  name: z.string(),
  type: AcceleratorTypeEnum,
  memory_gb: z.number(),
  manufacturer: z.string().nullable(),
});

const ModelSchema = z.object({
  name: z.string(),
  quantization: z.string(),
});

const RuntimeSchema = z.object({
  name: z.string(),
  version: z.string().nullable(),
  commit_hash: z.string().nullable(),
  release_date: z.string().nullable(),
});

const TestInfoSchema = z.object({
  model: ModelSchema,
  runtime: RuntimeSchema,
});

const TestResultSchema = z.object({
  test_name: z.string().max(255),
  prompt_length: z.number().int(),
  generation_length: z.number().int(),
  avg_time_ms: z.number().transform((v) => v.toString()),
  power_watts: z.number().transform((v) => v.toString()),
  prompt_tokens_per_second: z.number().transform((v) => v.toString()),
  prompt_tokens_per_second_per_watt: z.number().transform((v) => v.toString()),
  generated_tokens_per_second: z.number().transform((v) => v.toString()),
  generated_tokens_per_second_per_watt: z
    .number()
    .transform((v) => v.toString()),
  context_window_size: z.number().int(),
  vram_used_mb: z.number().transform((v) => v.toString()),
  time_to_first_token_ms: z.number().transform((v) => v.toString()),
});

const StoreBenchmarkResultsRequestSchema = z.object({
  system_info: SystemInfoSchema,
  accelerator: AcceleratorSchema,
  test_info: TestInfoSchema,
  benchmark_results: z.array(TestResultSchema),
});

function ensureSingleResult<T>(results: T[]): T {
  if (results.length !== 1) {
    throw new Error(`Expected exactly one result, but got ${results.length}`);
  }
  return results[0];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const parse = StoreBenchmarkResultsRequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error });
    return;
  }

  const data = parse.data;

  await db.transaction(async (tx) => {
    // const accelerator_id

    try {
      // insert the system
      const sysResult = await tx
        .insert(benchmarkSystems)
        .values({
          id: uuidv4(),
          ...data.system_info,
        })
        .returning();
      const system = ensureSingleResult(sysResult);

      // insert or get the accelerator
      const accelResult = await tx
        .insert(accelerators)
        .values({
          id: uuidv4(),
          name: data.accelerator.name,
          type: data.accelerator.type,
          memory_gb: data.accelerator.memory_gb.toString(), // TODO need to decide on type
          manufacturer: data.accelerator.manufacturer,
        })
        .onConflictDoUpdate({
          target: [
            accelerators.name,
            accelerators.type,
            accelerators.memory_gb,
          ],
          set: {
            id: sql`${accelerators.id}`,
          },
        })
        .returning();

      const accelerator = ensureSingleResult(accelResult);

      // insert or get the model
      const modelResult = await tx
        .insert(models)
        .values({
          id: uuidv4(),
          name: data.test_info.model.name,
        })
        .onConflictDoUpdate({
          target: models.name,
          set: {
            id: sql`${models.id}`,
          },
        })
        .returning();
      const model = ensureSingleResult(modelResult);

      console.log(
        "inserting variant with id ",
        model.id,
        " and quantization ",
        data.test_info.model.quantization
      );

      const modelVariantResult = await tx
        .insert(modelVariants)
        .values({
          id: uuidv4(),
          model_id: model.id,
          quantization: data.test_info.model.quantization,
        })
        .onConflictDoUpdate({
          target: [modelVariants.model_id, modelVariants.quantization],
          set: {
            id: sql`${modelVariants.id}`,
          },
        })
        .returning();
      const modelVariant = ensureSingleResult(modelVariantResult);

      const runtimeResult = await tx
        .insert(runtimes)
        .values({
          id: uuidv4(),
          ...data.test_info.runtime,
        })
        .onConflictDoUpdate({
          target: [runtimes.name, runtimes.version, runtimes.commit_hash],
          set: {
            id: sql`${runtimes.id}`,
          },
        })
        .returning();
      const runtime = ensureSingleResult(runtimeResult);

      const benchmarkRunResult = await tx
        .insert(benchmarkRuns)
        .values({
          id: uuidv4(),
          system_id: system.id,
          accelerator_id: accelerator.id,
          model_variant_id: modelVariant.id,
          runtime_id: runtime.id,
          run_date: new Date(),
        })
        .returning();
      const benchmarkRun = ensureSingleResult(benchmarkRunResult);

      const insertResults = data.benchmark_results.map((result) => ({
        id: uuidv4(),
        benchmark_run_id: benchmarkRun.id,
        ...result,
      }));

      await tx.insert(testResults).values(insertResults);

      console.log("system", system);
      console.log("accelerator", accelerator);
      console.log("model", model);
      console.log("modelVariant", modelVariant);
      console.log("runtime", runtime);
      console.log("benchmarkRun", benchmarkRun);
    } catch (e) {
      console.log("error", e);
      res.status(500).json({ error: e });
    }
  });

  res.status(200).json(parse.data);
}

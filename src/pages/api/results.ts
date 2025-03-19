// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getBenchmarkResults, updatePerformanceScores } from "@/db/queries";
import db from "@/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
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

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

const AcceleratorTypeEnum = z.enum(["CPU", "GPU", "TPU"]);

const SystemInfoSchema = z.object({
  cpu_name: z.string(),
  cpu_arch: z.string(),
  ram_gb: z.number(),
  kernel_type: z.string(),
  kernel_release: z.string(),
  version: z.string(),
});

const AcceleratorSchema = z.object({
  name: z.string(),
  type: AcceleratorTypeEnum,
  memory_gb: z.number(),
  manufacturer: z.string().nullable(),
});

const RuntimeSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  commit: z.string().optional(),
});

const TestResultSchema = z.object({
  name: z.string().max(255),
  model_name: z.string().max(255).min(1),
  model_quant_str: z.string().max(255).min(1),
  model_params_str: z.string().max(255).min(1),
  model_n_params: z.number().int(),
  n_prompt: z.number().int(),
  n_gen: z.number().int(),
  avg_time_ms: z.number(),
  prompt_tps: z.number(),
  prompt_tps_watt: z.number(),
  gen_tps: z.number(),
  gen_tps_watt: z.number(),
  power_watts: z.number(),
  ttft_ms: z.number(),
});

const TestResultSummarySchema = z.object({
  avg_prompt_tps: z.number(),
  avg_gen_tps: z.number(),
  avg_ttft_ms: z.number(),
  performance_score: z.number(),
});

const StoreBenchmarkResultsRequestSchema = z
  .object({
    system_info: SystemInfoSchema,
    accelerator_info: AcceleratorSchema,
    runtime_info: RuntimeSchema,
    results_summary: TestResultSummarySchema,
    results: z.array(TestResultSchema).min(1),
  })
  .refine((data) => {
    if (data.results.length === 0) return true;
    const firstResult = data.results[0];
    return data.results.every(
      (result) =>
        result.model_name === firstResult.model_name &&
        result.model_quant_str === firstResult.model_quant_str &&
        result.model_params_str === firstResult.model_params_str &&
        result.model_n_params === firstResult.model_n_params
    );
  }, "All results must have the same model_name, model_quant_str, model_n_params, and model_params_str");

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
  switch (req.method) {
    case "GET":
      return GET(req, res);
    case "POST":
      return POST(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function GET(req: NextApiRequest, res: NextApiResponse) {
  // Get pagination parameters from query
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  let limit = parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE;

  // Enforce limit boundaries
  limit = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, limit));

  // Calculate offset
  const offset = (page - 1) * limit;

  // Get sort direction from query
  const sortDirection = req.query.sortDirection === "asc" ? "asc" : "desc";

  const results = await getBenchmarkResults({ sortDirection, limit, offset });

  res.status(200).json(results);
}

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const parse = StoreBenchmarkResultsRequestSchema.safeParse(req.body);
  if (!parse.success) {
    console.log("parse error", parse.error);
    res.status(400).json({ error: parse.error });
    return;
  }

  const data = parse.data;

  const modelName = data.results[0].model_name;
  const modelParams = data.results[0].model_n_params;
  const modelQuantStr = data.results[0].model_quant_str;

  const benchmarkRunUuid = await db.transaction(async (tx) => {
    // const accelerator_id

    try {
      // insert the system
      const sysResult = await tx
        .insert(benchmarkSystems)
        .values({
          ...data.system_info,
          system_version: data.system_info.version,
        })
        .onConflictDoUpdate({
          target: [
            benchmarkSystems.cpu_name,
            benchmarkSystems.cpu_arch,
            benchmarkSystems.ram_gb,
            benchmarkSystems.kernel_type,
            benchmarkSystems.kernel_release,
            benchmarkSystems.system_version,
          ],
          set: {
            id: sql`${benchmarkSystems.id}`,
          },
        })
        .returning();
      const system = ensureSingleResult(sysResult);

      // insert or get the accelerator
      const accelResult = await tx
        .insert(accelerators)
        .values({
          name: data.accelerator_info.name,
          type: data.accelerator_info.type,
          memory_gb: data.accelerator_info.memory_gb,
          manufacturer: data.accelerator_info.manufacturer,
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

      const runtimeResult = await tx
        .insert(runtimes)
        .values({
          ...data.runtime_info,
          commit_hash: data.runtime_info.commit,
        })
        .onConflictDoUpdate({
          target: [runtimes.name, runtimes.version, runtimes.commit_hash],
          set: {
            id: sql`${runtimes.id}`,
          },
        })
        .returning();
      const runtime = ensureSingleResult(runtimeResult);

      // insert or get the model
      const modelResult = await tx
        .insert(models)
        .values({
          name: modelName,
          params: modelParams,
        })
        .onConflictDoUpdate({
          target: models.name,
          set: {
            id: sql`${models.id}`,
          },
        })
        .returning();
      const model = ensureSingleResult(modelResult);

      const modelVariantResult = await tx
        .insert(modelVariants)
        .values({
          model_id: model.id,
          quantization: modelQuantStr,
        })
        .onConflictDoUpdate({
          target: [modelVariants.model_id, modelVariants.quantization],
          set: {
            id: sql`${modelVariants.id}`,
          },
        })
        .returning();
      const modelVariant = ensureSingleResult(modelVariantResult);

      const benchmarkRunResult = await tx
        .insert(benchmarkRuns)
        .values({
          system_id: system.id,
          accelerator_id: accelerator.id,
          model_variant_id: modelVariant.id,
          runtime_id: runtime.id,
          avg_prompt_tps: data.results_summary.avg_prompt_tps,
          avg_gen_tps: data.results_summary.avg_gen_tps,
          avg_ttft_ms: data.results_summary.avg_ttft_ms,
          performance_score: data.results_summary.performance_score,
        })
        .returning();
      const benchmarkRun = ensureSingleResult(benchmarkRunResult);

      const insertResults = data.results.map((result) => ({
        benchmark_run_id: benchmarkRun.id,
        ...result,
      }));

      await tx.insert(testResults).values(insertResults);

      // update the performance scores table
      await updatePerformanceScores(tx, model, modelVariant, accelerator);

      return benchmarkRun.id;
    } catch (e) {
      console.log("error", e);
      res.status(500).json({ error: e });
    }
  });

  res.status(200).json({ id: benchmarkRunUuid });
}

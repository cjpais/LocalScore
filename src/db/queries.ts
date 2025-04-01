import {
  AcceleratorSchema,
  PerformanceScoresSchema,
  Run,
  RunsSchema,
  RunsSchemaWithDetailedResults,
  SortDirection,
  UniqueAccelerator,
  UniqueModel,
} from "@/lib/types";
import db from ".";
import {
  acceleratorModelPerformanceScores,
  accelerators,
  benchmarkRuns,
  benchmarkSystems,
  DbAccelerator,
  DbModel,
  DbModelVariant,
  models,
  modelVariants,
  runtimes,
  testResults,
} from "./schema";
import {
  inArray,
  sql,
  eq,
  DrizzleError,
  and,
  asc,
  desc,
  isNotNull,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import { z, ZodError } from "zod";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ResultSet } from "@libsql/client";

export const getModelVariants = async (filters: UniqueModel[]) => {
  const result = await db
    .select({
      variantId: modelVariants.id,
      modelId: models.id,
      modelName: models.name,
      modelParams: models.params,
    })
    .from(modelVariants)
    .innerJoin(models, eq(modelVariants.model_id, models.id))
    .where(
      inArray(
        sql`(${models.name}, ${modelVariants.quantization})`,
        filters.map((spec) => [spec.name, spec.quant])
      )
    );

  return result;
};

export const getAccelerators = async (filters: UniqueAccelerator[]) => {
  const result = await db
    .select({ id: accelerators.id })
    .from(accelerators)
    .where(
      inArray(
        sql`(${accelerators.name}, ${accelerators.memory_gb})`,
        filters.map((spec) => [spec.name, spec.memory])
      )
    );

  return result.map((row) => row.id);
};

export const getAcceleratorsById = async (ids: number[] | number) => {
  const idArray = Array.isArray(ids) ? ids : [ids];
  const result = await db
    .select()
    .from(accelerators)
    .where(inArray(accelerators.id, idArray));

  const parsed = z.array(AcceleratorSchema).parse(result);
  return idArray.length === 1 ? parsed[0] : parsed;
};

export const getTopAcceleratorsByModelVariants = async ({
  modelVariantIds,
  numResults,
}: {
  modelVariantIds: number[];
  numResults?: number;
}) => {
  const query = db
    .select({ id: accelerators.id })
    .from(accelerators)
    .innerJoin(
      acceleratorModelPerformanceScores,
      eq(accelerators.id, acceleratorModelPerformanceScores.accelerator_id)
    )
    .where(
      inArray(
        acceleratorModelPerformanceScores.model_variant_id,
        modelVariantIds
      )
    )
    .groupBy(accelerators.id)
    .orderBy(
      sql`AVG(${acceleratorModelPerformanceScores.performance_score}) DESC`
    );

  const acceleratorIds = numResults
    ? await query.limit(numResults)
    : await query;

  return acceleratorIds.map((row) => row.id);
};
export const getPerforamanceModelVariantsByAcceleratorId = async function (
  acceleratorId: number
): Promise<number[]> {
  return await db
    .select({
      model_variant_id: acceleratorModelPerformanceScores.model_variant_id,
    })
    .from(acceleratorModelPerformanceScores)
    .where(
      and(
        eq(acceleratorModelPerformanceScores.accelerator_id, acceleratorId),
        isNotNull(acceleratorModelPerformanceScores.model_variant_id)
      )
    )
    .then((results) =>
      results
        .filter(
          (result): result is { model_variant_id: number } =>
            result.model_variant_id !== null
        )
        .map((result) => result.model_variant_id)
    );
};

export async function getAcceleratorsPerformanceByModelVariant(
  modelVariantId: number,
  options: {
    topCount?: number;
    bottomCount?: number;
    medianCount?: number;
  } = {
    topCount: 2,
    bottomCount: 2,
    medianCount: 2,
  }
): Promise<number[]> {
  // Set defaults if not provided
  const { topCount = 0, bottomCount = 0, medianCount = 0 } = options;

  // Return early if no results are requested
  if (topCount === 0 && bottomCount === 0 && medianCount === 0) {
    return [];
  }

  // Fetch all relevant scores for the model variant in a single query
  const allScores = await db
    .select({
      accelerator_id: acceleratorModelPerformanceScores.accelerator_id,
      performance_score: acceleratorModelPerformanceScores.performance_score,
    })
    .from(acceleratorModelPerformanceScores)
    .where(
      eq(acceleratorModelPerformanceScores.model_variant_id, modelVariantId)
    )
    .orderBy(acceleratorModelPerformanceScores.performance_score);

  if (allScores.length === 0) {
    return [];
  }

  const result: number[] = [];

  // Add bottom-performing accelerator IDs
  if (bottomCount > 0) {
    const bottomIds = allScores
      .slice(0, bottomCount)
      .map((score) => score.accelerator_id);
    result.push(...bottomIds);
  }

  // Add median-performing accelerator IDs
  if (medianCount > 0) {
    const medianStartIndex = Math.floor((allScores.length - medianCount) / 2);
    const medianIds = allScores
      .slice(medianStartIndex, medianStartIndex + medianCount)
      .map((score) => score.accelerator_id);
    result.push(...medianIds);
  }

  // Add top-performing accelerator IDs
  if (topCount > 0) {
    const topIds = allScores
      .slice(-topCount)
      .reverse()
      .map((score) => score.accelerator_id);
    result.push(...topIds);
  }

  // remove any duplicates
  const uniqueResults = new Set(result);

  // turn the set into an array
  return Array.from(uniqueResults);
}

export const getPerformanceScores = async (
  acceleratorIds: number[],
  modelVariantIds: number[]
) => {
  try {
    // First, get all model information for the requested variant IDs
    const { modelInfo, rankings, performanceScores } = await db.transaction(
      async (tx) => {
        // Query 1: Get model information
        const modelInfo = await tx
          .select({
            model_id: models.id,
            model_name: models.name,
            model_params: models.params,
            variant_id: modelVariants.id,
            model_quant: modelVariants.quantization,
          })
          .from(modelVariants)
          .innerJoin(models, eq(modelVariants.model_id, models.id))
          .where(inArray(modelVariants.id, modelVariantIds));

        // Query 2: Get rankings
        const rankings = await tx
          .select({
            model_variant_id:
              acceleratorModelPerformanceScores.model_variant_id,
            accelerator_id: acceleratorModelPerformanceScores.accelerator_id,
            performance_rank: sql`RANK() OVER (
            PARTITION BY ${acceleratorModelPerformanceScores.model_variant_id}
            ORDER BY ${acceleratorModelPerformanceScores.performance_score} DESC
          )`,
            number_ranked: sql`COUNT(*) OVER (
            PARTITION BY ${acceleratorModelPerformanceScores.model_variant_id}
          )`,
          })
          .from(acceleratorModelPerformanceScores)
          .where(
            inArray(
              acceleratorModelPerformanceScores.model_variant_id,
              modelVariantIds
            )
          );

        // Query 3: Get performance scores
        const performanceScores = await tx
          .select({
            accelerator_id: acceleratorModelPerformanceScores.accelerator_id,
            accelerator_name:
              acceleratorModelPerformanceScores.accelerator_name,
            accelerator_type:
              acceleratorModelPerformanceScores.accelerator_type,
            accelerator_memory_gb:
              acceleratorModelPerformanceScores.accelerator_memory_gb,
            model_variant_id:
              acceleratorModelPerformanceScores.model_variant_id,
            avg_prompt_tps: acceleratorModelPerformanceScores.avg_prompt_tps,
            avg_gen_tps: acceleratorModelPerformanceScores.avg_gen_tps,
            avg_ttft: acceleratorModelPerformanceScores.avg_ttft,
            performance_score:
              acceleratorModelPerformanceScores.performance_score,
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
                modelVariantIds
              )
            )
          )
          .orderBy(
            sql`${acceleratorModelPerformanceScores.performance_score} DESC`
          );

        // Return all results
        return {
          modelInfo,
          rankings,
          performanceScores,
        };
      }
    );

    // Create base result structure from model info
    const groupedResults = modelInfo.map((info) => ({
      model: {
        name: info.model_name,
        id: info.model_id,
        variantId: info.variant_id,
        quant: info.model_quant,
        params: info.model_params,
      },
      results: performanceScores
        .filter((score) => score.model_variant_id === info.variant_id)
        .map((score) => ({
          ...score,
          accelerator: {
            id: score.accelerator_id,
            name: score.accelerator_name,
            type: score.accelerator_type,
            memory_gb: score.accelerator_memory_gb,
            manufacturer: null,
            created_at: null,
          },
          performance_score: score.performance_score || 0,
          performance_rank: rankings.find(
            (rank) =>
              rank.model_variant_id === score.model_variant_id &&
              rank.accelerator_id === score.accelerator_id
          )?.performance_rank,
          number_ranked: rankings.find(
            (rank) =>
              rank.model_variant_id === score.model_variant_id &&
              rank.accelerator_id === score.accelerator_id
          )?.number_ranked,
        })),
    }));

    // Validate results
    const validatedResults = PerformanceScoresSchema.safeParse(groupedResults);

    if (!validatedResults.success) {
      throw validatedResults.error;
    }

    return validatedResults.data;
  } catch (error) {
    if (error instanceof DrizzleError) {
      throw new Error(`Database error: ${error.message}`);
    } else if (error instanceof ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    } else {
      throw new Error(
        `Unexpected error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
};

export const getModelVariantComparisonScores = async (
  modelVariantId: number,
  acceleratorId: number,
  options = {
    topN: 3, // Show top 3 performers
    bottomN: 3, // Show bottom 3 performers
    adjacentN: 1, // Show 1 score above and 1 below
  }
) => {
  try {
    const { modelInfo, rankings, performanceScores } = await db.transaction(
      async (tx) => {
        // Query 1: Get model information
        const modelInfo = await tx
          .select({
            model_id: models.id,
            model_name: models.name,
            model_params: models.params,
            variant_id: modelVariants.id,
            model_quant: modelVariants.quantization,
          })
          .from(modelVariants)
          .innerJoin(models, eq(modelVariants.model_id, models.id))
          .where(eq(modelVariants.id, modelVariantId));

        if (modelInfo.length === 0) {
          throw new Error(`Model variant with ID ${modelVariantId} not found`);
        }

        // Query 2: Get the target score
        const targetScoreQuery = await tx
          .select({
            performance_score:
              acceleratorModelPerformanceScores.performance_score,
          })
          .from(acceleratorModelPerformanceScores)
          .where(
            and(
              eq(
                acceleratorModelPerformanceScores.model_variant_id,
                modelVariantId
              ),
              eq(
                acceleratorModelPerformanceScores.accelerator_id,
                acceleratorId
              )
            )
          )
          .limit(1);

        const targetScore = targetScoreQuery[0]?.performance_score;

        // Build a list of relevant accelerator IDs to fetch
        const relevantAcceleratorIds = new Set([acceleratorId]);

        if (targetScore !== undefined && targetScore !== null) {
          // Get accelerators with scores just above the target
          const higherScores = await tx
            .select({
              id: acceleratorModelPerformanceScores.accelerator_id,
            })
            .from(acceleratorModelPerformanceScores)
            .where(
              and(
                eq(
                  acceleratorModelPerformanceScores.model_variant_id,
                  modelVariantId
                ),
                sql`${acceleratorModelPerformanceScores.performance_score} > ${targetScore}`
              )
            )
            .orderBy(
              sql`${acceleratorModelPerformanceScores.performance_score} ASC`
            )
            .limit(options.adjacentN);

          // Get accelerators with scores just below the target
          const lowerScores = await tx
            .select({
              id: acceleratorModelPerformanceScores.accelerator_id,
            })
            .from(acceleratorModelPerformanceScores)
            .where(
              and(
                eq(
                  acceleratorModelPerformanceScores.model_variant_id,
                  modelVariantId
                ),
                sql`${acceleratorModelPerformanceScores.performance_score} < ${targetScore}`
              )
            )
            .orderBy(
              sql`${acceleratorModelPerformanceScores.performance_score} DESC`
            )
            .limit(options.adjacentN);

          // Add adjacent IDs to our set
          higherScores.forEach((score) => relevantAcceleratorIds.add(score.id));
          lowerScores.forEach((score) => relevantAcceleratorIds.add(score.id));
        }

        // Get top N accelerators by performance
        const topScores = await tx
          .select({
            id: acceleratorModelPerformanceScores.accelerator_id,
          })
          .from(acceleratorModelPerformanceScores)
          .where(
            eq(
              acceleratorModelPerformanceScores.model_variant_id,
              modelVariantId
            )
          )
          .orderBy(
            sql`${acceleratorModelPerformanceScores.performance_score} DESC`
          )
          .limit(options.topN);

        // Get bottom N accelerators by performance
        const bottomScores = await tx
          .select({
            id: acceleratorModelPerformanceScores.accelerator_id,
          })
          .from(acceleratorModelPerformanceScores)
          .where(
            eq(
              acceleratorModelPerformanceScores.model_variant_id,
              modelVariantId
            )
          )
          .orderBy(
            sql`${acceleratorModelPerformanceScores.performance_score} ASC`
          )
          .limit(options.bottomN);

        // Add top and bottom IDs to our set
        topScores.forEach((score) => relevantAcceleratorIds.add(score.id));
        bottomScores.forEach((score) => relevantAcceleratorIds.add(score.id));

        // Convert Set to Array for use in SQL query
        const acceleratorIdsArray = Array.from(relevantAcceleratorIds);

        // Get rankings for all scores in this model variant
        const rankings = await tx
          .select({
            model_variant_id:
              acceleratorModelPerformanceScores.model_variant_id,
            accelerator_id: acceleratorModelPerformanceScores.accelerator_id,
            performance_rank: sql`RANK() OVER (
              PARTITION BY ${acceleratorModelPerformanceScores.model_variant_id}
              ORDER BY ${acceleratorModelPerformanceScores.performance_score} DESC
            )`,
            number_ranked: sql`COUNT(*) OVER (
              PARTITION BY ${acceleratorModelPerformanceScores.model_variant_id}
            )`,
          })
          .from(acceleratorModelPerformanceScores)
          .where(
            eq(
              acceleratorModelPerformanceScores.model_variant_id,
              modelVariantId
            )
          );

        // Get performance details for all relevant accelerators
        const performanceScores = await tx
          .select({
            accelerator_id: acceleratorModelPerformanceScores.accelerator_id,
            accelerator_name:
              acceleratorModelPerformanceScores.accelerator_name,
            accelerator_type:
              acceleratorModelPerformanceScores.accelerator_type,
            accelerator_memory_gb:
              acceleratorModelPerformanceScores.accelerator_memory_gb,
            model_variant_id:
              acceleratorModelPerformanceScores.model_variant_id,
            avg_prompt_tps: acceleratorModelPerformanceScores.avg_prompt_tps,
            avg_gen_tps: acceleratorModelPerformanceScores.avg_gen_tps,
            avg_ttft: acceleratorModelPerformanceScores.avg_ttft,
            performance_score:
              acceleratorModelPerformanceScores.performance_score,
          })
          .from(acceleratorModelPerformanceScores)
          .where(
            and(
              eq(
                acceleratorModelPerformanceScores.model_variant_id,
                modelVariantId
              ),
              inArray(
                acceleratorModelPerformanceScores.accelerator_id,
                acceleratorIdsArray
              )
            )
          )
          .orderBy(
            sql`${acceleratorModelPerformanceScores.performance_score} DESC`
          );

        return {
          modelInfo,
          rankings,
          performanceScores,
        };
      }
    );

    // Format results to match the expected structure
    const groupedResults = modelInfo.map((info) => ({
      model: {
        name: info.model_name,
        id: info.model_id,
        variantId: info.variant_id,
        quant: info.model_quant,
        params: info.model_params,
      },
      results: performanceScores
        .filter((score) => score.model_variant_id === info.variant_id)
        .map((score) => ({
          ...score,
          accelerator: {
            id: score.accelerator_id,
            name: score.accelerator_name,
            type: score.accelerator_type,
            memory_gb: score.accelerator_memory_gb,
            manufacturer: null,
            created_at: null,
          },
          performance_score: score.performance_score || 0,
          performance_rank: rankings.find(
            (rank) =>
              rank.model_variant_id === score.model_variant_id &&
              rank.accelerator_id === score.accelerator_id
          )?.performance_rank,
          number_ranked: rankings.find(
            (rank) =>
              rank.model_variant_id === score.model_variant_id &&
              rank.accelerator_id === score.accelerator_id
          )?.number_ranked,
        })),
    }));

    // Validate results
    const validatedResults = PerformanceScoresSchema.safeParse(groupedResults);

    if (!validatedResults.success) {
      throw validatedResults.error;
    }

    return validatedResults.data;
  } catch (error) {
    if (error instanceof DrizzleError) {
      throw new Error(`Database error: ${error.message}`);
    } else if (error instanceof ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    } else {
      throw new Error(
        `Unexpected error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
};

/**
 * Retrieves a paginated list of benchmark results with runtime information
 *
 * @param options - Options for pagination and sorting
 * @param options.sortDirection - Direction to sort results (asc or desc)
 * @param options.limit - Maximum number of results to return
 * @param options.offset - Number of results to skip
 * @returns Array of benchmark runs with runtime information
 */
export const getBenchmarkResults = async ({
  sortDirection,
  limit,
  offset,
}: {
  sortDirection: SortDirection;
  limit: number;
  offset: number;
}): Promise<Run[]> => {
  try {
    const selected = await db
      .select({
        system: benchmarkSystems,
        benchmarkRun: benchmarkRuns,
        accelerator: accelerators,
        modelVariant: modelVariants,
        model: models,
        runtime: runtimes,
      })
      .from(benchmarkRuns)
      .innerJoin(
        accelerators,
        eq(accelerators.id, benchmarkRuns.accelerator_id)
      )
      .innerJoin(
        modelVariants,
        eq(modelVariants.id, benchmarkRuns.model_variant_id)
      )
      .innerJoin(models, eq(models.id, modelVariants.model_id))
      .innerJoin(
        benchmarkSystems,
        eq(benchmarkSystems.id, benchmarkRuns.system_id)
      )
      .innerJoin(runtimes, eq(runtimes.id, benchmarkRuns.runtime_id))
      .orderBy(
        sortDirection === "desc"
          ? desc(benchmarkRuns.created_at)
          : asc(benchmarkRuns.created_at)
      )
      .limit(limit)
      .offset(offset);

    const res = selected.map((row) => ({
      ...row.benchmarkRun,
      system: row.system,
      accelerator: row.accelerator.name,
      accelerator_type: row.accelerator.type,
      accelerator_memory_gb: row.accelerator.memory_gb,
      model: {
        ...row.model,
        quant: row.modelVariant.quantization,
        variantId: row.modelVariant.id,
      },
      runtime: row.runtime,
    }));

    return RunsSchema.parse(res);
  } catch (error) {
    console.error("Error retrieving benchmark results:", error);
    if (error instanceof ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    } else if (error instanceof DrizzleError) {
      throw new Error(`Database error: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Retrieves a single benchmark result by ID with detailed test results and runtime information
 *
 * @param benchmarkRunId - The ID of the benchmark run to retrieve
 * @returns The benchmark run with detailed results and runtime information, or null if not found
 */
export const getBenchmarkResult = async (
  benchmarkRunId: number
): Promise<Run | null> => {
  try {
    return await db.transaction(async (tx) => {
      // First query without test results
      const selected = await tx
        .select({
          system: benchmarkSystems,
          benchmarkRun: benchmarkRuns,
          accelerator: accelerators,
          modelVariant: modelVariants,
          model: models,
          runtime: runtimes,
        })
        .from(benchmarkRuns)
        .innerJoin(
          accelerators,
          eq(accelerators.id, benchmarkRuns.accelerator_id)
        )
        .innerJoin(
          modelVariants,
          eq(modelVariants.id, benchmarkRuns.model_variant_id)
        )
        .innerJoin(models, eq(models.id, modelVariants.model_id))
        .innerJoin(
          benchmarkSystems,
          eq(benchmarkSystems.id, benchmarkRuns.system_id)
        )
        .innerJoin(runtimes, eq(runtimes.id, benchmarkRuns.runtime_id))
        .where(eq(benchmarkRuns.id, benchmarkRunId))
        .groupBy(
          benchmarkSystems.id,
          benchmarkRuns.id,
          accelerators.id,
          models.id,
          modelVariants.id,
          runtimes.id
        )
        .limit(1);

      if (selected.length === 0) {
        return null;
      }

      // Separate query for test results
      const results = await tx
        .select()
        .from(testResults)
        .where(eq(testResults.benchmark_run_id, benchmarkRunId));

      const row = selected[0];
      const result = {
        ...row.benchmarkRun,
        system: row.system,
        accelerator: row.accelerator.name,
        accelerator_type: row.accelerator.type,
        accelerator_memory_gb: row.accelerator.memory_gb,
        model: {
          ...row.model,
          quant: row.modelVariant.quantization,
          variantId: row.modelVariant.id,
        },
        runtime: row.runtime,
        results: results,
      };

      return RunsSchemaWithDetailedResults.parse(result);
    });
  } catch (error) {
    console.error(
      `Error retrieving benchmark result ${benchmarkRunId}:`,
      error
    );
    if (error instanceof ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    } else if (error instanceof DrizzleError) {
      throw new Error(`Database error: ${error.message}`);
    }
    throw error;
  }
};

export const updatePerformanceScores = async (
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  model: DbModel,
  modelVariant: DbModelVariant,
  accelerator: DbAccelerator
) => {
  // Calculate the new aggregated values
  const aggregationResult = await tx
    .select({
      avg_prompt_tps: sql`AVG(CASE WHEN ${benchmarkRuns.avg_prompt_tps} = 0 THEN NULL ELSE ${benchmarkRuns.avg_prompt_tps} END)`,
      avg_gen_tps: sql`AVG(CASE WHEN ${benchmarkRuns.avg_gen_tps} = 0 THEN NULL ELSE ${benchmarkRuns.avg_gen_tps} END)`,
      avg_ttft: sql`AVG(CASE WHEN ${benchmarkRuns.avg_ttft_ms} = 0 THEN NULL ELSE ${benchmarkRuns.avg_ttft_ms} END)`,
      performance_score: sql`AVG(CASE WHEN ${benchmarkRuns.performance_score} = 0 THEN NULL ELSE ${benchmarkRuns.performance_score} END)`,
    })
    .from(benchmarkRuns)
    .where(
      and(
        eq(benchmarkRuns.accelerator_id, accelerator.id),
        eq(benchmarkRuns.model_variant_id, modelVariant.id)
      )
    );

  if (!aggregationResult.length) return;
  const newAggregates = aggregationResult[0] as {
    avg_prompt_tps: number;
    avg_gen_tps: number;
    avg_ttft: number;
    performance_score: number;
  };

  // Now upsert the performance scores record
  await tx
    .insert(acceleratorModelPerformanceScores)
    .values({
      accelerator_id: accelerator.id,
      accelerator_name: accelerator.name,
      accelerator_type: accelerator.type,
      accelerator_memory_gb: accelerator.memory_gb,
      model_id: model.id,
      model_name: model.name,
      model_variant_id: modelVariant.id,
      model_variant_quant: modelVariant.quantization,
      avg_prompt_tps: newAggregates.avg_prompt_tps,
      avg_gen_tps: newAggregates.avg_gen_tps,
      avg_ttft: newAggregates.avg_ttft,
      performance_score: newAggregates.performance_score,
    })
    .onConflictDoUpdate({
      target: [
        acceleratorModelPerformanceScores.accelerator_id,
        acceleratorModelPerformanceScores.model_id,
        acceleratorModelPerformanceScores.model_variant_id,
      ],
      set: {
        avg_prompt_tps: newAggregates.avg_prompt_tps,
        avg_gen_tps: newAggregates.avg_gen_tps,
        avg_ttft: newAggregates.avg_ttft,
        performance_score: newAggregates.performance_score,
      },
    });
};

import {
  PerformanceScoresSchema,
  UniqueAccelerator,
  UniqueModel,
} from "@/lib/types";
import db from ".";
import {
  acceleratorModelPerformanceScores,
  accelerators,
  models,
  modelVariants,
} from "./schema";
import { inArray, sql, eq, DrizzleError, and } from "drizzle-orm";
import { ZodError } from "zod";

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

export const getTopAcceleratorsByModelVariants = async ({
  modelVariantIds,
  numResults = 10,
}: {
  modelVariantIds: string[];
  numResults?: number;
}) => {
  const acceleratorIds = await db
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
    )
    .limit(numResults);

  return acceleratorIds.map((row) => row.id);
};

export const getPerformanceScores = async (
  acceleratorIds: string[],
  modelVariantIds: string[]
) => {
  try {
    // Fetch raw results from database
    const results = await db
      .select({
        accelerator_name: acceleratorModelPerformanceScores.accelerator_name,
        accelerator_type: acceleratorModelPerformanceScores.accelerator_type,
        accelerator_memory_gb:
          acceleratorModelPerformanceScores.accelerator_memory_gb,
        model_name: acceleratorModelPerformanceScores.model_name,
        model_quant: acceleratorModelPerformanceScores.model_variant_quant,
        model_id: acceleratorModelPerformanceScores.model_id,
        model_variant_id: acceleratorModelPerformanceScores.model_variant_id,
        model_params: models.params,
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
      .innerJoin(
        models,
        eq(acceleratorModelPerformanceScores.model_id, models.id)
      )
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

    // Process and group results
    const groupedResults = Object.values(
      results.reduce(
        (acc, curr) => {
          if (curr.model_id) {
            if (!acc[curr.model_id]) {
              acc[curr.model_id] = {
                model: {
                  name: curr.model_name,
                  id: curr.model_id,
                  variantId: curr.model_variant_id,
                  quant: curr.model_quant,
                  params: curr.model_params,
                },
                results: [],
              };
            }
            acc[curr.model_id].results.push({
              ...curr,
              performance_score: (
                parseFloat(curr.performance_score || "0") * 10
              )
                .toFixed()
                .toString(),
              efficiency_score: (parseFloat(curr.efficiency_score || "0") * 10)
                .toFixed(2)
                .toString(),
            });
          }
          return acc;
        },
        {} as Record<
          string,
          {
            model: {
              name: string | null;
              id: string;
              variantId: string | null;
              quant: string | null;
              params: number | null;
            };
            results: typeof results;
          }
        >
      )
    );

    // Validate results
    const validatedResults = PerformanceScoresSchema.safeParse(groupedResults);

    if (!validatedResults.success) {
      throw new Error("Data validation failed");
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

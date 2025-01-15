import ModelMetricsChart from "@/components/charts/ModelMetrics";
import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import {
  getAcceleratorsById,
  getModelVariants,
  getPerformanceScores,
  getTopAcceleratorsByModelVariants,
} from "@/db/queries";
import { OFFICIAL_MODELS } from "@/lib/config";
import { Accelerator, PerformanceScore } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { GetServerSideProps } from "next";

import React from "react";

const AccleratorPage = ({
  accelInfo,
  modelResults,
  comparisonResults,
}: {
  accelInfo: Accelerator;
  modelResults: PerformanceScore[];
  comparisonResults: PerformanceScore[];
}) => {
  console.log("Comparison results:", comparisonResults);

  return (
    <>
      <PageHeader text={`${accelInfo.name}`} />

      <div className="flex flex-col space-y-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-4 gap-6">
          <div className="font-bold text-lg">Model</div>
          {modelResults.map((result, i) => (
            <div key={i} className="flex flex-col space-y-1">
              <div className="font-semibold text-base">{result.model.name}</div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{result.model.quant}</span>
                <span>{(result.model.params / 1_000_000_000).toFixed(1)}B</span>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="grid grid-cols-4 gap-6">
          <div className="text-gray-700">Prompt Speed</div>
          {modelResults.map((result, i) => (
            <div key={i} className="text-sm">
              {result.results[0]?.avg_prompt_tps ? (
                <span>
                  <span className="font-bold">
                    {
                      formatMetricValue(
                        "avg_prompt_tps",
                        result.results[0]?.avg_prompt_tps
                      ).formatted
                    }
                  </span>
                  <span className="text-gray-500 text-xs ml-1">
                    {
                      formatMetricValue(
                        "avg_prompt_tps",
                        result.results[0]?.avg_prompt_tps
                      ).suffix
                    }
                  </span>
                </span>
              ) : (
                "N/A"
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="text-gray-700">Generation Speed</div>
          {modelResults.map((result, i) => (
            <div key={i} className="text-sm">
              {result.results[0]?.avg_gen_tps ? (
                <span>
                  <span className="font-bold">
                    {
                      formatMetricValue(
                        "avg_gen_tps",
                        result.results[0]?.avg_gen_tps
                      ).formatted
                    }
                  </span>
                  <span className="text-gray-500 text-xs ml-1">
                    {
                      formatMetricValue(
                        "avg_gen_tps",
                        result.results[0]?.avg_gen_tps
                      ).suffix
                    }
                  </span>
                </span>
              ) : (
                "N/A"
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="text-gray-700">Time to First Token</div>
          {modelResults.map((result, i) => (
            <div key={i} className="text-sm">
              {result.results[0]?.avg_ttft ? (
                <span>
                  <span className="font-bold">
                    {
                      formatMetricValue("avg_ttft", result.results[0]?.avg_ttft)
                        .formatted
                    }
                  </span>
                  <span className="text-gray-500 text-xs ml-1">
                    {
                      formatMetricValue("avg_ttft", result.results[0]?.avg_ttft)
                        .suffix
                    }
                  </span>
                </span>
              ) : (
                "N/A"
              )}
            </div>
          ))}
        </div>

        <Separator />

        <div className="grid grid-cols-4 gap-6">
          <div className="font-semibold">LocalScore</div>
          {modelResults.map((result, i) => (
            <div key={i} className="font-semibold">
              {result.results[0]?.performance_score ? (
                <span className="font-bold">
                  {
                    formatMetricValue(
                      "performance_score",
                      result.results[0]?.performance_score
                    ).formatted
                  }
                </span>
              ) : (
                "N/A"
              )}
            </div>
          ))}
        </div>
      </div>

      {/* add a model selector. */}
      <ModelMetricsChart
        data={comparisonResults}
        selectedModel={OFFICIAL_MODELS[0]}
        metricKey="performance_score"
      />
    </>
  );
};

export default AccleratorPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { name } = context.query;

  const models = OFFICIAL_MODELS.map((model) => ({
    name: model.name,
    quant: model.quant,
  }));

  const accelInfo = await getAcceleratorsById(name as string);
  console.log("Accelerator info:", accelInfo);
  const modelVariants = await getModelVariants(models);
  console.log("Model variants:", modelVariants);
  const modelVariantIds = modelVariants.map((mv) => mv.variantId);
  const acceleratorIds = await getTopAcceleratorsByModelVariants({
    modelVariantIds,
    numResults: 5,
  });

  const modelResults = await getPerformanceScores(
    [name as string],
    modelVariantIds
  );

  const comparisonResults = await getPerformanceScores(
    [...acceleratorIds, name as string],
    modelVariantIds
  );

  // Ensure modelResults has same length as OFFICIAL_MODELS
  const normalizedModelResults = OFFICIAL_MODELS.map((model) => {
    const existingResult = modelResults.find(
      (result) => result.model.name === model.name
    );
    return (
      existingResult || {
        model: {
          name: model.name,
          quant: model.quant,
          params: "N/A",
        },
        results: [],
      }
    );
  });

  return {
    props: {
      modelResults: normalizedModelResults,
      comparisonResults,
      accelInfo,
    },
  };
};

import Card from "@/components/Card";
import ModelMetricsChart from "@/components/charts/ModelMetrics";
import Carat from "@/components/icons/Carat";
import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import {
  getAcceleratorsById,
  getModelVariants,
  getPerformanceScores,
  getTopAcceleratorsByModelVariants,
} from "@/db/queries";
import { OFFICIAL_MODELS } from "@/lib/config";
import {
  Accelerator,
  MetricLabels,
  MetricSortDirection,
  PerformanceMetricKey,
  PerformanceScore,
  sortableResultKeys,
} from "@/lib/types";
import { formatMetricValue, getModelParamsString } from "@/lib/utils";
import { GetServerSideProps } from "next";
import React, { useState } from "react";

const ModelInfo = ({ result }: { result: PerformanceScore }) => (
  <div className="flex flex-col space-y-1">
    <div className="font-semibold text-base">{result.model.name}</div>
    <div className="flex justify-between text-sm text-gray-600">
      <span>{result.model.quant}</span>
      <span>{getModelParamsString(result.model.params)}</span>
    </div>
  </div>
);

const MetricValue = ({
  result,
  metricKey,
}: {
  result: PerformanceScore;
  metricKey: PerformanceMetricKey;
}) => {
  const value = result.results[0]?.[metricKey];
  if (!value) return <div className="text-sm">N/A</div>;

  const formatted = formatMetricValue(metricKey, value);
  return (
    <div className="text-sm">
      <span className="font-bold">{formatted.formatted}</span>
      <span className="text-gray-500 text-xs ml-1">{formatted.suffix}</span>
    </div>
  );
};

const MetricRow = ({
  label,
  results,
  metricKey,
}: {
  label: string;
  results: PerformanceScore[];
  metricKey: PerformanceMetricKey;
}) => (
  <div className="grid grid-cols-4 gap-6">
    <div className="text-gray-700">{label}</div>
    {results.map((result, i) => (
      <MetricValue key={i} result={result} metricKey={metricKey} />
    ))}
  </div>
);

const LocalScoreRow = ({ results }: { results: PerformanceScore[] }) => (
  <div className="grid grid-cols-4 gap-6">
    <div className="font-semibold">LocalScore</div>
    {results.map((result, i) => (
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
);

const AcceleratorPage = ({
  accelInfo,
  modelResults,
  comparisonResults,
}: {
  accelInfo: Accelerator;
  modelResults: PerformanceScore[];
  comparisonResults: PerformanceScore[];
}) => {
  const [selectedKey, setSelectedKey] =
    useState<PerformanceMetricKey>("avg_gen_tps");
  const [selectedModel, setSelectedModel] = useState(
    comparisonResults[0].model
  );

  return (
    <>
      <PageHeader text={`${accelInfo.name}`} />
      <div className="flex flex-col space-y-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-4 gap-6">
          <div className="font-bold text-lg">Model</div>
          {modelResults.map((result, i) => (
            <ModelInfo key={i} result={result} />
          ))}
        </div>

        <Separator />

        <MetricRow
          label="Prompt Speed"
          results={modelResults}
          metricKey="avg_prompt_tps"
        />
        <MetricRow
          label="Generation Speed"
          results={modelResults}
          metricKey="avg_gen_tps"
        />
        <MetricRow
          label="Time to First Token"
          results={modelResults}
          metricKey="avg_ttft"
        />

        <Separator />

        <LocalScoreRow results={modelResults} />
      </div>

      <Card>
        <div className="flex justify-between items-center">
          <p className="font-bold text-lg">Compare</p>
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={selectedModel.name}
                onChange={(e) => {
                  const model = comparisonResults.find(
                    (r) => r.model.name === e.target.value
                  )?.model;
                  if (model) setSelectedModel(model);
                }}
                className="px-5 py-[10px] text-primary-500 bg-primary-100 border-none appearance-none rounded-md"
              >
                {comparisonResults.map((result) => (
                  <option key={result.model.name} value={result.model.name}>
                    {result.model.name}
                  </option>
                ))}
              </select>
              <Carat className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedKey}
                onChange={(e) =>
                  setSelectedKey(e.target.value as PerformanceMetricKey)
                }
                className="px-5 py-[10px] text-primary-500 bg-primary-100 border-none appearance-none rounded-md"
              >
                {sortableResultKeys.map((key) => (
                  <option key={key} value={key}>
                    {MetricLabels[key]}
                  </option>
                ))}
              </select>
              <Carat className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <ModelMetricsChart
          data={comparisonResults}
          selectedModel={selectedModel}
          metricKey={selectedKey}
          sortDirection={MetricSortDirection[selectedKey]}
        />
      </Card>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  const models = OFFICIAL_MODELS.map((model) => ({
    name: model.name,
    quant: model.quant,
  }));

  const accelInfo = await getAcceleratorsById(id as string);
  const modelVariants = await getModelVariants(models);
  const modelVariantIds = modelVariants.map((mv) => mv.variantId);
  const acceleratorIds = await getTopAcceleratorsByModelVariants({
    modelVariantIds,
    numResults: 5,
  });

  const modelResults = await getPerformanceScores(
    [id as string],
    modelVariantIds
  );

  const comparisonResults = await getPerformanceScores(
    [...acceleratorIds, id as string],
    modelVariantIds
  );

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

export default AcceleratorPage;

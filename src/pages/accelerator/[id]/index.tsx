import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import {
  getAcceleratorsById,
  getPerforamanceModelVariantsByAcceleratorId,
  getPerformanceScores,
} from "@/db/queries";
import { OFFICIAL_MODELS } from "@/lib/config";
import {
  Accelerator,
  PerformanceMetricKey,
  PerformanceScore,
} from "@/lib/types";
import { formatMetricValue, getModelParamsString } from "@/lib/utils";
import { GetServerSideProps } from "next";
import React from "react";
import ModelCompareCard from "@/components/ModelCompareCard";
import Card from "@/components/Card";

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
  officialModelResults,
  results,
}: {
  accelInfo: Accelerator;
  officialModelResults: PerformanceScore[];
  results: PerformanceScore[];
}) => {
  return (
    <>
      <PageHeader text={`${accelInfo.name}`} />
      <Card className="flex flex-col space-y-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="font-bold text-lg">Model</div>
          {officialModelResults.map((result, i) => (
            <ModelInfo key={i} result={result} />
          ))}
        </div>

        <Separator />

        <MetricRow
          label="Prompt Speed"
          results={officialModelResults}
          metricKey="avg_prompt_tps"
        />
        <MetricRow
          label="Generation Speed"
          results={officialModelResults}
          metricKey="avg_gen_tps"
        />
        <MetricRow
          label="Time to First Token"
          results={officialModelResults}
          metricKey="avg_ttft"
        />

        <Separator />

        <LocalScoreRow results={officialModelResults} />
      </Card>
      <ModelCompareCard results={results} accelerator={accelInfo} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  const acceleratorId = id as string;

  const accelInfo = await getAcceleratorsById(acceleratorId);
  const modelVariantIds = await getPerforamanceModelVariantsByAcceleratorId(
    acceleratorId
  );

  const modelResults = await getPerformanceScores(
    [acceleratorId],
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
      officialModelResults: normalizedModelResults,
      results: modelResults,
      accelInfo,
    },
  };
};

export default AcceleratorPage;

import PageHeader from "@/components/layout/PageHeader";
import Separator from "@/components/ui/Separator";
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
import ModelCompareCard from "@/components/cards/compare/ModelCompareCard";
import Card from "@/components/ui/Card";
import AcceleratorInfo from "@/components/display/AcceleratorInfo";
import CardHeader from "@/components/ui/CardHeader";
import Meta from "@/components/layout/Meta";

const ModelInfo = ({ result }: { result: PerformanceScore }) => (
  <div className="flex flex-col space-y-1">
    <div className="font-semibold text-sm sm:text-base">
      {result.model.name}
    </div>
    <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600">
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
    <div className="flex flex-col sm:text-base text-xs">
      <span className="font-bold">{formatted.formatted}</span>
      <span className="text-gray-500 text-xs">{formatted.suffix}</span>
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
    <div className="text-gray-700 text-xs sm:text-base self-center">
      {label}
    </div>
    {results.map((result, i) => (
      <MetricValue key={i} result={result} metricKey={metricKey} />
    ))}
  </div>
);

const LocalScoreRow = ({ results }: { results: PerformanceScore[] }) => (
  <div className="grid grid-cols-4 gap-6 items-center">
    <div className="font-semibold sm:text-base text-xs">LocalScore</div>
    {results.map((result, i) => (
      <div key={i} className="font-semibold sm:text-lg text-sm">
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

const AcceleratorPerformanceOverview = ({
  results,
}: {
  results: PerformanceScore[];
}) => {
  const sortedResults = [...results].sort((a, b) => {
    if (a.model.params < b.model.params) return -1;
    if (a.model.params > b.model.params) return 1;
    return 0;
  });

  return (
    <Card className="flex flex-col sm:space-y-4 space-y-2">
      <CardHeader text="PERFORMANCE OVERVIEW" />
      <Separator thickness={2} />
      <div className="grid grid-cols-4 gap-6">
        <div className="font-bold text-sm sm:text-base">Model</div>
        {sortedResults.map((result, i) => (
          <ModelInfo key={i} result={result} />
        ))}
      </div>

      <Separator />

      <MetricRow
        label="Prompt Speed"
        results={sortedResults}
        metricKey="avg_prompt_tps"
      />
      <MetricRow
        label="Generation Speed"
        results={sortedResults}
        metricKey="avg_gen_tps"
      />
      <MetricRow
        label="Time to First Token"
        results={sortedResults}
        metricKey="avg_ttft"
      />

      <Separator />

      <LocalScoreRow results={sortedResults} />
    </Card>
  );
};

const AcceleratorPage = ({
  accelInfo,
  officialModelResults,
  results,
  id,
}: {
  accelInfo: Accelerator | null;
  officialModelResults: PerformanceScore[];
  results: PerformanceScore[];
  id: string;
}) => {
  if (!accelInfo) {
    return <div>Accelerator not found</div>;
  }

  return (
    <>
      <Meta
        title={`${accelInfo.name} Results`}
        description={`LocalScore benchmark results for ${accelInfo.name} with ${accelInfo.memory_gb}GB of memory.`}
      />

      <PageHeader>
        <AcceleratorInfo {...accelInfo} variant="header" />
      </PageHeader>

      <AcceleratorPerformanceOverview results={officialModelResults} />

      <Separator thickness={2} />

      <ModelCompareCard results={results} accelerator={accelInfo} key={id} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600"
  );

  const { id: idRaw } = context.query;
  const id = idRaw as string;

  const acceleratorId = parseInt(id);

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
    return existingResult;
  }).filter((result) => result !== undefined);

  if (normalizedModelResults.length < 3) {
    // Fill in normalizedModelResults with models that are not in the official list
    const nonOfficialResults = modelResults.filter(
      (result) =>
        !OFFICIAL_MODELS.some(
          (officialModel) => officialModel.name === result.model.name
        )
    );

    // Add enough non-official models to reach at least 3 models in normalizedModelResults
    const numberOfModelsToAdd = Math.min(
      3 - normalizedModelResults.length,
      nonOfficialResults.length
    );
    if (numberOfModelsToAdd > 0) {
      normalizedModelResults.push(
        ...nonOfficialResults.slice(0, numberOfModelsToAdd)
      );
    }
  }

  return {
    props: {
      officialModelResults: normalizedModelResults,
      results: modelResults,
      accelInfo: accelInfo ?? null,
      id,
    },
  };
};

export default AcceleratorPage;

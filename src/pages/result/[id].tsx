import AcceleratorInfo from "@/components/display/AcceleratorInfo";
import Card from "@/components/ui/Card";
import ModelInfo from "@/components/display/ModelInfo";
import RuntimeInfo from "@/components/display/RuntimeInfo";
import Separator from "@/components/ui/Separator";
import SystemInfo from "@/components/display/SystemInfo";
import {
  getBenchmarkResult,
  getAcceleratorsPerformanceByModelVariant,
  getPerformanceScores,
} from "@/db/queries";
import {
  DetailedRun,
  PerformanceMetricKey,
  PerformanceScore,
} from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import dayjs from "dayjs";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import PerformanceMetricGrid from "@/components/display/PerformanceResultsGrid";
import Meta from "@/components/layout/Meta";
import ModelMetricsChart from "@/components/charts/ModelMetricsChart";
import { MetricSortDirection } from "@/lib/constants";
import MetricSelector from "@/components/display/MetricSelector";
import Hyperlink from "@/components/ui/Hyperlink";

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <div className="flex gap-2 sm:text-xl text-lg font-black tracking-wider">
      {title}
    </div>
  );
};

// Component for page header with title and date
interface PageHeaderProps {
  id: number;
  runDate: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ id, runDate }) => {
  return (
    <div className="w-full">
      <div className="flex gap-2 text-2xl font-black tracking-wider justify-center">
        TEST #{id} RESULTS
      </div>
      <p className="text-center font-light pb-2">
        {dayjs(runDate).format("MM/DD/YYYY - h:mm A")}
      </p>
      <Separator thickness={2} />
    </div>
  );
};

// Component for consistently displaying formatted metric values
interface MetricValueProps {
  metricType: PerformanceMetricKey;
  value: number;
}

const MetricValue: React.FC<MetricValueProps> = ({ metricType, value }) => {
  const { formatted, suffix } = formatMetricValue(metricType, value);

  return (
    <div className="flex sm:flex-row flex-col items-center sm:gap-2">
      <div className={`text-sm sm:text-lg sm:font-normal font-medium`}>
        {formatted}
      </div>
      <div className="text-xs">{suffix}</div>
    </div>
  );
};

// Results table for detailed benchmark results
interface ResultsTableProps {
  result: DetailedRun;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-4 gap-2">
        <div className="font-medium sm:text-sm text-xs">TEST NAME</div>
        <div className="font-medium sm:text-sm text-xs sm:text-left text-center">
          PROMPT
        </div>
        <div className="font-medium sm:text-sm text-xs sm:text-left text-center">
          GENERATION
        </div>
        <div className="font-medium sm:text-sm text-xs sm:text-left text-center">
          TTFT
        </div>

        <Separator thickness={2} className="col-span-4" />

        {result.results.map((result) => (
          <React.Fragment key={result.id}>
            <div className="sm:text-base text-xs self-center">
              {result.name}
            </div>
            <MetricValue
              metricType="avg_prompt_tps"
              value={result.prompt_tps}
            />
            <MetricValue metricType="avg_gen_tps" value={result.gen_tps} />
            <MetricValue metricType="avg_ttft" value={result.ttft_ms} />
            <Separator thickness={1} className="col-span-4" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const TestConfiguration = ({ result }: { result: DetailedRun }) => {
  return (
    <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
      <div className="flex flex-col">
        <SectionHeader title="ACCELERATOR" />
        <AcceleratorInfo
          id={result.accelerator_id}
          name={result.accelerator}
          type={result.accelerator_type}
          memory_gb={result.accelerator_memory_gb}
        />
      </div>

      <div className="flex flex-col">
        <SectionHeader title="MODEL" />
        <ModelInfo {...result.model} />
      </div>
    </div>
  );
};

// Main page component
const Page: React.FC<{
  result: DetailedRun | null;
  compareResult: PerformanceScore | null;
}> = ({ result, compareResult }) => {
  const [selectedKey, setSelectedKey] =
    useState<PerformanceMetricKey>("avg_gen_tps");

  if (!result || !compareResult) {
    return <div>Result not found</div>;
  }

  return (
    <div className="space-y-8">
      <Meta
        title={`LocalScore - Test #${result.id} Results`}
        description={`LocalScore benchmark results for test #${result.id}. This is for the accelerator ${result.accelerator}`}
      />
      <Card className="flex flex-col gap-4">
        <PageHeader id={result.id} runDate={result.created_at} />

        <TestConfiguration result={result} />

        <Separator thickness={2} />

        <div className="flex justify-center w-full py-4">
          <PerformanceMetricGrid run={result} size="xl" />
        </div>

        <Separator thickness={2} />

        <div className="flex justify-between">
          <SectionHeader title="HOW YOU STACK UP" />
          <Hyperlink href={`/model/${result.model_variant_id}`}>
            Explore All Results
          </Hyperlink>
        </div>
        <div className="space-y-2 flex flex-col">
          <p className="flex self-center font-medium text-lg">
            {result.model.name} - {result.model.quant}
          </p>
          <div className="flex self-center max-w-64 w-full">
            <MetricSelector
              selectedKey={selectedKey}
              onChange={setSelectedKey}
            />
          </div>
          <ModelMetricsChart
            data={[compareResult]}
            selectedModel={result.model}
            metricKey={selectedKey}
            sortDirection={MetricSortDirection[selectedKey]}
            highlightedAccelerator={{
              name: result.accelerator,
              memory: result.accelerator_memory_gb,
            }}
          />
        </div>

        <Separator thickness={2} />

        <div>
          <SectionHeader title="SYSTEM" />
          <SystemInfo systemInfo={result.system} extended />
        </div>

        <Separator thickness={2} />

        <div>
          <SectionHeader title="RUNTIME" />
          <RuntimeInfo runtime={result.runtime} />
        </div>

        <Separator thickness={2} />

        <SectionHeader title="DETAILED RESULTS" />

        <Separator thickness={2} className="col-span-4" />

        <ResultsTable result={result} />
      </Card>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    "Cache-Control",
    "public, max-age=15768000, stale-while-revalidate=31536000"
  );

  const startTime = Date.now();

  const { id } = context.query;
  const runId = parseInt(id as string);

  const result = await getBenchmarkResult(runId);

  if (!result) {
    return {
      props: {
        result: null,
        compareResults: null,
      },
    };
  }

  const compareAccelIds = await getAcceleratorsPerformanceByModelVariant(
    result.model_variant_id
  );

  const compareResults = await getPerformanceScores(
    [...compareAccelIds, result.accelerator_id],
    [result.model_variant_id]
  );
  const compareResult = compareResults[0];

  const endTime = Date.now();
  console.log(`/result/${id} DB fetch took ${endTime - startTime}ms`);

  return {
    props: {
      result,
      compareResult,
    },
  };
};

export default Page;

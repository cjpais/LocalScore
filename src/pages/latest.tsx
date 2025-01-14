import PageHeader from "@/components/PageHeader";
import { getBenchmarkResults } from "@/db/queries";
import { PerformanceMetricKey, Run, System } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

// Components
const MetricDisplay: React.FC<{
  label: string;
  metricKey: PerformanceMetricKey;
  value: number;
}> = ({ label, metricKey, value }) => {
  const { formatted, suffix } = formatMetricValue(metricKey, value);
  return (
    <div className="flex flex-col">
      <p className="text-gray-600">{label}:</p>
      <p className="font-medium">
        {formatted}
        {suffix && <span className="text-gray-500 text-sm ml-1">{suffix}</span>}
      </p>
    </div>
  );
};

const AcceleratorInfo: React.FC<{
  accelerator: string;
  acceleratorType: string;
  memoryGB: string;
}> = ({ accelerator, acceleratorType, memoryGB }) => (
  <div className="flex flex-col">
    <Link
      className="font-bold text-primary-500 hover:underline"
      href={`/accelerator/${accelerator}/${memoryGB}`}
    >
      {accelerator}
    </Link>
    <div className="text-sm text-gray-600">
      {acceleratorType} / {memoryGB}GB
    </div>
  </div>
);

const ModelInfo: React.FC<{
  model: string;
  quantization: string;
}> = ({ model, quantization }) => (
  <Link
    href={`/model/${model}/${quantization}`}
    className="text-primary-500 hover:underline"
  >
    <p className="font-medium">{model}</p>
    <p className="text-sm">{quantization}</p>
  </Link>
);

const SystemInfo: React.FC<{ systemInfo: System }> = ({ systemInfo }) => {
  return (
    <div className="grid grid-cols-5 gap-4 text-sm">
      <div className="col-span-3 flex items-center gap-2">
        <div className="text-gray-600">CPU:</div>
        <div className="font-medium">{systemInfo.cpu_name}</div>
      </div>
      <div className="col-span-1 flex items-center gap-2">
        <div className="text-gray-600">Memory:</div>
        <div className="font-medium">{systemInfo.ram_gb}GB</div>
      </div>
      <div className="col-span-1 flex items-center gap-2 justify-end">
        <div className="text-gray-600">OS:</div>
        <div className="font-medium">{systemInfo.kernel_type}</div>
      </div>
    </div>
  );
};

const RunCard: React.FC<{ run: Run }> = ({ run }) => (
  <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-col justify-between p-3 border-b border-gray-200">
      <div className="flex justify-between">
        <Link
          href={`/result/${run.id}`}
          className="text-primary-500 hover:underline text-sm"
        >
          {run.id}
        </Link>
        <p className="text-sm text-gray-600">
          {new Date(run.run_date).toLocaleDateString()}
        </p>
      </div>
      <SystemInfo systemInfo={run.system} />
    </div>
    <div className="flex justify-between p-4 items-center">
      <div className="flex flex-col">
        <AcceleratorInfo
          accelerator={run.accelerator}
          acceleratorType={run.accelerator_type}
          memoryGB={run.accelerator_memory_gb}
        />
        <div className="flex-grow" />
        <ModelInfo model={run.model} quantization={run.quantization} />
      </div>
      <div className="grid grid-cols-2 gap-4 w-72">
        <MetricDisplay
          label="Prompt"
          metricKey="avg_prompt_tps"
          value={run.avg_prompt_tps}
        />
        <MetricDisplay
          label="Generation"
          metricKey="avg_gen_tps"
          value={run.avg_gen_tps}
        />
        <MetricDisplay label="TTFT" metricKey="avg_ttft" value={run.avg_ttft} />
        <MetricDisplay
          label="LocalScore"
          metricKey="performance_score"
          value={run.performance_score}
        />
      </div>
    </div>
  </div>
);

const Latest = ({ results }: { results: Run[] }) => {
  const router = useRouter();
  const { offset } = router.query;
  const currentOffset = Number(offset) || 0;

  const handleNext = () => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, offset: currentOffset + 10 },
    });
  };

  const handlePrevious = () => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, offset: currentOffset - 10 },
    });
  };

  return (
    <div className="">
      <PageHeader text="Latest LocalScore Results" />
      <div className="flex flex-col gap-4 mt-6">
        {results.map((run) => (
          <RunCard key={run.id} run={run} />
        ))}
      </div>
      <div className="flex justify-between mt-6">
        {currentOffset > 0 && (
          <button
            onClick={handlePrevious}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-500 text-white rounded ml-auto"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { offset } = context.query;
  const offsetValue = offset ? parseInt(offset as string) : 0;

  const results = await getBenchmarkResults({
    sortDirection: "desc",
    limit: 10,
    offset: offsetValue,
  });

  console.log("Results", results);

  return {
    props: {
      results,
    },
  };
};

export default Latest;

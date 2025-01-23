import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import { getBenchmarkResults } from "@/db/queries";
import { PerformanceMetricKey, Run, System } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import dayjs from "dayjs";

// Components
const MetricDisplay: React.FC<{
  label: string;
  metricKey: PerformanceMetricKey;
  value: number;
}> = ({ label, metricKey, value }) => {
  const { formatted, suffix } = formatMetricValue(metricKey, value);
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-[5px]">
        <p className=" font-medium">{formatted}</p>
        <p className="text-xs font-light">{suffix}</p>
      </div>
      <p className="text-xs -mt-1">{label}</p>
    </div>
  );
};

const AcceleratorInfo: React.FC<{
  acceleratorId: string;
  accelerator: string;
  acceleratorType: string;
  memoryGB: string;
}> = ({ acceleratorId, accelerator, acceleratorType, memoryGB }) => (
  <div className="grid grid-cols-5 w-full">
    <div className="flex flex-col col-span-4">
      <Link
        className="font-medium text-primary-500 hover:underline"
        href={`/accelerator/${acceleratorId}`}
      >
        {accelerator}
      </Link>
      <div className="text-sm font-light -mt-1">{acceleratorType}</div>
    </div>
    <div className="flex flex-col">
      <div className="font-medium">{memoryGB}</div>
      <div className="text-sm font-light -mt-1">GB</div>
    </div>
  </div>
);

const ModelInfo: React.FC<{
  model: string;
  quantization: string;
  variantId: string;
}> = ({ model, quantization, variantId }) => (
  <Link
    href={`/model/${variantId}`}
    className="text-primary-500 hover:underline"
  >
    <p className="font-medium">{model}</p>
    <p className="text-sm -mt-1">{quantization}</p>
  </Link>
);

const SystemInfo: React.FC<{ systemInfo: System }> = ({ systemInfo }) => {
  return (
    <div className="grid grid-cols-5 gap-1 text-sm mt-2">
      <div className="col-span-3 flex items-center gap-1">
        <div className="font-light">cpu</div>
        <div className="font-medium">{systemInfo.cpu_name}</div>
      </div>
      <div className="col-span-1 flex items-center gap-1">
        <div className="font-light">ram</div>
        <div className="font-medium">{systemInfo.ram_gb}GB</div>
      </div>
      <div className="col-span-1 flex items-center gap-1 justify-end">
        <div className="font-light">OS</div>
        <div className="font-medium">{systemInfo.kernel_type}</div>
      </div>
    </div>
  );
};

const RunCard: React.FC<{ run: Run }> = ({ run }) => (
  <div className="rounded-lg bg-white shadow-[0_24px_54px_0_rgba(88,42,203,0.03)] p-5 flex flex-col">
    <div className="flex flex-col justify-between pb-1">
      <div className="flex justify-between">
        <Link
          href={`/result/${run.id}`}
          className="text-primary-500 hover:underline text-sm font-medium"
        >
          {run.id}
        </Link>
        <p className="text-sm text-gray-600 font-light">
          {dayjs(run.run_date).format("MM/DD/YYYY - h:mm A")}
        </p>
      </div>
    </div>
    <Separator thickness={2} className="pb-2" />
    <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] py-1.5">
      <div className="flex flex-col col-span-8 justify-center gap-1">
        <AcceleratorInfo
          acceleratorId={run.accelerator_id}
          accelerator={run.accelerator}
          acceleratorType={run.accelerator_type}
          memoryGB={run.accelerator_memory_gb}
        />

        <ModelInfo
          model={run.model}
          quantization={run.quantization}
          variantId={run.model_variant_id}
        />
      </div>
      {/* <div className="w-[2px] h-full bg-black"></div> */}
      <Separator
        thickness={2}
        direction="vertical"
        className="flex justify-end self-end"
      />
      <div className="grid grid-cols-2 gap-2 col-span-7">
        <MetricDisplay
          label="generation"
          metricKey="avg_gen_tps"
          value={run.avg_gen_tps}
        />
        <MetricDisplay
          label="time to first token"
          metricKey="avg_ttft"
          value={run.avg_ttft}
        />
        <MetricDisplay
          label="prompt"
          metricKey="avg_prompt_tps"
          value={run.avg_prompt_tps}
        />
        <MetricDisplay
          label="LocalScore"
          metricKey="performance_score"
          value={run.performance_score}
        />
      </div>
    </div>
    <Separator thickness={2} className="mt-2" />
    <SystemInfo systemInfo={run.system} />
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

  return {
    props: {
      results,
    },
  };
};

export default Latest;

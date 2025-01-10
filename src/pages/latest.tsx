import PageHeader from "@/components/PageHeader";
import { fetcher } from "@/lib/swr";
import { numberOrStringToNumber, PerformanceMetricKey } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import useSWR from "swr";
import { z } from "zod";

// Types
type Run = z.infer<typeof RunSchema>;
type System = z.infer<typeof SystemSchema>;

// Schemas
const SystemSchema = z.object({
  id: z.string(),
  cpu_name: z.string(),
  cpu_arch: z.string(),
  ram_gb: numberOrStringToNumber,
  kernel_type: z.string(),
  kernel_release: z.string(),
  system_version: z.string(),
  created_at: z.string(),
});

const RunSchema = z.object({
  id: z.string().uuid(),
  system_id: z.string().uuid(),
  accelerator_id: z.string().uuid(),
  model_variant_id: z.string().uuid(),
  runtime_id: z.string().uuid(),
  run_date: z.string(),
  created_at: z.string(),
  accelerator: z.string(),
  accelerator_type: z.string(),
  accelerator_memory_gb: z.string(),
  model: z.string(),
  quantization: z.string(),
  avg_prompt_tps: numberOrStringToNumber,
  avg_gen_tps: numberOrStringToNumber,
  avg_ttft: numberOrStringToNumber,
  performance_score: numberOrStringToNumber,
  system: SystemSchema,
});

const RunsSchema = z.array(RunSchema);

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

const LoadingState = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-pulse text-gray-400">Loading results...</div>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center h-32 text-red-500">
    {message}
  </div>
);

// Main Component
const Latest: React.FC = () => {
  const { data, error } = useSWR(`/api/results`, fetcher);

  if (error) return <ErrorState message="Failed to load results" />;
  if (!data) return <LoadingState />;

  const parsedData = RunsSchema.safeParse(data);

  if (!parsedData.success) {
    return <ErrorState message={`Invalid data: ${parsedData.error.message}`} />;
  }

  return (
    <div className="">
      <PageHeader text="Latest LocalScore Results" />
      <div className="flex flex-col gap-4 mt-6">
        {parsedData.data.map((run) => (
          <RunCard key={run.id} run={run} />
        ))}
      </div>
    </div>
  );
};

export default Latest;

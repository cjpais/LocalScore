import { useRouter } from "next/router";
import React, { useState } from "react";
import useSWR from "swr";

import ScrollableSelect from "@/components/ScrollableSelect";
import Separator from "@/components/Separator";
import { OFFICIAL_MODELS } from "@/lib/config";
import { postFetcher } from "@/lib/swr";
import {
  MetricLabels,
  MetricSortDirection,
  numberOrStringToNumber,
  PerformanceMetricKey,
  PerformanceScoresSchema,
  sortableResultKeys,
} from "@/lib/types";
import ModelMetricsChart from "@/components/charts/ModelMetrics";
import { z } from "zod";
import PageHeader from "@/components/PageHeader";
import Carat from "@/components/icons/Carat";
import ScoreCard from "@/components/ScoreCard";

const Index = () => {
  const router = useRouter();
  const [selectedKey, setSelectedKey] =
    React.useState<PerformanceMetricKey>("avg_prompt_tps");

  const { name, memory } = z
    .object({
      name: z
        .string()
        .nullish()
        .transform((v) => v ?? ""),
      memory: numberOrStringToNumber.nullish().transform((v) => v ?? 0),
    })
    .parse(router.query);

  const [selectedModel, setSelectedModel] = useState(OFFICIAL_MODELS[0]);

  console.log(name, memory);

  const { data, error, isLoading } = useSWR(
    name && memory
      ? [
          "/api/getPerformanceScores",
          {
            models: OFFICIAL_MODELS.map((m) => ({
              name: m.name,
              quantization: m.quant,
            })),
            accelerators: [{ name, memory: memory.toString() }],
            numSimilar: 2,
          },
        ]
      : null,
    ([url, payload]) => postFetcher(url, payload)
  );

  if (isLoading) return null;
  if (error) return <div>Error: {error.message}</div>;

  const parsed = PerformanceScoresSchema.safeParse(data);
  if (!data || !parsed.success) return null;
  if (parsed.data[0].results.length === 0) {
    return <div>No results found for this accelerator</div>;
  }

  const selectedModelData = parsed.data.find(
    (d) => d.model.name === selectedModel.name
  );

  const selectedData = selectedModelData?.results.sort(
    (a, b) => b.performance_score - a.performance_score
  );
  const info = parsed.data[0].results.find(
    (r) => r.accelerator_name === name && r.accelerator_memory_gb === memory
  );

  const handleModelSelect = (option: any) => {
    const model = OFFICIAL_MODELS.find((m) => m.label === option);
    if (model) setSelectedModel(model);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <p className="text-xl font-medium">{name}</p>
        <p>{`${info?.accelerator_type} / ${memory}GB`}</p>
        <Separator thickness={2} className="mt-2" />
      </div>

      <div>
        <ScrollableSelect
          options={OFFICIAL_MODELS.map((m) => m.label)}
          onSelect={handleModelSelect}
        />
      </div>

      {selectedData && (
        <div className="grid grid-cols-2 w-full gap-3">
          <ScoreCard
            title="Performance Score"
            value={selectedData[0].performance_score.toString()}
            bgColor="bg-blue-200"
            textColor="text-blue-700"
          />
          <ScoreCard
            title="Efficiency Score"
            value={selectedData[0].efficiency_score.toString()}
            bgColor="bg-emerald-200"
            textColor="text-emerald-700"
          />
          <ScoreCard
            title="Prompt Tokens Per Second"
            value={selectedData[0].avg_prompt_tps.toFixed(2)}
            unit="t/s"
            bgColor="bg-primary-100"
            textColor="text-primary-500"
            className="col-span-2"
          />
          <ScoreCard
            title="Generated Tokens Per Second"
            value={selectedData[0].avg_gen_tps.toFixed(2)}
            unit="t/s"
            bgColor="bg-primary-100"
            textColor="text-primary-500"
            className="col-span-2"
          />
          <ScoreCard
            title="Time to First Token"
            value={selectedData[0].avg_ttft.toFixed(2)}
            unit="ms"
            bgColor="bg-primary-100"
            textColor="text-primary-500"
            className="col-span-2"
          />
        </div>
      )}

      <Separator thickness={2} />

      <PageHeader text="Performance Score" />
      <ModelMetricsChart
        data={parsed.data}
        metricKey="performance_score"
        selectedModel={selectedModel}
        selectedAccelerator={{ name, memory }}
      />

      <PageHeader text="Efficiency Score" />
      <ModelMetricsChart
        data={parsed.data}
        metricKey="efficiency_score"
        selectedModel={selectedModel}
        selectedAccelerator={{ name, memory }}
      />

      <PageHeader text="Generation Tokens Per Second" />
      <ModelMetricsChart
        data={parsed.data}
        metricKey="avg_gen_tps"
        selectedModel={selectedModel}
        selectedAccelerator={{ name, memory }}
      />

      <PageHeader text="Compare" />
      <div className="relative">
        <select
          value={selectedKey}
          onChange={(e) =>
            setSelectedKey(e.target.value as PerformanceMetricKey)
          }
          className="px-5 py-2 text-primary-500 bg-primary-100 w-full border-none appearance-none rounded-md"
        >
          {sortableResultKeys.map((key) => (
            <option key={key} value={key}>
              {MetricLabels[key]}
            </option>
          ))}
        </select>
        <Carat className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>
      <ModelMetricsChart
        data={data}
        selectedModel={selectedModel}
        metricKey={selectedKey}
        sortDirection={MetricSortDirection[selectedKey]}
        selectedAccelerator={{ name, memory }}
      />

      {/* <PerformanceChart data={parsed.data} /> */}

      {/* <div className="flex flex-col">
        <p className="flex gap-1">
          <span>can i run....</span>
          <span className="underline underline-offset-4">llama 3.1 8b</span>
          <span>????</span>
        </p>
        <p>yes, you can run llama 3.1 8b with a 32k context window at q5_k.</p>
        <p>
          it will run at 69.420 tokens per second and will take 102.2ms to get a
          response from the model on average.
        </p>
      </div> */}
    </div>
  );
};

export default Index;

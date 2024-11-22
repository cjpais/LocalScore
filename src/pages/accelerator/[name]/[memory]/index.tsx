import { useRouter } from "next/router";
import React, { useState } from "react";
import useSWR from "swr";

import AcceleratorMetricsChart from "@/components/charts/AcceleratorMetrics";
import ScrollableSelect from "@/components/ScrollableSelect";
import Separator from "@/components/Separator";
import { OFFICIAL_MODELS } from "@/lib/config";
import { postFetcher } from "@/lib/swr";
import { PerformanceScoresSchema } from "@/lib/types";
import { capitalize } from "@/lib/utils";

const ScoreCard = ({
  title,
  value,
  unit = "",
  bgColor,
  textColor,
  className = "",
}: {
  title: string;
  value: string;
  unit?: string;
  bgColor: string;
  textColor: string;
  className?: string;
}) => (
  <div
    className={`flex justify-between rounded-md ${bgColor} p-5 items-center ${className}`}
  >
    <p className={`${textColor} font-medium text-lg`}>{title}</p>
    <div className="flex items-center gap-1">
      <p className="font-medium text-lg">{value}</p>
      {unit && <p>{unit}</p>}
    </div>
  </div>
);

const Index = () => {
  const router = useRouter();
  const { name, memory } = router.query;
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
            accelerators: [{ name, memory }],
          },
        ]
      : null,
    ([url, payload]) => postFetcher(url, payload)
  );

  if (isLoading) return null;
  if (error) return <div>Error: {error.message}</div>;

  const parsed = PerformanceScoresSchema.safeParse(data);
  if (!data || !parsed.success)
    return <div>{JSON.stringify(parsed.error)}</div>;
  if (parsed.data[0].results.length === 0) {
    return <div>No results found for this accelerator</div>;
  }

  const selectedModelData = parsed.data.find(
    (d) => d.model.name === selectedModel.name
  );

  const selectedData = selectedModelData?.results.sort(
    (a, b) => b.performance_score - a.performance_score
  );
  const info = parsed.data[0].results[0];

  const handleModelSelect = (option: any) => {
    const model = OFFICIAL_MODELS.find((m) => capitalize(m.label) === option);
    if (model) setSelectedModel(model);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <p className="text-xl font-medium">{name}</p>
        <p>{`${info.accelerator_type} / ${memory}GB`}</p>
        <Separator thickness={2} className="mt-2" />
      </div>

      <div>
        <ScrollableSelect
          options={OFFICIAL_MODELS.map((m) => capitalize(m.label))}
          onSelect={handleModelSelect}
        />
      </div>

      {selectedData && (
        <div className="grid grid-cols-2 w-full gap-3">
          <ScoreCard
            title="Performance Score"
            value={(selectedData[0].performance_score * 10).toFixed()}
            bgColor="bg-blue-200"
            textColor="text-blue-700"
          />
          <ScoreCard
            title="Efficiency Score"
            value={(selectedData[0].efficiency_score * 1000).toFixed()}
            bgColor="bg-emerald-200"
            textColor="text-emerald-700"
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

      <AcceleratorMetricsChart
        data={parsed.data}
        metricKey="avg_gen_tps"
        acceleratorName={name as string}
      />

      <div className="flex flex-col">
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
      </div>
    </div>
  );
};

export default Index;

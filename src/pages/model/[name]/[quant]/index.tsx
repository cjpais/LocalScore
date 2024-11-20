import Card from "@/components/Card";
import ModelMetricsChart from "@/components/charts/ModelMetrics";
import { postFetcher } from "@/lib/swr";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

import { z } from "zod";

const MetricKeyEnum = z.enum([
  "avgPromptTokensPerSecond",
  "avgGeneratedTokensPerSecond",
  "avgPromptTokensPerSecondPerWatt",
  "avgGeneratedTokensPerSecondPerWatt",
  "avgTimeToFirstTokenMs",
  "avgTime",
  "avgPower",
]);

type MetricKey = z.infer<typeof MetricKeyEnum>;

const sortDirection: Record<MetricKey, "asc" | "desc"> = {
  avgPromptTokensPerSecond: "desc",
  avgGeneratedTokensPerSecond: "desc",
  avgPromptTokensPerSecondPerWatt: "desc",
  avgGeneratedTokensPerSecondPerWatt: "desc",
  avgTimeToFirstTokenMs: "asc",
  avgTime: "asc",
  avgPower: "desc",
};
const metricLabels: Record<MetricKey, string> = {
  avgPromptTokensPerSecond: "Prompt Processing (tokens/sec)",
  avgGeneratedTokensPerSecond: "Generation Speed (tokens/sec)",
  avgPromptTokensPerSecondPerWatt:
    "Prompt Processing Efficiency (tokens/sec/W)",
  avgGeneratedTokensPerSecondPerWatt: "Generation Efficiency (tokens/sec/W)",
  avgTimeToFirstTokenMs: "Time to First Token (ms)",
  avgTime: "Average Time (ms)",
  avgPower: "Average Power (W)",
};

export const ModelPage = () => {
  const router = useRouter();
  const { name, quant } = router.query;
  const [selectedKey, setSelectedKey] = React.useState<MetricKey>(
    "avgPromptTokensPerSecond"
  );

  const { data, error, isLoading } = useSWR(
    name && quant
      ? [
          "/api/getModel",
          { model: name as string, quantization: quant as string },
        ]
      : null,
    ([url, payload]) => postFetcher(url, payload)
  );

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-2">
      <p className="font-semibold text-xl">
        {name}: {quant}
      </p>
      <div className="flex gap-2">
        <Card className="w-full">
          <p className="font-bold text-lg">Best Performing Accelerators</p>
          <ModelMetricsChart
            data={data}
            metricKey={"performanceGeometricMean"}
          />
        </Card>
        <Card className="w-full">
          <p className="font-bold text-lg">Most Efficient Accelerators</p>
          <ModelMetricsChart
            data={data}
            metricKey={"efficiencyGeometricMean"}
          />
        </Card>
      </div>
      <Card>
        <div className="flex justify-between items-center">
          <p className="font-bold text-lg">Compare</p>
          <div className="relative">
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value as MetricKey)}
              className="px-5 py-2 text-[#582acb] bg-[#e6dfff] border-none appearance-none rounded-md"
            >
              {Object.values(MetricKeyEnum.enum).map((key) => (
                <option key={key} value={key}>
                  {metricLabels[key as MetricKey]}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#582acb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        <ModelMetricsChart
          data={data}
          metricKey={selectedKey}
          sortDirection={sortDirection[selectedKey]}
        />
      </Card>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
};

export default ModelPage;

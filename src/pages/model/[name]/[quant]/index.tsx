import Card from "@/components/Card";
import ModelMetricsChart from "@/components/charts/ModelMetrics";
import Carat from "@/components/icons/Carat";
import Leaderboard from "@/components/Leaderboard";
import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import { postFetcher } from "@/lib/swr";
import {
  PerformanceScoresSchema,
  sortableResultKeys,
  PerformanceMetricKey,
  MetricLabels,
  MetricSortDirection,
} from "@/lib/types";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

export const ModelPage = () => {
  const router = useRouter();
  const { name, quant } = router.query;
  const [selectedKey, setSelectedKey] =
    React.useState<PerformanceMetricKey>("avg_gen_tps");

  const model = { name: name as string, quant: quant as string };

  const { data, error, isLoading } = useSWR(
    name && quant
      ? [
          "/api/getPerformanceScores",
          {
            models: [
              {
                name: model.name,
                quant: model.quant,
              },
            ],
          },
        ]
      : null,
    ([url, payload]) => postFetcher(url, payload)
  );

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;
  const parsed = PerformanceScoresSchema.safeParse(data);
  if (!data || !parsed.success)
    return <div>{JSON.stringify(parsed.error)}</div>;

  return (
    <div className="space-y-4">
      <PageHeader text={model.name} />

      <div className="flex gap-5">
        <div className="flex-1 rounded-md bg-primary-100 p-6">
          <h3 className="text-xl font-semibold mb-3 text-center">Parameters</h3>
          <div className="text-center text-xl">
            {parsed.data[0].model.params >= 1e12
              ? (parsed.data[0].model.params / 1e12).toFixed(2) + "T"
              : parsed.data[0].model.params >= 1e9
              ? (parsed.data[0].model.params / 1e9).toFixed(2) + "B"
              : (parsed.data[0].model.params / 1e6).toFixed(2) + "M"}
          </div>
        </div>
        <div className="flex-1 rounded-md bg-primary-100 p-6">
          <h3 className="text-xl font-semibold mb-3 text-center">
            Quantization
          </h3>
          <div className="text-center text-xl">
            {parsed.data[0].model.quant}
          </div>
        </div>
      </div>

      <Separator thickness={2} />

      <Leaderboard data={data} />
      {/* <Card className="w-full">
        <p className="font-bold text-lg">Best Performing Accelerators</p>
        <ModelMetricsChart
          data={data}
          selectedModel={model}
          metricKey={"performance_score"}
        />
      </Card> */}

      <Separator thickness={2} />

      <Card>
        <div className="flex justify-between items-center">
          <p className="font-bold text-lg">Compare</p>
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

        <ModelMetricsChart
          data={parsed.data}
          selectedModel={model}
          metricKey={selectedKey}
          sortDirection={MetricSortDirection[selectedKey]}
        />
      </Card>
    </div>
  );
};

export default ModelPage;

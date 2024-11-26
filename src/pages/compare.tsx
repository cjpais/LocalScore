import PerformanceChart from "@/components/charts/PerformanceChart";
import { OFFICIAL_MODELS } from "@/lib/config";
import { postFetcher } from "@/lib/swr";
import {
  MetricLabels,
  PerformanceMetricKey,
  PerformanceScoresSchema,
  sortableResultKeys,
} from "@/lib/types";
import React, { useState } from "react";
import useSWR from "swr";

// will be an swr hook to get the results

const Compare = () => {
  const [selectedKey, setSelectedKey] =
    useState<PerformanceMetricKey>("avg_gen_tps");
  const { data, error, isLoading } = useSWR(
    [
      "/api/getPerformanceScores",
      {
        models: OFFICIAL_MODELS.map((m) => ({
          name: m.name,
          quantization: m.quant,
        })),
      },
    ],
    ([url, payload]) => postFetcher(url, payload)
  );

  if (isLoading) return null;
  if (error) return <div>Error: {error.message}</div>;
  const parsed = PerformanceScoresSchema.safeParse(data);
  if (!data || !parsed.success)
    return <div>{JSON.stringify(parsed.error)}</div>;

  const accelerators = Array.from(
    new Map(
      parsed.data.flatMap((d) =>
        d.results.map((r) => [
          r.accelerator_name,
          {
            name: r.accelerator_name,
            type: r.accelerator_type,
            memory: r.accelerator_memory_gb,
          },
        ])
      )
    ).values()
  );

  const models = Array.from(
    new Map(
      parsed.data.flatMap((d) =>
        d.results.map((r) => [
          r.model_name,
          {
            name: r.model_name,
            quantization: r.model_quant,
          },
        ])
      )
    ).values()
  );

  return (
    <div>
      <p className="text-2xl font-bold">COMPARE</p>
      <div className="flex flex-col items-center">
        <div className="flex gap-2 items-center">
          <p className="text-xl font-medium">Metric</p>
          <div className="relative">
            <select
              value={selectedKey}
              onChange={(e) =>
                setSelectedKey(e.target.value as PerformanceMetricKey)
              }
              className="px-5 py-2 text-primary-500 bg-primary-100 border-none appearance-none rounded-md"
            >
              {sortableResultKeys.map((key) => (
                <option key={key} value={key}>
                  {MetricLabels[key]}
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
      </div>
      <PerformanceChart data={parsed.data} selectedMetric={selectedKey} />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <p>Accelerators</p>
          <div className="space-y-2">
            {accelerators.map((a) => (
              <div
                key={a.name}
                className="flex flex-col bg-primary-100 rounded-md p-2"
              >
                <p className="col-span-2 font-medium">{a.name}</p>
                <div className="flex gap-1 text-sm">
                  <p>{a.type}</p>
                  <p>/</p>
                  <p>{a.memory} GB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <p>Models</p>
          <div className="space-y-2">
            {models.map((m) => (
              <div
                key={m.name}
                className="flex flex-col bg-primary-100 rounded-md p-2"
              >
                <p className="col-span-2 font-medium">{m.name}</p>
                <p className="text-sm">{m.quantization}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;

import PerformanceChart from "@/components/charts/PerformanceChart";
import Carat from "@/components/icons/Carat";
import PageHeader from "@/components/PageHeader";
import { OFFICIAL_ACCELERATORS, OFFICIAL_MODELS } from "@/lib/config";
import { postFetcher } from "@/lib/swr";
import {
  MetricLabels,
  PerformanceMetricKey,
  PerformanceScoresSchema,
  SearchBarOption,
  SearchTypes,
  sortableResultKeys,
} from "@/lib/types";
import React, { useState } from "react";
import useSWR from "swr";

// will be an swr hook to get the results

const Compare = () => {
  const [selectedKey, setSelectedKey] =
    useState<PerformanceMetricKey>("avg_gen_tps");
  // const [selectedAccelerators, setSelectedAccelerators] = useState<
  //   SearchBarOption[]
  // >([]);
  const { data, error, isLoading } = useSWR(
    [
      "/api/getPerformanceScores",
      {
        models: OFFICIAL_MODELS.map((m) => ({
          name: m.name,
          quantization: m.quant,
        })).slice(0, 1),
        accelerators: OFFICIAL_ACCELERATORS.map((a) => ({
          name: a.name,
          memory: a.memory,
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

  const accelerators: SearchBarOption[] = Array.from(
    new Map(
      parsed.data.flatMap((d) =>
        d.results.map((r) => [
          r.accelerator_name,
          {
            value: `${r.accelerator_name} (${r.accelerator_memory_gb}GB)`,
            label: `${r.accelerator_name} (${r.accelerator_memory_gb}GB)`,
            acceleratorName: r.accelerator_name,
            group: "accelerator" as SearchTypes,
            acceleratorType: r.accelerator_type,
            acceleratorMemory: r.accelerator_memory_gb.toString(),
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
    <>
      <PageHeader text="Compare" />
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
            <Carat className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
      <PerformanceChart
        data={parsed.data}
        selectedMetric={selectedKey}
        selectedAccelerators={accelerators.map((a) => ({
          name: a.acceleratorName!,
          memory: parseFloat(a.acceleratorMemory!),
        }))}
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <p>Accelerators</p>
          {/* <SearchMultiSelect
            type="accelerator"
            defaultOptions={accelerators}
            value={selectedAccelerators}
            onChange={(accels) => setSelectedAccelerators(accels)}
          /> */}
          <div className="space-y-2">
            {accelerators.map((a) => (
              <div
                key={a.label}
                className="flex flex-col bg-primary-100 rounded-md p-2"
              >
                <p className="col-span-2 font-medium">{a.acceleratorName}</p>
                <div className="flex gap-1 text-sm">
                  <p>{a.acceleratorType}</p>
                  <p>/</p>
                  <p>{a.acceleratorMemory} GB</p>
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
    </>
  );
};

export default Compare;

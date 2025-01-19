import PerformanceChart from "@/components/charts/PerformanceChart";
import Carat from "@/components/icons/Carat";
import ModelAcceleratorSelect from "@/components/ModelAcceleratorSelect";
import PageHeader from "@/components/PageHeader";
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
  const [selectedAccelerators, setSelectedAccelerators] = useState<
    { id: string; name: string; memory: string; type: string }[]
  >([]);
  const [selectedModels, setSelectedModels] = useState<
    { variantId: string; name: string; quant: string }[]
  >([]);

  const { data, error, isLoading } = useSWR(
    [
      "/api/getPerformanceScores",
      {
        models: OFFICIAL_MODELS.map((m) => ({
          name: m.name,
          quant: m.quant,
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
        selectedAccelerators={selectedAccelerators}
        selectedModels={selectedModels}
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <p>Accelerators</p>
          <ModelAcceleratorSelect
            type="accelerator"
            onChange={(e) => {
              if (e) {
                console.log(e);
                setSelectedAccelerators([
                  ...selectedAccelerators,
                  {
                    id: e.acceleratorId!,
                    name: e.acceleratorName!,
                    memory: e.acceleratorMemory!,
                    type: e.acceleratorType!,
                  },
                ]);
              }
            }}
          />
          <div className="space-y-2">
            {selectedAccelerators.map((a) => (
              <div
                key={a.id}
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
          <ModelAcceleratorSelect
            type="model"
            onChange={(e) => {
              if (e) {
                console.log(e);
                setSelectedModels([
                  ...selectedModels,
                  {
                    variantId: e.variantId!,
                    name: e.modelName!,
                    quant: e.quantization!,
                  },
                ]);
              }
            }}
          />
          <div className="space-y-2">
            {selectedModels.map((m) => (
              <div
                key={m.name}
                className="flex flex-col bg-primary-100 rounded-md p-2"
              >
                <p className="col-span-2 font-medium">{m.name}</p>
                <p className="text-sm">{m.quant}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Compare;

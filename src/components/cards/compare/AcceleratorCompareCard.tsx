// AcceleratorCompareCard.tsx
import ModelMetricsChart from "@/components/charts/ModelMetricsChart";
import { NUM_DEFAULT_GRAPH_RESULTS } from "@/lib/config";
import {
  Accelerator,
  PerformanceMetricKey,
  PerformanceScore,
  UniqueAccelerator,
} from "@/lib/types";
import React, { useState } from "react";
import { useInitialCompareSelection } from "./useInitialCompareSelection";
import { MetricSortDirection } from "@/lib/constants";
import CompareCard from "./CompareCard";
import AcceleratorSelect from "./AcceleratorSelect";

const AcceleratorCompareCard = ({
  result,
}: {
  result: PerformanceScore | null;
}) => {
  const [selectedKey, setSelectedKey] =
    useState<PerformanceMetricKey>("avg_gen_tps");

  const {
    selectedItems: selectedAccelerators,
    setSelectedItems: setSelectedAccelerators,
  } = useInitialCompareSelection<
    { accelerator: Accelerator },
    UniqueAccelerator
  >({
    allItems: result?.results ?? [],
    officialItems: [],
    defaultCount: NUM_DEFAULT_GRAPH_RESULTS,
    itemMatchFn: (item, officialAcc) =>
      officialAcc.name === item.accelerator.name &&
      officialAcc.memory === item.accelerator.memory_gb,
    mapFn: (item) => ({
      name: item.accelerator.name,
      memory: item.accelerator.memory_gb,
    }),
  });

  if (!result) {
    return <div>Model not found</div>;
  }

  const selectedResults = {
    ...result,
    results: selectedAccelerators.length
      ? result.results.filter((r) =>
          selectedAccelerators.some(
            (acc) =>
              acc.name === r.accelerator.name &&
              acc.memory === r.accelerator.memory_gb
          )
        )
      : result.results.slice(0, NUM_DEFAULT_GRAPH_RESULTS),
  };

  const model = result.model;

  return (
    <CompareCard
      headerText="COMPARE ACCELERATORS"
      itemCount={result.results.length}
      itemsLabel="accelerators"
      selectorTitle="Select Accelerators"
      selectedKey={selectedKey}
      setSelectedKey={setSelectedKey}
      titleContent={
        <h2 className="text-center font-medium sm:text-lg text-base">
          {model.name} - {model.quant}
        </h2>
      }
      selectorComponent={
        <AcceleratorSelect
          key={model.variantId}
          accelerators={result.results.map((r) => r.accelerator)}
          onChange={(accels) =>
            setSelectedAccelerators(
              accels.map((a) => ({
                name: a.name,
                memory: a.memory_gb,
              }))
            )
          }
          defaultValue={selectedAccelerators}
        />
      }
      chartComponent={
        <ModelMetricsChart
          data={[selectedResults]}
          selectedModel={result.model}
          metricKey={selectedKey}
          sortDirection={MetricSortDirection[selectedKey]}
        />
      }
    />
  );
};

export default AcceleratorCompareCard;

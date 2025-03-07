// AcceleratorCompareCard.tsx
import ModelMetricsChart from "@/components/charts/ModelMetricsChart";
import AcceleratorSelectOptionLabel from "@/components/select/AcceleratorSelectOptionLabel";
import GenericMultiSelect from "@/components/ui/GenericMultiSelect";
import { NUM_DEFAULT_GRAPH_RESULTS, OFFICIAL_ACCELERATORS } from "@/lib/config";
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

interface AcceleratorSelectProps {
  accelerators: Accelerator[];
  onChange: (selectedAccelerators: Accelerator[]) => void;
  defaultValue?: UniqueAccelerator[];
}

const AcceleratorSelect: React.FC<AcceleratorSelectProps> = ({
  accelerators,
  onChange,
  defaultValue = [],
}) => {
  return (
    <GenericMultiSelect
      items={accelerators}
      onChange={onChange}
      defaultValue={defaultValue}
      headerText="Accelerators"
      itemKey="id"
      className="accelerator-select"
      matchFn={(acc, uniqueAcc) =>
        acc.name === uniqueAcc.name && acc.memory_gb === uniqueAcc.memory
      }
      renderOptionLabel={(acc, isFocused) => (
        <AcceleratorSelectOptionLabel acc={acc} isFocused={isFocused} />
      )}
      renderMultiValueLabel={(acc) => (
        <div className="flex flex-col p-[6px]">
          <p className="font-medium sm:text-sm text-xs">{acc.name}</p>
          <p className="sm:text-xs text-[10px]">{acc.memory_gb}GB</p>
        </div>
      )}
    />
  );
};

const AcceleratorCompareCard = ({
  result,
}: {
  result: PerformanceScore | null;
}) => {
  const [selectedKey, setSelectedKey] =
    useState<PerformanceMetricKey>("avg_gen_tps");

  if (!result) {
    return <div>Model not found</div>;
  }

  const {
    selectedItems: selectedAccelerators,
    setSelectedItems: setSelectedAccelerators,
  } = useInitialCompareSelection<
    { accelerator: Accelerator },
    UniqueAccelerator
  >({
    allItems: result.results,
    officialItems: OFFICIAL_ACCELERATORS,
    defaultCount: NUM_DEFAULT_GRAPH_RESULTS,
    itemMatchFn: (item, officialAcc) =>
      officialAcc.name === item.accelerator.name &&
      officialAcc.memory === item.accelerator.memory_gb,
    mapFn: (item) => ({
      name: item.accelerator.name,
      memory: item.accelerator.memory_gb.toString(),
    }),
  });

  const selectedResults = {
    ...result,
    results: selectedAccelerators.length
      ? result.results.filter((r) =>
          selectedAccelerators.some(
            (acc) =>
              acc.name === r.accelerator.name &&
              acc.memory === r.accelerator.memory_gb.toString()
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
        <h2 className="text-center font-medium text-lg">
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

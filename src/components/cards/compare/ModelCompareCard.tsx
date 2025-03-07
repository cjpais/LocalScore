import AcceleratorMetricsChart from "@/components/charts/AcceleratorMetricsChart";
import { NUM_DEFAULT_GRAPH_RESULTS, OFFICIAL_MODELS } from "@/lib/config";
import {
  Accelerator,
  Model,
  PerformanceMetricKey,
  PerformanceScore,
  UniqueModel,
} from "@/lib/types";
import React, { useState } from "react";
import CompareCard from "./CompareCard";
import GenericMultiSelect from "@/components/ui/GenericMultiSelect";
import ModelSelectOptionLabel from "@/components/select/ModelSelectOptionLabel";
import { useInitialCompareSelection } from "./useInitialCompareSelection";
import { MetricSortDirection } from "@/lib/constants";

interface ModelSelectProps {
  models: Model[];
  onChange: (selectedModels: Model[]) => void;
  defaultValue?: UniqueModel[];
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  models,
  onChange,
  defaultValue = [],
}) => {
  return (
    <GenericMultiSelect
      items={models}
      onChange={onChange}
      defaultValue={defaultValue}
      headerText="Models"
      itemKey="variantId"
      className="model-select"
      matchFn={(model, uniqueModel) =>
        model.name === uniqueModel.name && model.quant === uniqueModel.quant
      }
      renderOptionLabel={(model, isFocused) => (
        <ModelSelectOptionLabel model={model} isFocused={isFocused} />
      )}
      renderMultiValueLabel={(model) => (
        <div className="flex flex-col p-[6px]">
          <p className="font-medium sm:text-sm text-xs">{model.name}</p>
          <p className="sm:text-xs text-[10px]">{model.quant}</p>
        </div>
      )}
    />
  );
};

const ModelCompareCard = ({
  results,
  accelerator,
}: {
  results: PerformanceScore[] | null;
  accelerator: Accelerator;
}) => {
  const [selectedKey, setSelectedKey] =
    useState<PerformanceMetricKey>("avg_gen_tps");

  const { selectedItems: selectedModels, setSelectedItems: setSelectedModels } =
    useInitialCompareSelection<PerformanceScore, UniqueModel>({
      allItems: results ?? [],
      officialItems: OFFICIAL_MODELS,
      defaultCount: NUM_DEFAULT_GRAPH_RESULTS,
      itemMatchFn: (result, officialModel) =>
        officialModel.name === result.model.name &&
        officialModel.quant === result.model.quant,
      mapFn: (result) => ({
        name: result.model.name,
        quant: result.model.quant,
      }),
    });

  if (!results) {
    return <div>Accelerator not found</div>;
  }
  const models: Model[] = results.map((result) => result.model);

  const selectedResults = selectedModels.length
    ? results.filter((result) =>
        selectedModels.some(
          (model) =>
            model.name === result.model.name &&
            model.quant === result.model.quant
        )
      )
    : results.slice(0, NUM_DEFAULT_GRAPH_RESULTS);

  return (
    <CompareCard
      headerText="COMPARE MODELS"
      itemCount={models.length}
      itemsLabel="models"
      selectorTitle="Select Models"
      selectedKey={selectedKey}
      setSelectedKey={setSelectedKey}
      titleContent={
        <h2 className="text-center font-medium text-lg">
          {accelerator.name} - {accelerator.memory_gb}GB
        </h2>
      }
      selectorComponent={
        <ModelSelect
          key={accelerator.id}
          models={models}
          onChange={setSelectedModels}
          defaultValue={selectedModels}
        />
      }
      chartComponent={
        <AcceleratorMetricsChart
          data={selectedResults}
          metricKey={selectedKey}
          acceleratorName={accelerator.name}
          sortDirection={MetricSortDirection[selectedKey]}
        />
      }
    />
  );
};

export default ModelCompareCard;

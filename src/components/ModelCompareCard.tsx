import Card from "@/components/Card";
import AcceleratorMetricsChart from "@/components/charts/AcceleratorMetrics";
import MetricSelector from "@/components/MetricSelector";

import { OFFICIAL_MODELS } from "@/lib/config";
import {
  Accelerator,
  MetricSortDirection,
  Model,
  PerformanceMetricKey,
  PerformanceScore,
  UniqueModel,
} from "@/lib/types";

import React, { useState } from "react";
import Select, { MultiValue } from "react-select";
import Separator from "./Separator";
import { multiSelectStyles } from "@/lib/style";

interface ModelSelectProps {
  models: Model[];
  onChange: (selectedModels: Model[]) => void;
  defaultValue?: UniqueModel[];
}

interface SelectOption {
  value: string;
  label: any;
  model: Model;
}

const getModelSelectOption = (model: Model): SelectOption => {
  return {
    value: model.id,
    label: (
      <div className="flex flex-col">
        <p className="font-medium">{model.name}</p>
        <p className="text-xs text-light">{model.quant}</p>
      </div>
    ),
    model: model,
  };
};

const ModelSelect: React.FC<ModelSelectProps> = ({
  models,
  onChange,
  defaultValue = [],
}) => {
  const findMatchingModel = (uniqueModel: UniqueModel): Model | undefined => {
    return models.find(
      (model) =>
        model.name === uniqueModel.name && model.quant === uniqueModel.quant
    );
  };

  const options: SelectOption[] = models.map((model: Model) =>
    getModelSelectOption(model)
  );

  const defaultOptions: SelectOption[] = defaultValue
    .map((uniqueModel) => {
      const matchedModel = findMatchingModel(uniqueModel);
      if (!matchedModel) return null;

      return getModelSelectOption(matchedModel);
    })
    .filter((option): option is SelectOption => option !== null);

  const handleChange = (selectedOptions: MultiValue<SelectOption>) => {
    const selected = selectedOptions.map((option) => option.model);
    onChange(selected);
  };

  return (
    <Select
      isMulti
      options={options}
      defaultValue={defaultOptions}
      onChange={handleChange}
      className="model-select"
      placeholder="Select models..."
      classNamePrefix="select"
      styles={multiSelectStyles}
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
  const [selectedModels, setSelectedModels] =
    useState<UniqueModel[]>(OFFICIAL_MODELS);

  if (!results) {
    return <div>Accelerator not found</div>;
  }

  const selectedResults =
    selectedModels.length > 0
      ? results.filter((result) =>
          selectedModels.some(
            (model) =>
              model.name === result.model.name &&
              model.quant === result.model.quant
          )
        )
      : results.filter((result) =>
          OFFICIAL_MODELS.some(
            (model) =>
              model.name === result.model.name &&
              model.quant === result.model.quant
          )
        );
  const models: Model[] = results.map((result) => result.model);

  return (
    <>
      <Card>
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex gap-2 text-2xl font-black tracking-wider">
            COMPARE MODELS
          </div>
          <Separator thickness={2} />
          <div className="flex flex-col gap-0 text-lg font-medium">
            Select Models
            <ModelSelect
              key={accelerator.id}
              models={models}
              onChange={setSelectedModels}
              defaultValue={selectedModels}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <h2 className="text-center font-medium text-lg">
              {accelerator.name} - {accelerator.memory_gb}GB
            </h2>
          </div>
          <AcceleratorMetricsChart
            data={selectedResults}
            metricKey={selectedKey}
            acceleratorName={accelerator.name}
            sortDirection={MetricSortDirection[selectedKey]}
            xAxisLabel="none"
          />
          <div className="flex items-center max-w-64 w-full">
            <MetricSelector
              selectedKey={selectedKey}
              onChange={setSelectedKey}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default ModelCompareCard;

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
import Select, {
  GroupBase,
  MultiValue,
  MultiValueGenericProps,
} from "react-select";
import Separator from "./Separator";
import { multiSelectStyles } from "@/lib/style";
import ModelSelectOptionLabel from "./select/ModelSelectOptionLabel";
import MultiSelectOption from "./select/MultiSelectOption";

interface ModelSelectProps {
  models: Model[];
  onChange: (selectedModels: Model[]) => void;
  defaultValue?: UniqueModel[];
}

interface SelectOption {
  value: number;
  label: any;
  model: Model;
}

const ModelMutliValueLabel = (
  props: MultiValueGenericProps<SelectOption, true, GroupBase<SelectOption>>
) => {
  const { data } = props;
  const model = data.model as Model;

  return (
    <div className="flex flex-col p-[6px]">
      <p className="font-medium text-sm">{model.name}</p>
      <p className="text-xs">{model.quant}</p>
    </div>
  );
};

const getModelSelectOption = (model: Model): SelectOption => {
  return {
    value: model.variantId,
    label: <ModelSelectOptionLabel model={model} />,
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
      hideSelectedOptions={false}
      styles={multiSelectStyles}
      filterOption={(option, inputValue) => {
        const model = option.data.model;
        return model.name.toLowerCase().includes(inputValue.toLowerCase());
      }}
      // menuIsOpen
      components={{
        Option: MultiSelectOption,
        MultiValueLabel: ModelMutliValueLabel,
      }}
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
          <div className="flex flex-col gap-0">
            <p className="font-medium text-lg">Select Models</p>
            <ModelSelect
              key={accelerator.id}
              models={models}
              onChange={setSelectedModels}
              defaultValue={selectedModels}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-center font-medium text-lg">
              {accelerator.name} - {accelerator.memory_gb}GB
            </h2>
            <div className="flex items-center max-w-64 w-full">
              <MetricSelector
                selectedKey={selectedKey}
                onChange={setSelectedKey}
              />
            </div>
          </div>
          <AcceleratorMetricsChart
            data={selectedResults}
            metricKey={selectedKey}
            acceleratorName={accelerator.name}
            sortDirection={MetricSortDirection[selectedKey]}
            xAxisLabel="none"
          />
        </div>
      </Card>
    </>
  );
};

export default ModelCompareCard;

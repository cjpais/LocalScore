import Card from "@/components/ui/Card";
import AcceleratorMetricsChart from "@/components/charts/AcceleratorMetrics";
import MetricSelector from "@/components/MetricSelector";

import { NUM_DEFAULT_GRAPH_RESULTS, OFFICIAL_MODELS } from "@/lib/config";
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
import Separator from "./ui/Separator";
import { multiSelectStyles, selectTheme } from "@/lib/style";
import ModelSelectOptionLabel from "./select/ModelSelectOptionLabel";
import MultiSelectOption from "./select/MultiSelectOption";
import MenuListWithHeader from "./select/CustomMenuList";

interface ModelSelectProps {
  models: Model[];
  onChange: (selectedModels: Model[]) => void;
  defaultValue?: UniqueModel[];
}

interface SelectOption {
  value: number;
  model: Model;
}

const ModelMutliValueLabel = (
  props: MultiValueGenericProps<SelectOption, true, GroupBase<SelectOption>>
) => {
  const { data } = props;
  const model = data.model as Model;

  return (
    <div className="flex flex-col p-[6px]">
      <p className="font-medium sm:text-sm text-xs">{model.name}</p>
      <p className="sm:text-xs text-[10px]">{model.quant}</p>
    </div>
  );
};

const getModelSelectOption = (model: Model): SelectOption => {
  return {
    value: model.variantId,
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
      theme={selectTheme}
      components={{
        Option: (props) => (
          <MultiSelectOption {...props}>
            <ModelSelectOptionLabel
              model={props.data.model}
              isFocused={props.isFocused}
            />
          </MultiSelectOption>
        ),
        MultiValueLabel: ModelMutliValueLabel,
        MenuList: (props) => (
          <MenuListWithHeader {...props} headerText="Models" />
        ),
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
  // Initialize selected models with a strategic mix of official and other models
  const getInitialModels = () => {
    if (!results) return [];

    // First, collect all official models that exist in the results
    const availableOfficialModels = OFFICIAL_MODELS.filter((model) =>
      results.some(
        (r) => model.name === r.model.name && model.quant === r.model.quant
      )
    );

    // If we already have enough official models, use them
    if (availableOfficialModels.length >= NUM_DEFAULT_GRAPH_RESULTS) {
      return availableOfficialModels;
    }

    // Otherwise, add non-official models to reach the minimum
    const nonOfficialModels = results
      .filter(
        (r) =>
          !availableOfficialModels.some(
            (model) =>
              model.name === r.model.name && model.quant === r.model.quant
          )
      )
      .slice(0, NUM_DEFAULT_GRAPH_RESULTS - availableOfficialModels.length)
      .map((r) => ({
        name: r.model.name,
        quant: r.model.quant,
      }));

    // Combine official and additional models
    return [...availableOfficialModels, ...nonOfficialModels];
  };

  const [selectedKey, setSelectedKey] =
    useState<PerformanceMetricKey>("avg_gen_tps");
  const [selectedModels, setSelectedModels] = useState<UniqueModel[]>(
    getInitialModels()
  );

  if (!results) {
    return <div>Accelerator not found</div>;
  }

  const selectedResults = selectedModels.length
    ? results.filter((result) =>
        selectedModels.some(
          (model) =>
            model.name === result.model.name &&
            model.quant === result.model.quant
        )
      )
    : results.slice(0, NUM_DEFAULT_GRAPH_RESULTS);

  const models: Model[] = results.map((result) => result.model);

  return (
    <>
      <Card>
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex gap-2 items-center justify-between">
            <p className=" text-2xl font-black tracking-wider">
              COMPARE MODELS
            </p>
            <p>{models.length} models tested</p>
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
          <div className="w-full max-w-vw overflow-hidden">
            <AcceleratorMetricsChart
              data={selectedResults}
              metricKey={selectedKey}
              acceleratorName={accelerator.name}
              sortDirection={MetricSortDirection[selectedKey]}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default ModelCompareCard;

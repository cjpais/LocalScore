import Card from "@/components/Card";
import ModelMetricsChart from "@/components/charts/ModelMetrics";
import MetricSelector from "@/components/MetricSelector";
import { OFFICIAL_ACCELERATORS } from "@/lib/config";
import { multiSelectStyles } from "@/lib/style";
import {
  Accelerator,
  MetricSortDirection,
  PerformanceMetricKey,
  PerformanceScore,
  UniqueAccelerator,
} from "@/lib/types";
import React, { useState } from "react";
import Select, {
  GroupBase,
  MultiValue,
  MultiValueGenericProps,
} from "react-select";
import Separator from "./Separator";
import AcceleratorSelectOptionLabel from "./select/AcceleratorSelectOptionLabel";
import MultiSelectOption from "./select/MultiSelectOption";

interface AcceleratorSelectProps {
  accelerators: Accelerator[];
  onChange: (selectedAccelerators: Accelerator[]) => void;
  defaultValue?: UniqueAccelerator[]; // Optional default value
}

interface SelectOption {
  value: number;
  label: any;
  accelerator: Accelerator;
}

const AcceleratorMutliValueLabel = (
  props: MultiValueGenericProps<SelectOption, true, GroupBase<SelectOption>>
) => {
  const { data } = props;
  const accel = data.accelerator;

  return (
    <div className="flex flex-col p-[6px]">
      <p className="font-medium text-sm">{accel.name}</p>
      <p className="text-xs ">{accel.memory_gb}GB</p>
    </div>
  );
};

const getAcceleratorSelectOption = (accel: Accelerator): SelectOption => {
  return {
    value: accel.id,
    label: <AcceleratorSelectOptionLabel acc={accel} />,
    accelerator: accel,
  };
};

const AcceleratorSelect: React.FC<AcceleratorSelectProps> = ({
  accelerators,
  onChange,
  defaultValue = [],
}) => {
  // Helper function to find matching accelerator from the full list
  const findMatchingAccelerator = (
    uniqueAcc: UniqueAccelerator
  ): Accelerator | undefined => {
    return accelerators.find(
      (acc) => acc.name === uniqueAcc.name && acc.memory_gb === uniqueAcc.memory
    );
  };

  // Convert accelerators to react-select options format
  const options: SelectOption[] = accelerators.map((acc) =>
    getAcceleratorSelectOption(acc)
  );

  // Convert default value to react-select format, filtering out any unmatched accelerators
  const defaultOptions: SelectOption[] = defaultValue
    .map((uniqueAcc) => {
      const matchedAcc = findMatchingAccelerator(uniqueAcc);
      if (!matchedAcc) return null;

      return getAcceleratorSelectOption(matchedAcc);
    })
    .filter((option): option is SelectOption => option !== null);

  const handleChange = (selectedOptions: MultiValue<SelectOption>) => {
    const selected = selectedOptions.map((option) => option.accelerator);
    onChange(selected);
  };

  return (
    <Select<SelectOption, true>
      isMulti
      options={options}
      defaultValue={defaultOptions}
      onChange={handleChange}
      className="accelerator-select"
      placeholder="Select accelerators..."
      classNamePrefix="select"
      styles={multiSelectStyles}
      hideSelectedOptions={false}
      // menuIsOpen={true}
      filterOption={(option, inputValue) => {
        const accel = option.data.accelerator;
        return accel.name.toLowerCase().includes(inputValue.toLowerCase());
      }}
      components={{
        Option: MultiSelectOption,
        MultiValueLabel: AcceleratorMutliValueLabel,
      }}
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
  const [selectedAccelerators, setSelectedAccelerators] = useState<
    UniqueAccelerator[]
  >(OFFICIAL_ACCELERATORS);

  if (!result) {
    return <div>Model not found</div>;
  }
  const selectedResults = {
    ...result,
    results: selectedAccelerators.length
      ? result.results.filter((r) =>
          selectedAccelerators.some(
            (acc) =>
              acc.name === r.accelerator_name &&
              acc.memory === r.accelerator_memory_gb.toString()
          )
        )
      : result.results.slice(0, 10),
  };

  const model = result.model;

  return (
    <>
      <Card>
        <div className="flex flex-col gap-2 pb-4">
          <div className="flex gap-2 items-center justify-between">
            <p className=" text-2xl font-black tracking-wider">
              COMPARE ACCELERATORS
            </p>
            <p>{result.results.length} accelerators tested</p>
          </div>
          <Separator thickness={2} />
          <div className="flex flex-col gap-0">
            <p className="font-medium text-lg">Select Accelerators</p>
            <AcceleratorSelect
              key={model.variantId}
              accelerators={result.results.map((r) => ({
                id: r.accelerator_id,
                name: r.accelerator_name,
                type: r.accelerator_type,
                memory_gb: r.accelerator_memory_gb.toString(),
                created_at: null,
                manufacturer: null,
              }))}
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
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-center font-medium text-lg">
              {model.name} - {model.quant}
            </h2>
            <div className="flex items-center max-w-64 w-full">
              <MetricSelector
                selectedKey={selectedKey}
                onChange={setSelectedKey}
              />
            </div>
          </div>
          <ModelMetricsChart
            data={[selectedResults]}
            selectedModel={result.model}
            metricKey={selectedKey}
            sortDirection={MetricSortDirection[selectedKey]}
          />
        </div>
      </Card>
    </>
  );
};

export default AcceleratorCompareCard;

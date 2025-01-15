import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { GroupBase, OptionsOrGroups } from "react-select";
import { SearchBarOption, SearchResponse } from "@/lib/types";

const customStyles = {
  control: (base: any) => ({
    ...base,
    border: "none",
    boxShadow: "none",
    background: "transparent",
    padding: "10px 20px",
    "&:hover": {
      border: "none",
    },
  }),
  dropdownIndicator: () => ({
    display: "none",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (base: any) => ({
    ...base,
  }),
};

interface DebouncedSelectProps {
  type: "model" | "accelerator";
  onChange: (value: SearchBarOption | null) => void;
  placeholder?: string;
  className?: string;
}

const getOptionsFromResponse = (
  data: SearchResponse,
  type: "model" | "accelerator"
): OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>> => {
  if (type === "model") {
    const modelOptions = data.models.map((model) => ({
      value: `${model.name}-${model.quantization}`,
      label: `${model.name} (${model.quantization})`,
      group: "model" as const,
      modelName: model.name,
      quantization: model.quantization,
      variantId: model.variantId,
    }));

    return modelOptions;
  } else {
    const acceleratorOptions = data.accelerators.map((acc) => ({
      value: acc.name,
      label: `${acc.name} (${acc.memory_gb}GB)`,
      group: "accelerator" as const,
      acceleratorName: acc.name,
      acceleratorMemory: acc.memory_gb,
    }));

    return [
      {
        label: "Accelerators",
        options: acceleratorOptions,
      },
    ];
  }
};

const ModelAcceleratorSelect: React.FC<DebouncedSelectProps> = ({
  type,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  // TODO really need swr and debounce, as well as loading the default options when the component is mounted
  const loadOptions = async (
    inputValue: string
  ): Promise<OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>>> => {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(inputValue)}&type=${type}`
    );
    const data: SearchResponse = await response.json();
    return getOptionsFromResponse(data, type);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleOnChange = (selectedOption: SearchBarOption | null) => {
    onChange(selectedOption);
  };

  return (
    <AsyncSelect
      cacheOptions
      className={`w-full bg-primary-50 rounded-md ${className}`}
      styles={customStyles}
      loadOptions={loadOptions}
      inputValue={inputValue}
      onChange={handleOnChange}
      onInputChange={handleInputChange}
      placeholder={placeholder}
      defaultOptions
    />
  );
};

export default ModelAcceleratorSelect;

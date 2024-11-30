import { fetcher } from "@/lib/swr";
import { SearchBarOption, SearchResponse } from "@/lib/types";
import React, { useState, useCallback, useRef, useEffect } from "react";
import Select, { GroupBase, OptionsOrGroups } from "react-select";
import useSWR from "swr";

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

const getOptionsFromResponse = (
  data: SearchResponse,
  type: "model" | "accelerator"
): OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>> => {
  if (type === "model") {
    return data.models.flatMap((model) => {
      return model.quantizations.map((quant) => ({
        value: `${model.name}-${quant}`,
        label: `${model.name} (${quant})`,
        group: "model" as const,
        modelName: model.name,
        quantization: quant,
      }));
    });
  } else {
    return data.accelerators.map((acc) => ({
      value: acc.name,
      label: `${acc.name} (${acc.memory_gb}GB)`,
      group: "accelerator" as const,
      acceleratorName: acc.name,
      acceleratorMemory: acc.memory_gb,
    }));
  }
};

interface MultiSelectProps {
  className?: string;
  type: "model" | "accelerator";
  defaultOptions?: SearchBarOption[];
  onChange: (options: SearchBarOption[]) => void;
  value?: SearchBarOption[];
  placeholder?: string;
}

export const SearchMultiSelect: React.FC<MultiSelectProps> = ({
  className,
  type,
  defaultOptions = [],
  onChange,
  value,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Use SWR for data fetching
  const { data, isLoading, error } = useSWR(
    `/api/search?q=${encodeURIComponent(debouncedQuery)}&type=${type}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // Convert the response data to options
  const options: OptionsOrGroups<
    SearchBarOption,
    GroupBase<SearchBarOption>
  > = data ? getOptionsFromResponse(data, type) : defaultOptions;

  // Debounce the input
  const debouncedFetch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
  }, []);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    debouncedFetch(newValue);
  };

  const handleChange = (selectedOptions: readonly SearchBarOption[]) => {
    onChange(selectedOptions as SearchBarOption[]);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (error) {
    console.error("Error fetching options:", error);
  }

  return (
    <Select<SearchBarOption, true, GroupBase<SearchBarOption>>
      className={`w-full bg-primary-50 rounded-md ${className}`}
      styles={customStyles}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isMulti
      value={value}
      isClearable
      placeholder={placeholder || `Search ${type}s...`}
    />
  );
};

export default SearchMultiSelect;

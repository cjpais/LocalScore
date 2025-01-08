import { fetcher } from "@/lib/swr";
import { SearchBarOption, SearchResponse } from "@/lib/types";
import { useRouter } from "next/router";
import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });
import { GroupBase, OptionsOrGroups } from "react-select";
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
  data: SearchResponse
): OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>> => {
  const modelOptions = data.models.flatMap((model) => {
    return model.quantizations.map((quant) => ({
      value: `${model.name}-${quant}`,
      label: `${model.name} (${quant})`,
      group: "model" as const,
      modelName: model.name,
      quantization: quant,
    }));
  });

  const acceleratorOptions = data.accelerators.map((acc) => ({
    value: acc.name,
    label: `${acc.name} (${acc.memory_gb}GB)`,
    group: "accelerator" as const,
    acceleratorName: acc.name,
    acceleratorMemory: acc.memory_gb,
  }));

  return [
    {
      label: "Models",
      options: modelOptions,
    },
    {
      label: "Accelerators",
      options: acceleratorOptions,
    },
  ];
};

export const SearchBar: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Use SWR for data fetching
  const { data, isLoading, error } = useSWR(
    `/api/search?q=${encodeURIComponent(debouncedQuery)}`,
    fetcher,
    {
      revalidateOnFocus: false, // Prevent refetch on window focus
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  // Convert the response data to options
  const options: OptionsOrGroups<
    SearchBarOption,
    GroupBase<SearchBarOption>
  > = data ? getOptionsFromResponse(data) : [];

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

  const handleOptionSelect = useCallback(
    (option: SearchBarOption | null) => {
      if (!option) return;

      const path =
        option.group === "model"
          ? `/model/${option.modelName}/${option.quantization}`
          : `/accelerator/${option.acceleratorName}/${option.acceleratorMemory}`;

      router.push(path);
    },
    [router]
  );

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
    // @ts-ignore - for some reason the dynamic import is causing a type error
    <Select<SearchBarOption, false, GroupBase<SearchBarOption>>
      cacheOptions
      className={`w-full bg-primary-50 rounded-md ${className}`}
      styles={customStyles}
      onChange={handleOptionSelect}
      options={options}
      isLoading={isLoading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isClearable
      placeholder="Search models and accelerators..."
    />
  );
};

export default SearchBar;

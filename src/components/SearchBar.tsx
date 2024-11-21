import { SearchBarOption } from "@/lib/types";
import { useRouter } from "next/router";
import React, { useState, useCallback, useRef, useEffect } from "react";
import Select, { GroupBase, OptionsOrGroups } from "react-select";
import { z } from "zod";

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

const SearchResponseSchema = z.object({
  models: z.array(
    z.object({
      name: z.string(),
      quantizations: z.array(z.string()),
    })
  ),
  accelerators: z.array(
    z.object({
      name: z.string(),
      memory_gb: z.string(),
    })
  ),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

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
  const [options, setSearchBarOptions] = useState<
    OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fetchSearchBarOptions = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const parsedData = SearchResponseSchema.parse(data);
      const groupedSearchBarOptions = getOptionsFromResponse(parsedData);
      setSearchBarOptions(groupedSearchBarOptions);
    } catch (error) {
      console.error("Error fetching options:", error);
      setSearchBarOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSearchBarOptions("");
  }, [fetchSearchBarOptions]);

  const debouncedFetch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fetchSearchBarOptions(query);
      }, 300);
    },
    [fetchSearchBarOptions]
  );

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

  return (
    <Select<SearchBarOption, false, GroupBase<SearchBarOption>>
      className={`w-full bg-[#e6dfff66] rounded-md ${className}`}
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

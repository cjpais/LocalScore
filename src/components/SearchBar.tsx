import { fetcher } from "@/lib/swr";
import { SearchBarOption, SearchResponse } from "@/lib/types";
import { useRouter } from "next/router";
import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });
import { GroupBase, OptionsOrGroups } from "react-select";
import useSWR from "swr";
import Search from "./icons/Search";
import AcceleratorSelectOptionLabel from "./select/AcceleratorSelectOptionLabel";
import ModelSelectOptionLabel from "./select/ModelSelectOptionLabel";

const customStyles = {
  dropdownIndicator: () => ({
    display: "none",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (base: any) => ({
    ...base,
    marginTop: 0,
    marginBottom: 0,
    padding: "0px 0px",
    border: "none",
    backgroundColor: "#F1EDFC",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0px 14px 84px -14px rgba(185, 161, 252, 0.6)",
    // boxShadow: "0 0px 84px 0 rgba(185, 161, 252, 0.6)",
    clipPath:
      "polygon(-100% -50%, 0 -50%, 0 0, 100% 0, 100% -50%, 200% -50%, 200% 200%, -100% 200%)",
    // boxShadow: "none",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#e9e6f8",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#b9a1fc",
      borderRadius: "4px",
      "&:hover": {
        background: "#582acb",
      },
    },
  }),
  menuList: (base: any) => ({
    ...base,
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#e9e6f8",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#b9a1fc",
      borderRadius: "4px",
      "&:hover": {
        background: "#582acb",
      },
    },
    padding: 0,
    borderTop: "1px solid rgba(88, 42, 203, 0.1)", // #582ACB at 10% opacity
  }),
  container: (base: any, { isFocused }: any) => ({
    ...base,
    borderRadius: isFocused ? "8px 8px 0 0" : "8px",
    backgroundColor: "#F1EDFC",
  }),
  control: (base: any, { isFocused }: any) => ({
    ...base,
    background: "#F1EDFC",
    "&:hover": {
      background: isFocused ? "#F1EDFC" : "#E2DAFC",
    },
    border: "none",
    borderRadius: isFocused ? "8px 8px 0 0" : "8px",
    padding: "10px 20px",
    boxShadow: "none",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: isFocused ? "8px 8px 0 0" : "8px", // Updated to match parent's borderRadius
      boxShadow: isFocused ? "0 14px 84px 0 rgba(185, 161, 252, 0.6)" : "none",
      zIndex: -1,
    },
  }),
  group: (base: any) => ({
    ...base,
    marginTop: -4,
    // paddingTop: 8,
    // paddingBottom: 8,
  }),
  groupHeading: (base: any) => ({
    ...base,
    color: "#BAB4D9",
    fontWeight: 500,
    padding: "10px 20px",
    // borderTop: "1px solid rgba(88, 42, 203, 0.1)", // #582ACB at 10% opacity
    borderBottom: "1px solid rgba(88, 42, 203, 0.1)", // #582ACB at 10% opacity
    textTransform: "none",
  }),
  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isFocused ? "#582acb" : "#F1EDFC",
    color: isFocused ? "white" : isSelected ? "#582acb" : "inherit",
    cursor: "pointer",
    padding: "10px 20px",
    // borderTop: "1px solid rgba(88, 42, 203, 0.1)", // #582ACB at 10% opacity
    borderBottom: "1px solid rgba(88, 42, 203, 0.1)", // #582ACB at 10% opacity
    "& img": {
      filter: isFocused ? "invert(100%)" : "none",
    },
  }),
};

const getOptionsFromResponse = (
  data: SearchResponse
): OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>> => {
  const modelOptions = data.models.map((model) => ({
    value: `${model.variantId}`,
    label: <ModelSelectOptionLabel model={model} />,
    group: "model" as const,
    modelName: model.name,
    quantization: model.quant,
    variantId: model.variantId,
  }));

  const acceleratorOptions = data.accelerators.map((acc) => ({
    value: `${acc.id}`,
    label: <AcceleratorSelectOptionLabel acc={acc} />,
    group: "accelerator" as const,
    acceleratorName: acc.name,
    acceleratorMemory: acc.memory_gb,
    acceleratorId: acc.id,
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

// At the module scope, outside the component
const cache = new Map<
  string,
  {
    data: OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>>;
    timestamp: number;
  }
>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export const SearchBar: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<SearchBarOption | null>(
    null
  );
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [options, setOptions] = useState<
    OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch data with caching
  const fetchData = useCallback(async (query: string) => {
    const cacheKey = `/api/search?q=${encodeURIComponent(query)}`;
    const now = Date.now();

    // Check if we have a valid cache entry
    const cachedData = cache.get(cacheKey);
    if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY) {
      setOptions(cachedData.data);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetcher(cacheKey);
      const processedOptions = getOptionsFromResponse(response);

      // Cache the result
      cache.set(cacheKey, {
        data: processedOptions,
        timestamp: now,
      });

      setOptions(processedOptions);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset search when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setInputValue("");
      setDebouncedQuery("");
      // Important: Reset the selected option
      setSelectedOption(null);
      // Optionally reset to initial empty query data
      fetchData("");
    };

    // Subscribe to router events
    router.events.on("routeChangeComplete", handleRouteChange);

    // Clean up the event listener
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events, fetchData]);

  // Debounce the input
  const debouncedFetch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
  }, []);

  // Fetch data when debounced query changes
  useEffect(() => {
    fetchData(debouncedQuery);
  }, [debouncedQuery, fetchData]);

  // Fetch initial data when component mounts
  useEffect(() => {
    fetchData("");
  }, [fetchData]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    debouncedFetch(newValue);
  };

  const handleOptionSelect = useCallback(
    (option: SearchBarOption | null) => {
      setSelectedOption(option);
      if (!option) return;

      const path =
        option.group === "model"
          ? `/model/${option.variantId}`
          : `/accelerator/${option.acceleratorId}`;

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
    // @ts-ignore - for some reason the dynamic import is causing a type error
    <Select<SearchBarOption, false, GroupBase<SearchBarOption>>
      cacheOptions
      className={`w-full ${className}`}
      styles={customStyles}
      onChange={handleOptionSelect}
      options={options}
      value={null} // Explicitly control the value
      isLoading={isLoading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isClearable
      // menuIsOpen
      noOptionsMessage={() => "No Results"}
      blurInputOnSelect={true}
      placeholder={
        <div className="flex items-center justify-center w-full gap-2">
          <Search />
          <p className="text-primary-500">Search</p>
        </div>
      }
      filterOption={(option, inputValue) => {
        const searchTerm = inputValue.toLowerCase();
        return (
          option.data.modelName?.toLowerCase().includes(searchTerm) ||
          option.data.acceleratorName?.toLowerCase().includes(searchTerm)
        );
      }}
    />
  );
};

export default SearchBar;

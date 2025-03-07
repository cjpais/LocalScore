import { fetcher } from "@/lib/swr";
import { SearchBarOption, SearchResponse } from "@/lib/types";
import { useRouter } from "next/router";
import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });
// const AsyncSelect = dynamic(() => import("react-select/async"), { ssr: false });
import {
  components,
  GroupBase,
  InputProps,
  OptionProps,
  OptionsOrGroups,
} from "react-select";
import useSWR from "swr";
import AcceleratorSelectOptionLabel from "../select/AcceleratorSelectOptionLabel";
import ModelSelectOptionLabel from "../select/ModelSelectOptionLabel";
import SearchIcon from "../icons/SearchIcon";
import { searchStyles } from "@/lib/selectStyles";

const getOptionsFromResponse = (
  data: SearchResponse
): OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>> => {
  if (!data.models && !data.accelerators) {
    return [];
  }

  const modelOptions = data.models.map((model) => ({
    value: `${model.variantId}`,
    group: "model" as const,
    model: model,
  }));

  const acceleratorOptions = data.accelerators.map((acc) => ({
    value: `${acc.id}`,
    group: "accelerator" as const,
    accelerator: acc,
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

const CustomInput = (
  props: InputProps<SearchBarOption, false, GroupBase<SearchBarOption>>
) => {
  const { value, selectProps } = props;
  const menuIsOpen = selectProps.menuIsOpen;

  return (
    <div className="flex items-center -ml-2 gap-3">
      <SearchIcon className="w-3 h-3 flex-shrink-0" />

      {value === "" && !menuIsOpen && (
        <p className="text-primary-500 pointer-events-none">Search</p>
      )}

      <components.Input
        {...props}
        className={`caret-primary-500 ${menuIsOpen ? "w-full" : "w-0"}`}
        aria-label="Search Models and Accelerators"
      />
    </div>
  );
};

const CustomOption = (props: OptionProps<SearchBarOption>) => {
  const { data, isFocused } = props;

  // Based on the option type, render different content
  if (data.group === "model") {
    return (
      <components.Option {...props}>
        <ModelSelectOptionLabel model={data.model!} isFocused={isFocused} />
      </components.Option>
    );
  } else if (data.group === "accelerator") {
    return (
      <components.Option {...props}>
        <AcceleratorSelectOptionLabel
          acc={data.accelerator!}
          isFocused={isFocused}
        />
      </components.Option>
    );
  }

  // Fallback to default rendering
  return <components.Option {...props} />;
};

// Custom hook for debouncing
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export const SearchBar: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState<string>("");
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<SearchBarOption | null>(
    null
  );
  const [displayedOptions, setDisplayedOptions] = useState<
    OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>>
  >([]);

  // Use the debounce hook instead of manual debouncing
  const debouncedQuery = useDebounce(inputValue, 300);

  // Use SWR for data fetching and caching
  const { data, isValidating } = useSWR(
    `/api/search?q=${encodeURIComponent(debouncedQuery)}`,
    fetcher,
    {
      dedupingInterval: 5 * 60 * 1000, // 5 minutes cache
      revalidateOnFocus: false,
      keepPreviousData: true, // Important: Keep previous data while loading new data
    }
  );

  // Update displayed options only when new data arrives
  useEffect(() => {
    if (data && !data.error) {
      const processedOptions = getOptionsFromResponse(data);
      if (processedOptions) {
        setDisplayedOptions(processedOptions);
      }
    }
  }, [data]);

  // Set up router change event listeners
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsNavigating(true);
    };

    const handleRouteChangeComplete = () => {
      setIsNavigating(false);
      setSelectedOption(null);
    };

    const handleRouteChangeError = () => {
      setIsNavigating(false);
      setSelectedOption(null);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleOptionSelect = useCallback(
    (option: SearchBarOption | null) => {
      if (!option) return;

      setSelectedOption(option);
      setIsNavigating(true);

      const path =
        option.group === "model"
          ? `/model/${option.model?.variantId}`
          : `/accelerator/${option.accelerator?.id}`;

      router.push(path);
    },
    [router]
  );

  return (
    // @ts-ignore - for some reason the dynamic import is causing a type error
    <Select<SearchBarOption, false, GroupBase<SearchBarOption>>
      cacheOptions
      aria-label="Search Models and Accelerators"
      className={`w-full ${className}`}
      styles={searchStyles}
      onChange={handleOptionSelect}
      options={displayedOptions}
      value={selectedOption}
      isLoading={isValidating || isNavigating}
      onInputChange={handleInputChange}
      noOptionsMessage={() => "No Results"}
      blurInputOnSelect={true}
      components={{
        Input: CustomInput,
        Option: CustomOption,
      }}
      placeholder={null}
      filterOption={(option, inputValue) => {
        const searchTerm = inputValue.toLowerCase();
        const data = option.data as SearchBarOption;
        return (
          data.model?.name.toLowerCase().includes(searchTerm) ||
          data.accelerator?.name.toLowerCase().includes(searchTerm)
        );
      }}
    />
  );
};

export default SearchBar;

import { fetcher } from "@/lib/swr";
import { SearchBarOption, SearchResponse } from "@/lib/types";
import { useRouter } from "next/router";
import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });
import {
  components,
  GroupBase,
  InputProps,
  OptionProps,
  OptionsOrGroups,
} from "react-select";
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
    clipPath:
      "polygon(-100% -50%, 0 -50%, 0 0, 100% 0, 100% -50%, 200% -50%, 200% 200%, -100% 200%)",
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
    borderRadius: "0 0 8px 8px",
    borderTop: "1px solid rgba(88, 42, 203, 0.1)", // #582ACB at 10% opacity
    "& > div:last-child > div:last-child > div:last-child": {
      borderBottom: "none",
    },
  }),
  container: (base: any, { isFocused }: any) => ({
    ...base,
    borderRadius: isFocused ? "8px 8px 0 0" : "8px",
    backgroundColor: "#F1EDFC",
  }),
  control: (base: any, { menuIsOpen }: any) => ({
    ...base,
    background: "#F1EDFC",
    "&:hover": {
      background: menuIsOpen ? "#F1EDFC" : "#E2DAFC",
    },
    border: "none",
    borderRadius: menuIsOpen ? "8px 8px 0 0" : "8px",
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
      borderRadius: menuIsOpen ? "8px 8px 0 0" : "8px", // Updated to match parent's borderRadius
      boxShadow: menuIsOpen ? "0 14px 84px 0 rgba(185, 161, 252, 0.6)" : "none",
      zIndex: -1,
    },
  }),
  input: (base: any) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  group: (base: any) => ({
    ...base,
    padding: 0,
    // borderBottom: "1px solid rgba(88, 42, 203, 0.1)",
    // borderTop: "1px solid rgba(88, 42, 203, 0.1)",
  }),
  groupHeading: (base: any) => ({
    ...base,
    color: "#BAB4D9",
    fontWeight: 500,
    padding: "10px 20px",
    borderBottom: "1px solid rgba(88, 42, 203, 0.1)", // #582ACB at 10% opacity
    textTransform: "none",
  }),
  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isFocused ? "#582acb" : "#F1EDFC",
    color: isFocused ? "white" : isSelected ? "#582acb" : "inherit",
    cursor: "pointer",
    padding: "10px 20px",
    borderBottom: "1px solid rgba(88, 42, 203, 0.1)",
  }),
};

const getOptionsFromResponse = (
  data: SearchResponse
): OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>> => {
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
  const isOpen = selectProps.menuIsOpen;
  const isEmpty = value === "" && !isOpen;

  return (
    <div className="flex items-center w-full col-span-2">
      {isEmpty ? (
        <div className="flex items-center justify-center w-full gap-2 -ml-[6px]">
          <Search className="text-primary-500" />
          <p className="text-primary-500">Search</p>
        </div>
      ) : (
        <>
          <div className="mr-2">
            <Search className="text-primary-500" />
          </div>
          <components.Input {...props} className="caret-[#582acb]" />
        </>
      )}
      {/* Keep the actual input but hide it visually when empty */}
      {isEmpty && (
        <div className="absolute opacity-0 w-0 h-0 overflow-hidden">
          <components.Input {...props} />
        </div>
      )}
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
    if (data) {
      const processedOptions = getOptionsFromResponse(data);
      setDisplayedOptions(processedOptions);
    }
  }, [data]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleOptionSelect = useCallback(
    (option: SearchBarOption | null) => {
      if (!option) return;

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
      className={`w-full ${className}`}
      styles={customStyles}
      onChange={handleOptionSelect}
      options={displayedOptions}
      value={null}
      isLoading={isValidating}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isClearable
      noOptionsMessage={() => "No Results"}
      blurInputOnSelect={true}
      components={{ Input: CustomInput, Option: CustomOption }}
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

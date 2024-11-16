import { SearchBarOption } from "@/lib/types";
// import Link from "next/link";
import React, { useState, useCallback, useRef } from "react";
import Select, {
  //   components,
  GroupBase,
  //   MenuProps,
  //   OptionProps,
  OptionsOrGroups,
} from "react-select";
import { z } from "zod";

const customStyles = {
  control: (base: any) => ({
    ...base,
    border: "none",
    boxShadow: "none",
    background: "transparent",
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
    // You can customize the dropdown menu styles here if needed
  }),
};

// Custom Menu component to prevent click propagation
// const Menu = (props: MenuProps<SearchBarOption, false>) => {
//   return (
//     <components.Menu {...props}>
//       <div onMouseDown={(e) => e.preventDefault()}>{props.children}</div>
//     </components.Menu>
//   );
// };

// // Custom Option component with calculated href
// const Option = ({
//   children,
//   ...props
// }: OptionProps<SearchBarOption, false>) => {
//   const { data } = props;

//   // Calculate href based on the group type
//   const href =
//     data.group === "Models"
//       ? `/model/${data.modelName}/${data.quantization!}`
//       : `/accelerator/${data.acceleratorName!}/${data.acceleratorMemory}`;

//   return (
//     <components.Option {...props}>
//       <Link
//         href={href}
//         className="block w-full"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {children}
//       </Link>
//     </components.Option>
//   );
// };

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

interface SearchBarProps {
  onChange: (value: SearchBarOption | null) => void;
  value: SearchBarOption | null;
  defaultOptions?: SearchResponse;
}

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

export const SearchBar: React.FC<SearchBarProps> = ({
  onChange,
  value,
  defaultOptions,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setSearchBarOptions] = useState<
    OptionsOrGroups<SearchBarOption, GroupBase<SearchBarOption>>
  >(() => {
    if (defaultOptions) {
      return getOptionsFromResponse(defaultOptions);
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fetchSearchBarOptions = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      // Parse with Zod
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

  const debouncedFetch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (query) {
          fetchSearchBarOptions(query);
        } else {
          setSearchBarOptions([]);
        }
      }, 300); // 300ms debounce delay
    },
    [fetchSearchBarOptions]
  );

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    debouncedFetch(newValue);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key press
    if (e.key === "Enter" && options.length > 0) {
      console.log(e.target);
    }
  };

  return (
    <Select<SearchBarOption, false, GroupBase<SearchBarOption>>
      className="w-full max-w-lg bg-[#EEEEEE] rounded-md"
      value={value}
      styles={customStyles}
      onChange={onChange}
      options={options}
      isLoading={isLoading}
      inputValue={inputValue}
      onKeyDown={handleKeyDown}
      onInputChange={handleInputChange}
      isClearable
      //   components={{ Option, Menu }}
      placeholder="Search models and accelerators..."
    />
  );
};

export default SearchBar;

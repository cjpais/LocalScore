import { multiSelectStyles, selectTheme } from "@/lib/selectStyles";
import Select, {
  GroupBase,
  MultiValue,
  MultiValueGenericProps,
} from "react-select";
import MultiSelectOption from "../select/MultiSelectOption";
import MenuListWithHeader from "../select/CustomMenuList";

interface GenericItem {
  id?: number;
  variantId?: number;
  name: string;
  [key: string]: any;
}

interface UniqueIdentifier {
  name: string;
  [key: string]: any;
}

interface GenericMultiSelectProps<
  T extends GenericItem,
  U extends UniqueIdentifier
> {
  items: T[];
  onChange: (selectedItems: T[]) => void;
  defaultValue?: U[];
  placeholder?: string;
  headerText: string;
  itemKey: keyof T;
  matchFn: (item: T, uniqueItem: U) => boolean;
  renderOptionLabel: (item: T, isFocused: boolean) => React.ReactNode;
  renderMultiValueLabel: (item: T) => React.ReactNode;
  filterFn?: (item: T, inputValue: string) => boolean;
  className?: string;
}

interface SelectOption<T extends GenericItem> {
  value: number;
  item: T;
}

function GenericMultiSelect<T extends GenericItem, U extends UniqueIdentifier>({
  items,
  onChange,
  defaultValue = [],
  placeholder,
  headerText,
  itemKey,
  matchFn,
  renderOptionLabel,
  renderMultiValueLabel,
  filterFn,
  className = "",
}: GenericMultiSelectProps<T, U>) {
  const findMatchingItem = (uniqueItem: U): T | undefined => {
    return items.find((item) => matchFn(item, uniqueItem));
  };

  const getSelectOption = (item: T): SelectOption<T> => {
    return {
      value: item[itemKey] as number,
      item,
    };
  };

  const options: SelectOption<T>[] = items.map(getSelectOption);

  const defaultOptions: SelectOption<T>[] = defaultValue
    .map((uniqueItem) => {
      const matchedItem = findMatchingItem(uniqueItem);
      if (!matchedItem) return null;
      return getSelectOption(matchedItem);
    })
    .filter((option): option is SelectOption<T> => option !== null);

  const handleChange = (selectedOptions: MultiValue<SelectOption<T>>) => {
    const selected = selectedOptions.map((option) => option.item);
    onChange(selected);
  };

  const defaultFilterFn = (item: T, inputValue: string) => {
    return item.name.toLowerCase().includes(inputValue.toLowerCase());
  };

  const GenericMultiValueLabel = (
    props: MultiValueGenericProps<
      SelectOption<T>,
      true,
      GroupBase<SelectOption<T>>
    >
  ) => {
    const { data } = props;
    return renderMultiValueLabel(data.item);
  };

  return (
    <div onTouchEndCapture={(e) => e.stopPropagation()}>
      <Select<SelectOption<T>, true>
        isMulti
        options={options}
        defaultValue={defaultOptions}
        onChange={handleChange}
        className={className}
        placeholder={placeholder || `Select ${headerText.toLowerCase()}...`}
        classNamePrefix="select"
        styles={multiSelectStyles}
        hideSelectedOptions={false}
        filterOption={(option, inputValue) => {
          return (filterFn || defaultFilterFn)(option.data.item, inputValue);
        }}
        theme={selectTheme}
        components={{
          Option: (props) => (
            <MultiSelectOption {...props}>
              {renderOptionLabel(props.data.item, props.isFocused)}
            </MultiSelectOption>
          ),
          MultiValueLabel: GenericMultiValueLabel,
          MenuList: (props) => (
            <MenuListWithHeader {...props} headerText={headerText} />
          ),
        }}
      />
    </div>
  );
}

export default GenericMultiSelect;

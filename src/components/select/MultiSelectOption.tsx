import { components, OptionProps } from "react-select";

const MultiSelectOption: React.FC<OptionProps<any, true>> = (props) => (
  <components.Option {...props}>
    <div className="flex gap-2 items-center">
      <div className="w-4 font-bold">{props.isSelected ? "✓ " : ""}</div>
      <div className="w-full">{props.children}</div>
    </div>
  </components.Option>
);

export default MultiSelectOption;

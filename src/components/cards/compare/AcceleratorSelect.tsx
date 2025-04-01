import AcceleratorSelectOptionLabel from "@/components/select/AcceleratorSelectOptionLabel";
import GenericMultiSelect from "@/components/ui/GenericMultiSelect";
import { Accelerator, UniqueAccelerator } from "@/lib/types";

interface AcceleratorSelectProps {
  accelerators: Accelerator[];
  onChange: (selectedAccelerators: Accelerator[]) => void;
  defaultValue?: UniqueAccelerator[];
}

const AcceleratorSelect: React.FC<AcceleratorSelectProps> = ({
  accelerators,
  onChange,
  defaultValue = [],
}) => {
  return (
    <GenericMultiSelect
      items={accelerators}
      onChange={onChange}
      defaultValue={defaultValue}
      headerText="Accelerators"
      itemKey="id"
      className="accelerator-select"
      matchFn={(acc, uniqueAcc) =>
        acc.name === uniqueAcc.name && acc.memory_gb === uniqueAcc.memory
      }
      renderOptionLabel={(acc, isFocused) => (
        <AcceleratorSelectOptionLabel acc={acc} isFocused={isFocused} />
      )}
      renderMultiValueLabel={(acc) => (
        <div className="flex flex-col p-[6px]">
          <p className="font-medium sm:text-sm text-xs">{acc.name}</p>
          <p className="sm:text-xs text-[10px]">{acc.memory_gb}GB</p>
        </div>
      )}
    />
  );
};

export default AcceleratorSelect;

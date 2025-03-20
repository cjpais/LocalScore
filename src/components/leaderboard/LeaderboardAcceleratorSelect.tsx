import { AcceleratorType } from "@/lib/types";
import GenericSelect from "../ui/GenericSelect";

const LeaderboardAcceleratorSelect = ({
  onChange,
}: {
  onChange: (value: AcceleratorType) => void;
}) => {
  const acceleratorOptions: { value: AcceleratorType; label: string }[] = [
    { value: "GPU", label: "GPU" },
    { value: "ALL", label: "CPU+GPU" },
    { value: "CPU", label: "CPU" },
  ];

  return (
    <div className={`relative w-28 sm:w-32`}>
      <GenericSelect
        options={acceleratorOptions}
        onChange={onChange}
        roundedStyle={"both"}
        defaultValue="GPU"
      />
    </div>
  );
};

export default LeaderboardAcceleratorSelect;

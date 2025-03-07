import { PerformanceMetricKey, sortableResultKeys } from "@/lib/types";
import GenericSelect from "../ui/GenericSelect";
import { MetricLabels } from "@/lib/constants";

interface MetricSelectorProps {
  selectedKey: PerformanceMetricKey;
  onChange?: (key: PerformanceMetricKey) => void;
}

const MetricSelector: React.FC<MetricSelectorProps> = ({
  selectedKey,
  onChange,
}) => {
  const options = sortableResultKeys.map((key) => ({
    value: key,
    // TODO refactor this is odd
    label: MetricLabels[key],
  }));

  return (
    <div className="relative w-full">
      <GenericSelect
        options={options}
        defaultValue={selectedKey}
        onChange={(v) => onChange?.(v)}
        className="font-semibold"
      />
    </div>
  );
};

export default MetricSelector;

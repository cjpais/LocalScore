import {
  MetricLabels,
  PerformanceMetricKey,
  sortableResultKeys,
} from "@/lib/types";
import Carat from "./icons/Carat";

interface MetricSelectorProps {
  selectedKey: PerformanceMetricKey;
  onChange?: (key: PerformanceMetricKey) => void;
}

const MetricSelector: React.FC<MetricSelectorProps> = ({
  selectedKey,
  onChange,
}) => {
  return (
    <div className="relative w-full">
      <select
        value={selectedKey}
        onChange={(e) => onChange?.(e.target.value as PerformanceMetricKey)}
        className="px-5 py-[10px] text-primary-500 bg-primary-100 border-none appearance-none rounded-md w-full font-semibold"
      >
        {sortableResultKeys.map((key) => (
          <option key={key} value={key}>
            {MetricLabels[key]}
          </option>
        ))}
      </select>
      <Carat className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
    </div>
  );
};

export default MetricSelector;

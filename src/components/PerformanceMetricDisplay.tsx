import { PerformanceMetricKey } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";

// Components
interface MetricDisplayProps {
  label: string;
  metricKey: PerformanceMetricKey;
  value: number;
  size?: "small" | "large" | "xl";
}

const PerformanceMetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  metricKey,
  value,
  size = "small",
}) => {
  const { formatted, suffix } = formatMetricValue(metricKey, value);
  const isLarge = size === "large";
  const isXL = size === "xl";

  return (
    <div className="flex flex-col items-center sm:gap-0">
      <div
        className={`flex items-center ${
          isXL ? "sm:gap-3 gap-1" : isLarge ? "gap-2" : "gap-1.5"
        }`}
      >
        <p
          className={`font-medium ${
            isXL
              ? "text-xl sm:text-3xl" // Down one size on small screens when XL
              : isLarge
              ? "text-xl"
              : "text-lg"
          }`}
        >
          {formatted}
        </p>
        <p
          className={`${
            isXL
              ? "text-sm sm:text-lg" // Down one size on small screens when XL
              : isLarge
              ? "text-sm"
              : "text-xs"
          } font-light`}
        >
          {suffix}
        </p>
      </div>
      <p
        className={`${
          isXL
            ? "text-sm sm:text-lg" // Down one size on small screens when XL
            : isLarge
            ? "text-sm"
            : "text-xs"
        } -mt-1 text-center`}
      >
        {label}
      </p>
    </div>
  );
};

export default PerformanceMetricDisplay;

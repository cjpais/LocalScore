import { PerformanceMetricKey } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";

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

  const sizeStyles = {
    small: {
      container: "gap-1.5",
      value: "text-lg",
      suffix: "text-xs",
      label: "text-xs",
    },
    large: {
      container: "gap-2",
      value: "text-xl",
      suffix: "text-sm",
      label: "text-sm",
    },
    xl: {
      container: "sm:gap-3 gap-1",
      value: "text-xl sm:text-3xl",
      suffix: "text-sm sm:text-lg",
      label: "text-xs sm:text-lg",
    },
  };

  const styles = sizeStyles[size];

  return (
    <div className="flex flex-col items-center sm:gap-0">
      <div className={`flex items-center ${styles.container}`}>
        <p className={`font-medium ${styles.value}`}>{formatted}</p>
        <p className={`${styles.suffix} font-light`}>{suffix}</p>
      </div>
      <p className={`${styles.label} -mt-1 text-center`}>{label}</p>
    </div>
  );
};

export default PerformanceMetricDisplay;

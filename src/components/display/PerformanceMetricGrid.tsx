import React from "react";
import PerformanceMetricDisplay from "./PerformanceMetricDisplay";
import { Run } from "@/lib/types";

const PerformanceMetricGrid = ({
  run,
  size = "small",
  className = "",
}: {
  run: Run;
  size?: "small" | "large" | "xl";
  className?: string;
}) => {
  // Common classes for all sizes
  const commonClasses = "grid items-center";

  // Size-specific classes
  const sizeClasses = {
    small:
      "sm:grid-cols-4 grid-cols-2 sm:gap-2 gap-x-16 gap-y-2 col-span-6 self-center sm:self-auto",
    large: "md:grid-cols-2 grid-cols-2 gap-x-16 gap-y-4 col-span-6 self-center",
    xl: "grid-cols-2 gap-x-20 gap-y-6 col-span-12 self-stretch",
  };

  // Combine the common classes with the size-specific classes
  const gridClassName = `${commonClasses} ${sizeClasses[size]} ${className}`;

  return (
    <div className={gridClassName}>
      <PerformanceMetricDisplay
        label="generation"
        metricKey="avg_gen_tps"
        value={run.avg_gen_tps}
        size={size}
      />
      <PerformanceMetricDisplay
        label="time to first token"
        metricKey="avg_ttft"
        value={run.avg_ttft}
        size={size}
      />
      <PerformanceMetricDisplay
        label="prompt"
        metricKey="avg_prompt_tps"
        value={run.avg_prompt_tps}
        size={size}
      />
      <PerformanceMetricDisplay
        label="LocalScore"
        metricKey="performance_score"
        value={run.performance_score}
        size={size}
      />
    </div>
  );
};

export default PerformanceMetricGrid;

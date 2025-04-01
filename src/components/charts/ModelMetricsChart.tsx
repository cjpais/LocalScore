import { PerformanceMetricKey, PerformanceScore } from "@/lib/types";
import { getColor } from "@/lib/utils";
import { useMemo } from "react";
import MetricsBarChart from "./MetricsBarChart";

function ModelMetricsChart({
  data,
  selectedModel,
  highlightedAccelerator,
  metricKey,
  sortDirection = "desc",
  xAxisLabel = "",
}: {
  data: PerformanceScore[];
  selectedModel: { name: string; quant: string };
  highlightedAccelerator?: { name: string; memory: number };
  metricKey: PerformanceMetricKey;
  sortDirection?: "asc" | "desc";
  xAxisLabel?: string;
}) {
  const chartData = useMemo(() => {
    const selectedModelData = data.find(
      (item) =>
        item.model.name === selectedModel.name &&
        item.model.quant === selectedModel.quant
    );

    if (!selectedModelData) return [];

    return [...selectedModelData.results]
      .sort((a, b) => {
        const aValue = a[metricKey] || 0;
        const bValue = b[metricKey] || 0;
        return sortDirection === "desc" ? bValue - aValue : aValue - bValue;
      })
      .slice(0, 10)
      .map((item, idx) => {
        const isHighlighted =
          highlightedAccelerator &&
          item.accelerator.name === highlightedAccelerator.name &&
          item.accelerator.memory_gb == highlightedAccelerator.memory;

        return {
          name: item.accelerator.name,
          memory: item.accelerator.memory_gb,
          value: item[metricKey] || 0,
          // color: isHighlighted ? "#582acbee" : getColor(idx, 10),
          color: getColor(idx, 10),
          isHighlighted: !!isHighlighted,
        };
      });
  }, [data, selectedModel, highlightedAccelerator, metricKey, sortDirection]);

  return (
    <MetricsBarChart
      chartData={chartData}
      metricKey={metricKey}
      sortDirection={sortDirection}
      xAxisLabel={xAxisLabel}
      yAxisWidth={115}
      hasHighlighting={!!highlightedAccelerator}
      maxLabelLength={15}
      chartType="byModel"
    />
  );
}

export default ModelMetricsChart;

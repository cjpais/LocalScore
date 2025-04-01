import { PerformanceMetricKey, PerformanceScore } from "@/lib/types";
import { useMemo } from "react";
import MetricsBarChart, { ChartDataItem } from "./MetricsBarChart";
import { getColor } from "@/lib/utils";

function AcceleratorMetricsChart({
  data,
  metricKey,
  acceleratorName,
  sortDirection = "desc",
  xAxisLabel = "",
}: {
  data: PerformanceScore[];
  metricKey: PerformanceMetricKey;
  acceleratorName: string;
  sortDirection?: "asc" | "desc";
  xAxisLabel?: string;
}) {
  const chartData = useMemo(() => {
    return data
      .map((modelData) => {
        const result = modelData.results.find(
          (r) => r.accelerator.name === acceleratorName
        );
        if (result) {
          return {
            name: `${modelData.model.name} (${modelData.model.quant})`,
            value: result[metricKey],
            color: "", // Will be set after sorting
          };
        }
        return null;
      })
      .filter((item): item is ChartDataItem => item !== null)
      .sort((a, b) => {
        return sortDirection === "desc" ? b.value - a.value : a.value - b.value;
      })
      .map((item, index) => ({
        ...item,
        color: getColor(index, 10),
      }));
  }, [data, acceleratorName, metricKey, sortDirection]);

  return (
    <MetricsBarChart
      chartData={chartData}
      metricKey={metricKey}
      sortDirection={sortDirection}
      xAxisLabel={xAxisLabel}
      yAxisWidth={190}
      hasHighlighting={false}
      maxLabelLength={22}
      chartType="byAccelerator"
    />
  );
}

export default AcceleratorMetricsChart;

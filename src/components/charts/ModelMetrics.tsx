import { PerformanceScore, SortableResultKeys } from "@/lib/types";
import { getColor } from "@/lib/utils";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
  Cell,
  LabelProps,
} from "recharts";

interface ModelMetricsChartProps {
  data: PerformanceScore;
  selectedModel: { name: string; quant: string };
  metricKey: SortableResultKeys;
  sortDirection?: "asc" | "desc";
  xAxisLabel?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  // error: number; // this is for std dev, which is unused
  color: string;
}

const ModelMetricsChart: React.FC<ModelMetricsChartProps> = ({
  data,
  selectedModel,
  metricKey,
  sortDirection = "desc",
  xAxisLabel = "",
}) => {
  // Find the selected model's results
  const selectedModelData = data.find(
    (item) =>
      item.model.name === selectedModel.name &&
      item.model.quant === selectedModel.quant
  );

  // Get formatted metric name for display
  const metricName = metricKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Transform and sort the data
  const sortedData: ChartDataItem[] = selectedModelData
    ? [...selectedModelData.results]
        .sort((a, b) => {
          const aValue = a[metricKey] || 0;
          const bValue = b[metricKey] || 0;
          const comparison = bValue - aValue;
          return sortDirection === "desc" ? comparison : -comparison;
        })
        .slice(0, 10)
        .map((item, idx) => ({
          name: item.accelerator_name,
          value: item[metricKey] || 0,
          color: getColor(idx, 10),
        }))
    : [];

  const BarLabel: React.FC<LabelProps> = (props) => {
    const { x = 0, y = 0, width = 0, height = 0, value } = props;
    const numValue = typeof value === "string" ? parseFloat(value) : value ?? 0;
    return (
      <text
        x={Number(x) + Number(width) + 5}
        y={Number(y) + Number(height) / 2}
        fill="#222"
        textAnchor="start"
        dominantBaseline="middle"
        fontSize="14px"
      >
        {numValue}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        layout="vertical"
        data={sortedData}
        margin={{
          top: 20,
          right: 50,
          left: 0,
          bottom: 50,
        }}
      >
        <XAxis type="number" tick={{ fontSize: 12 }}>
          <Label
            value={xAxisLabel || metricName}
            position="bottom"
            offset={10}
            style={{ fontSize: "16px" }}
          />
        </XAxis>
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 12 }}
        />
        <Tooltip />
        <Bar dataKey="value" label={<BarLabel />}>
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ModelMetricsChart;

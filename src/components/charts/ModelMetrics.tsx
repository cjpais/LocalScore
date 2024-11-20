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
  data: Array<{
    acceleratorName: string;
    color?: string;
    // TODO don't allow any
    [key: string]: any;
  }>;
  metricKey: string;
  sortDirection?: "asc" | "desc";
  xAxisLabel?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  error: number;
  color: string;
}

const ModelMetricsChart: React.FC<ModelMetricsChartProps> = ({
  data,
  metricKey,
  sortDirection = "desc",
  xAxisLabel = "",
}) => {
  // Helper function to get the corresponding stdDev key
  const getStdDevKey = (key: string): string => {
    const baseKey = key.replace("avg", "");
    return `stdDev${baseKey}`;
  };

  // Get formatted metric name for display
  const metricName = metricKey
    .replace("avg", "")
    .split(/(?=[A-Z])/)
    .join(" ");

  // Sort data by the selected metric and take top 5
  const sortedData: ChartDataItem[] = [...data]
    .sort((a, b) => {
      const comparison = b[metricKey] - a[metricKey];
      return sortDirection === "desc" ? comparison : -comparison;
    })
    .slice(0, 5)
    .map((item) => ({
      name: item.acceleratorName,
      value: parseFloat(item[metricKey]),
      error: item[getStdDevKey(metricKey)]
        ? parseFloat(item[getStdDevKey(metricKey)])
        : 0,
      color: item.color || "#8884d8", // fallback color if none provided
    }));

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
      >
        {numValue.toFixed(2)}
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
          right: 30,
          left: 0,
          bottom: 50,
        }}
      >
        <XAxis type="number">
          <Label
            value={xAxisLabel || metricName}
            position="bottom"
            offset={10}
          />
        </XAxis>
        <YAxis type="category" dataKey="name" width={100} />
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

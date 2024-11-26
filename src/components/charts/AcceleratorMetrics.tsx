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

interface ModelResult {
  accelerator_name: string;
  model_name: string;
  model_quant: string;
  [key: string]: any;
}

interface ModelData {
  model: {
    name: string;
    id: string;
    quant: string;
  };
  results: ModelResult[];
}

interface ModelMetricsChartProps {
  data: ModelData[];
  metricKey: string;
  acceleratorName: string; // New prop to specify which accelerator to show
  sortDirection?: "asc" | "desc";
  xAxisLabel?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

const AcceleratorMetricsChart: React.FC<ModelMetricsChartProps> = ({
  data,
  metricKey,
  acceleratorName,
  sortDirection = "desc",
  xAxisLabel = "",
}) => {
  // Transform data to show models for the selected accelerator
  const chartData: ChartDataItem[] = data
    .map((modelData) => {
      const result = modelData.results.find(
        (r) => r.accelerator_name === acceleratorName
      );
      if (result) {
        return {
          name: `${modelData.model.name} (${modelData.model.quant})`,
          value: parseFloat(result[metricKey]),
        };
      }
      return null;
    })
    .filter((item): item is ChartDataItem => item !== null)
    .sort((a, b) => {
      const comparison = b.value - a.value;
      return sortDirection === "desc" ? comparison : -comparison;
    })
    .map((item, index) => ({
      ...item,
      color: getColor(index, 10),
    }));

  // Get formatted metric name for display
  const metricName = metricKey
    .replace("avg_", "")
    .split("_")
    .join(" ")
    .toUpperCase();

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
        data={chartData}
        margin={{
          top: 20,
          right: 40,
          left: 0, // Increased left margin for model names
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
        <YAxis type="category" dataKey="name" width={190} />
        <Tooltip />
        <Bar dataKey="value" label={<BarLabel />}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AcceleratorMetricsChart;

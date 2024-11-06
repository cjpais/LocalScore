import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ErrorBar,
  ResponsiveContainer,
  Label,
  Cell,
} from "recharts";

const ModelMetricsChart = ({
  data,
  metricKey,
  sortDirection = "desc",
  xAxisLabel = "",
}) => {
  // Helper function to get the corresponding stdDev key
  const getStdDevKey = (key) => {
    const baseKey = key.replace("avg", "");
    return `stdDev${baseKey}`;
  };

  // Get formatted metric name for display
  const metricName = metricKey
    .replace("avg", "")
    .split(/(?=[A-Z])/)
    .join(" ");

  // Sort data by the selected metric and take top 5
  const sortedData = [...data]
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

  const BarLabel = (props) => {
    const { x, y, width, height, value } = props;
    return (
      <text
        x={x + width + 5}
        y={y + height / 2}
        fill="#222"
        textAnchor="start"
        dominantBaseline="middle"
      >
        {value.toFixed(2)}
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
          left: 100, // Increased left margin for longer accelerator names
          bottom: 50,
        }}
      >
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis type="number">
          <Label
            value={xAxisLabel || metricName}
            position="bottom"
            offset={10}
          />
        </XAxis>
        <YAxis type="category" dataKey="name" width={180} />
        <Tooltip />
        <Bar dataKey="value" label={<BarLabel />}>
          {/* Color each bar based on the accelerator's color */}
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          {/* <ErrorBar
            dataKey="error"
            width={4}
            strokeWidth={2}
            stroke="#000000"
            direction="x"
          /> */}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ModelMetricsChart;

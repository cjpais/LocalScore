import {
  PerformanceScore,
  PerformanceMetricKey,
  MetricUnits,
  SortDirection,
} from "@/lib/types";
import { formatMetricValue, getColor } from "@/lib/utils";
import React from "react";
import { useMediaQuery } from "react-responsive";
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
  data: PerformanceScore[];
  selectedModel: { name: string; quant: string };
  highlightedAccelerator?: { name: string; memory: number };
  metricKey: PerformanceMetricKey;
  sortDirection?: SortDirection;
  xAxisLabel?: string;
}

interface ChartDataItem {
  name: string;
  memory: number;
  value: number;
  // error: number; // this is for std dev, which is unused
  color: string;
}

const ModelMetricsChart: React.FC<ModelMetricsChartProps> = ({
  data,
  selectedModel,
  highlightedAccelerator,
  metricKey,
  sortDirection = "desc",
  xAxisLabel = "",
}) => {
  const isMobile = useMediaQuery({ maxWidth: 640 });
  // Find the selected model's results
  const selectedModelData = data.find(
    (item) =>
      item.model.name === selectedModel.name &&
      item.model.quant === selectedModel.quant
  );

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
          memory: item.accelerator_memory_gb,
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
        className="sm:text-sm text-xs"
      >
        {formatMetricValue(metricKey, numValue).simple}
      </text>
    );
  };

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.min(600, sortedData.length * 50 + 150)}
    >
      <BarChart
        layout="vertical"
        data={sortedData}
        margin={{
          top: 20,
          right: isMobile ? 20 : 50,
          left: isMobile ? -20 : 0,
          bottom: 40,
        }}
      >
        <XAxis type="number" className="sm:text-sm text-xs">
          {xAxisLabel === "none" ? (
            <></>
          ) : (
            <Label
              value={`${xAxisLabel || MetricUnits[metricKey]} ${
                sortDirection === "asc"
                  ? "(lower is better)"
                  : "(higher is better)"
              }`}
              position="bottom"
              offset={10}
              className="sm:text-sm text-xs"
            />
          )}
        </XAxis>
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={({ x, y, payload }) => {
            const isSelected =
              highlightedAccelerator &&
              payload.value === highlightedAccelerator.name;
            const text = payload.value;
            const maxLength = 19;
            const lines: string[] = [];

            let remainingText = text;
            while (remainingText.length > 0) {
              if (remainingText.length <= maxLength) {
                lines.push(remainingText);
                break;
              }

              const spaceIndex = remainingText.lastIndexOf(" ", maxLength);
              if (spaceIndex === -1) {
                lines.push(remainingText.substring(0, maxLength));
                remainingText = remainingText.substring(maxLength);
              } else {
                lines.push(remainingText.substring(0, spaceIndex));
                remainingText = remainingText.substring(spaceIndex + 1);
              }
            }

            return (
              <>
                {lines.map((line, index) => (
                  <text
                    key={index}
                    x={x}
                    y={y}
                    dy={lines.length === 1 ? 4 : -4 + index * 16}
                    textAnchor="end"
                    fill="#666"
                    className="sm:text-sm text-[10px]"
                    fontWeight={isSelected ? "bold" : "normal"}
                  >
                    {line}
                  </text>
                ))}
              </>
            );
          }}
        />
        <Tooltip />
        <Bar dataKey="value" label={<BarLabel />}>
          {sortedData.map((entry, index) => {
            const isHighlightedAccelerator =
              highlightedAccelerator &&
              entry.name === highlightedAccelerator.name &&
              entry.memory === highlightedAccelerator.memory;
            const opacity = highlightedAccelerator
              ? isHighlightedAccelerator
                ? 1
                : 0.5
              : 1;
            return (
              <Cell
                key={`cell-${index}`}
                fill={isHighlightedAccelerator ? "#582acbee" : entry.color}
                fillOpacity={opacity}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ModelMetricsChart;

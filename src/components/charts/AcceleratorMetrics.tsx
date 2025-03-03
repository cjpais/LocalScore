import {
  MetricUnits,
  PerformanceMetricKey,
  PerformanceScore,
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
  metricKey: PerformanceMetricKey;
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
  const isMobile = useMediaQuery({ maxWidth: 640 });
  // Transform data to show models for the selected accelerator
  const chartData: ChartDataItem[] = data
    .map((modelData) => {
      const result = modelData.results.find(
        (r) => r.accelerator_name === acceleratorName
      );
      if (result) {
        return {
          name: `${modelData.model.name} (${modelData.model.quant})`,
          value: result[metricKey],
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
      height={Math.min(600, chartData.length * 50 + 150)}
    >
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{
          top: 20,
          right: isMobile ? 20 : 40,
          left: isMobile ? -80 : -20,
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
          width={190}
          tick={({ x, y, payload }) => {
            const text = payload.value;
            const maxLength = 24;
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
                    // fontSize={12}
                    fontWeight={"normal"}
                    className="sm:text-sm text-[10px]"
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
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AcceleratorMetricsChart;

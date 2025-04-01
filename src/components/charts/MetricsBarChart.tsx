import { MetricUnits } from "@/lib/constants";
import { PerformanceMetricKey } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { useMediaQuery } from "react-responsive";
import {
  Bar,
  BarChart,
  Cell,
  Label,
  LabelProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  isHighlighted?: boolean;
  [key: string]: any; // For additional properties
}

interface MetricsChartProps {
  chartData: ChartDataItem[];
  metricKey: PerformanceMetricKey;
  sortDirection?: "asc" | "desc";
  xAxisLabel?: string;
  yAxisWidth?: number;
  hasHighlighting?: boolean;
  maxLabelLength?: number;
  chartType: "byModel" | "byAccelerator";
}

const MetricsBarChart: React.FC<MetricsChartProps> = ({
  chartData,
  metricKey,
  sortDirection = "desc",
  xAxisLabel = "",
  yAxisWidth = 160,
  hasHighlighting = false,
  maxLabelLength = 20,
  chartType,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 640 });

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

  // Chart margins based on chart type
  const margins = {
    top: 20,
    right: isMobile ? 20 : chartType === "byModel" ? 50 : 40,
    left: isMobile
      ? chartType === "byAccelerator"
        ? -80
        : -20
      : chartType === "byAccelerator"
      ? -20
      : 0,
    bottom: 40,
  };

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.min(600, chartData.length * 50 + 150)}
    >
      <BarChart layout="vertical" data={chartData} margin={margins}>
        <XAxis type="number" className="sm:text-sm text-xs">
          {xAxisLabel === "none" ? null : (
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
          width={yAxisWidth}
          tick={({ x, y, payload }) => {
            const dataItem = chartData.find(
              (item) => item.name === payload.value
            );
            const isHighlighted = dataItem?.isHighlighted;
            const text = payload.value;
            const lines: string[] = [];

            let remainingText = text;
            while (remainingText.length > 0) {
              if (remainingText.length <= maxLabelLength) {
                lines.push(remainingText);
                break;
              }

              const spaceIndex = remainingText.lastIndexOf(" ", maxLabelLength);
              if (spaceIndex === -1) {
                lines.push(remainingText.substring(0, maxLabelLength));
                remainingText = remainingText.substring(maxLabelLength);
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
                    fontWeight={isHighlighted ? "bold" : "normal"}
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
        <Bar dataKey="value" label={(p) => <BarLabel {...p} />}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              fillOpacity={
                hasHighlighting ? (entry.isHighlighted ? 1 : 0.6) : 1
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MetricsBarChart;

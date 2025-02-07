import { PerformanceScoresSchema, PerformanceMetricKey } from "@/lib/types";
import { formatMetricValue, getColor } from "@/lib/utils";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { z } from "zod";

interface PerformanceChartProps {
  data: z.infer<typeof PerformanceScoresSchema>;
  selectedModels?: Array<{ variantId: string; name: string; quant: string }>;
  selectedAccelerators?: { id: string; name: string; memory: string }[];
  selectedMetric?: PerformanceMetricKey;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  selectedModels,
  selectedAccelerators,
  selectedMetric = "avg_gen_tps",
}) => {
  // Change to track inactive (greyed out) accelerators
  const [inactiveAccelerators, setInactiveAccelerators] = useState<string[]>(
    []
  );

  const transformData = () => {
    const formattedData = data
      .map((item) => {
        const modelName = `${item.model.name}-${item.model.quant}`;
        const resultObj: { name: string; [key: string]: number | string } = {
          name: modelName,
        };

        item.results.forEach((result) => {
          if (
            selectedAccelerators &&
            !selectedAccelerators.some(
              (acc) => acc.id === result.accelerator_id
            )
          ) {
            return;
          }
          // Only add the result if it's not 0
          resultObj[result.accelerator_name] = result[selectedMetric];
        });

        return resultObj;
      })
      .filter((item) => {
        if (!selectedModels) return true;
        return selectedModels.some(
          (model) =>
            item.name.includes(model.name) && item.name.includes(model.quant)
        );
      });

    return formattedData;
  };

  const getAcceleratorNames = () => {
    if (selectedAccelerators) {
      return selectedAccelerators.map((acc) => acc.name);
    }
    const names = new Set<string>();
    data.forEach((item) => {
      item.results.forEach((result) => {
        names.add(result.accelerator_name);
      });
    });
    return Array.from(names);
  };

  const renderCustomBarLabel = (props: any) => {
    const { x = 0, y = 0, width = 0, height = 0, value } = props;
    return (
      <text
        x={x + (width || 0) + 5}
        y={y + (height || 0) / 2}
        fill="#666"
        textAnchor="start"
        dominantBaseline="middle"
      >
        {value ? formatMetricValue(selectedMetric, value).simple : "0"}
      </text>
    );
  };

  const handleLegendClick = (dataKey: string) => {
    setInactiveAccelerators((prev) => {
      if (prev.includes(dataKey)) {
        return prev.filter((item) => item !== dataKey);
      }
      return [...prev, dataKey];
    });
  };

  const chartData = transformData();
  const acceleratorNames = getAcceleratorNames();

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {payload.map((entry: any) => (
          <li
            key={entry.value}
            style={{
              display: "inline-block",
              marginRight: "20px",
              cursor: "pointer",
              opacity: inactiveAccelerators.includes(entry.value) ? 0.5 : 1,
            }}
            onClick={() => handleLegendClick(entry.value)}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                marginRight: "5px",
                backgroundColor: entry.color,
              }}
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={chartData.length * 300}>
      <BarChart
        width={800}
        height={400}
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 40, left: 0, bottom: 50 }}
      >
        <XAxis type="number" domain={[0, "auto"]} />
        <YAxis type="category" dataKey="name" width={190} />

        <Legend content={<CustomLegend />} />
        {acceleratorNames.map((name, idx) => {
          return (
            <Bar
              key={name}
              dataKey={name}
              fill={getColor(
                idx,
                acceleratorNames.length < 5 ? 5 : acceleratorNames.length
              )}
              name={name}
              label={
                inactiveAccelerators.includes(name) ? (
                  <></>
                ) : (
                  renderCustomBarLabel
                )
              }
              hide={inactiveAccelerators.includes(name)}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;

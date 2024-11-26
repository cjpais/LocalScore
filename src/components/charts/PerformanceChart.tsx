import { PerformanceScoresSchema } from "@/lib/types";
import { getColor } from "@/lib/utils";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { z } from "zod";

interface PerformanceChartProps {
  data: z.infer<typeof PerformanceScoresSchema>;
  selectedModels?: Array<{ name: string; quant: string }>;
  selectedAccelerators?: Array<{ name: string; memory: number }>;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  selectedModels,
  selectedAccelerators,
}) => {
  // Transform the data into the format needed for Recharts
  const transformData = () => {
    const formattedData = data
      .map((item) => {
        const modelName = `${item.model.name}-${item.model.quant}`;
        const resultObj: { name: string; [key: string]: number | string } = {
          name: modelName,
        };

        item.results.forEach((result) => {
          // Filter by selected accelerators if provided
          if (
            selectedAccelerators &&
            !selectedAccelerators.some(
              (acc) =>
                acc.name === result.accelerator_name &&
                acc.memory === result.accelerator_memory_gb
            )
          ) {
            return;
          }
          resultObj[result.accelerator_name] = result.avg_gen_tps;
        });

        return resultObj;
      })
      .filter((item) => {
        // Filter by selected models if provided
        if (!selectedModels) return true;
        return selectedModels.some(
          (model) =>
            item.name.includes(model.name) && item.name.includes(model.quant)
        );
      });

    return formattedData;
  };

  // Get unique accelerator names for creating bars
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
    const { x, y, width, height, value } = props;
    return (
      <text
        x={x + width + 5}
        y={y + height / 2}
        fill="#666"
        textAnchor="start"
        dominantBaseline="middle"
      >
        {value}
      </text>
    );
  };

  const chartData = transformData();
  const acceleratorNames = getAcceleratorNames();

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        width={800}
        height={400}
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
      >
        <XAxis type="number" domain={[0, "auto"]} />
        <YAxis type="category" dataKey="name" width={190} />
        <Tooltip />
        <Legend />
        {acceleratorNames.map((name, idx) => (
          <Bar
            key={name}
            dataKey={name}
            fill={getColor(
              idx,
              acceleratorNames.length < 5 ? 5 : acceleratorNames.length
            )}
            name={name}
            label={renderCustomBarLabel}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;

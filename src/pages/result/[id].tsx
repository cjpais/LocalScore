import AcceleratorInfo from "@/components/AcceleratorInfo";
import Card from "@/components/Card";
import ModelInfo from "@/components/ModelInfo";
import PerformanceMetricDisplay from "@/components/PerformanceMetricDisplay";
import ScoreCard from "@/components/ScoreCard";
import Separator from "@/components/Separator";
import SystemInfo from "@/components/SystemInfo";
import { fetcher } from "@/lib/swr";
import { numberOrStringToNumber } from "@/lib/types";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { z } from "zod";

const SystemSchema = z.object({
  id: z.string().uuid(),
  cpu_name: z.string(),
  cpu_arch: z.string(),
  ram_gb: numberOrStringToNumber,
  kernel_type: z.string(),
  kernel_release: z.string(),
  system_version: z.string(),
  created_at: z.string(),
});

const AcceleratorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  memory_gb: z.string(),
  manufacturer: z.string(),
  created_at: z.string(),
});

const ModelSchema = z.object({
  id: z.string().uuid(),
  model_id: z.string().uuid(),
  quantization: z.string(),
  created_at: z.string(),
  name: z.string(),
  params: z.number(),
});

const RuntimeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  commit_hash: z.string().nullable(),
  release_date: z.string().nullable(),
  created_at: z.string(),
});

const ResultSchema = z.object({
  id: z.string().uuid(),
  benchmark_run_id: z.string().uuid(),
  name: z.string(),
  n_prompt: z.number(),
  n_gen: z.number(),
  avg_time_ms: z.number(),
  power_watts: z.number(),
  prompt_tps: z.number(),
  gen_tps: z.number(),
  prompt_tps_watt: z.number(),
  gen_tps_watt: z.number(),
  // vram_used_mb: z.number(),
  ttft_ms: z.number(),
  created_at: z.string(),
});

const BenchmarkRunSchema = z.object({
  id: z.string().uuid(),
  system_id: z.string().uuid(),
  accelerator_id: z.string().uuid(),
  model_variant_id: z.string().uuid(),
  runtime_id: z.string().uuid(),
  run_date: z.string(),
  created_at: z.string(),
  system: SystemSchema,
  accelerator: AcceleratorSchema,
  model: ModelSchema,
  runtime: RuntimeSchema,
  results: z.array(ResultSchema),
  avg_prompt_tps: numberOrStringToNumber,
  avg_gen_tps: numberOrStringToNumber,
  avg_ttft: numberOrStringToNumber,
  performance_score: numberOrStringToNumber,
  avg_prompt_tps_watt: numberOrStringToNumber,
  avg_joules: numberOrStringToNumber,
  avg_gen_tps_watt: numberOrStringToNumber,
  efficiency_score: numberOrStringToNumber,
});

const Page = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSWR(id ? `/api/result/${id}` : null, fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return;

  // Validate the data using Zod
  const parsedData = BenchmarkRunSchema.safeParse(data);

  if (!parsedData.success) {
    return <div>Invalid data: {parsedData.error.message}</div>;
  }

  const d = parsedData.data;

  return (
    <div className="space-y-8">
      <Card className="flex flex-col gap-4">
        <div className="w-full">
          <div className="flex gap-2 text-2xl font-black tracking-wider justify-center">
            TEST #1 RESULTS
          </div>
          <p className="text-center font-light">
            {dayjs(d.run_date).format("MM/DD/YYYY - h:mm A")}
          </p>
          <Separator thickness={2} />
        </div>

        <div className="flex justify-center w-full py-4">
          <div className="grid grid-cols-2 gap-8 gap-x-16 ">
            <PerformanceMetricDisplay
              label="generation"
              metricKey="avg_gen_tps"
              size="xl"
              value={d.avg_gen_tps}
            />
            <PerformanceMetricDisplay
              label="time to first token"
              metricKey="avg_ttft"
              size="xl"
              value={d.avg_ttft}
            />
            <PerformanceMetricDisplay
              label="prompt"
              metricKey="avg_prompt_tps"
              size="xl"
              value={d.avg_prompt_tps}
            />
            <PerformanceMetricDisplay
              label="LocalScore"
              metricKey="performance_score"
              size="xl"
              value={d.performance_score}
            />
          </div>
        </div>

        <div>
          <div className="flex gap-2 text-xl font-black tracking-wider">
            ACCELERATOR
          </div>
          <Separator thickness={2} />
        </div>

        <AcceleratorInfo {...d.accelerator} variant="xl" />

        <div>
          <div className="flex gap-2 text-xl font-black tracking-wider">
            MODEL
          </div>
          <Separator thickness={2} />
        </div>
        <ModelInfo
          {...d.model}
          quant={d.model.quantization}
          variantId={d.model_variant_id}
          variant="xl"
        />

        <div>
          <div className="flex gap-2 text-xl font-black tracking-wider">
            SYSTEM
          </div>
          <Separator thickness={2} />
        </div>
        <SystemInfo systemInfo={d.system} extended />
      </Card>

      <div className="w-full">
        <h1 className="text-xl font-bold">Results</h1>
        <table className="w-full">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Prompt Tokens/s</th>
              <th>Generated Tokens/s</th>
              <th>Time to First Token (ms)</th>
            </tr>
          </thead>
          <tbody>
            {d.results.map((result) => (
              <tr key={result.id}>
                <td>{result.name}</td>
                <td>{result.prompt_tps}</td>
                <td>{result.gen_tps}</td>
                <td>{result.ttft_ms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
};

const GridItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  return (
    <>
      <b>{label}</b>
      <p className="col-span-2">{value}</p>
    </>
  );
};

export default Page;

import ScoreCard from "@/components/ScoreCard";
import { fetcher } from "@/lib/swr";
import { numberOrStringToNumber } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { z } from "zod";

const SystemSchema = z.object({
  id: z.string().uuid(),
  cpu_name: z.string(),
  cpu_arch: z.string(),
  ram_gb: z.string(),
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
      <div>
        <h1 className="text-2xl font-bold">
          {d.accelerator.name} {d.accelerator.memory_gb}GB - {d.model.name}{" "}
          {d.model.quantization}
        </h1>
        <p>{d.run_date}</p>
      </div>
      <div>
        <div className="grid grid-cols-2 w-full gap-3">
          <ScoreCard
            title="Generation Speed"
            value={d.avg_gen_tps.toFixed(2)}
            unit="t/s"
            bgColor="bg-primary-100"
            textColor="text-primary-500"
          />
          <ScoreCard
            title="Time to First Token"
            value={d.avg_ttft.toFixed(2)}
            unit="ms"
            bgColor="bg-primary-100"
            textColor="text-primary-500"
          />
          <ScoreCard
            title="Prompt Speed"
            value={d.avg_prompt_tps.toFixed(2)}
            unit="t/s"
            bgColor="bg-primary-100"
            textColor="text-primary-500"
          />
          <ScoreCard
            title="LocalScore"
            value={d.performance_score.toFixed()}
            bgColor="bg-blue-200"
            textColor="text-blue-700"
          />
        </div>
      </div>
      <div className="w-full p-2 bg-primary-100 rounded-md">
        <h1 className="text-xl font-bold">System Info</h1>
        <div className="grid grid-cols-3">
          <GridItem label="cpu" value={d.system.cpu_name} />
          <GridItem label="ram" value={`${d.system.ram_gb} GB`} />
          <GridItem label="arch" value={d.system.cpu_arch} />
          <GridItem label="kernel" value={d.system.kernel_type} />
          <GridItem label="kernel release" value={d.system.kernel_release} />
          <GridItem label="system version" value={d.system.system_version} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <Link
          className="w-full p-2 bg-primary-100 rounded-md"
          href={`/accelerator/${d.accelerator.name}/${d.accelerator.memory_gb}`}
        >
          <h1 className="text-xl font-bold">Accelerator Info</h1>
          <div className="grid grid-cols-3">
            <GridItem label="name" value={d.accelerator.name} />
            <GridItem label="memory" value={`${d.accelerator.memory_gb} GB`} />
            <GridItem label="type" value={d.accelerator.type} />
          </div>
        </Link>
        <div className="w-full p-2 bg-primary-100 rounded-md">
          <h1 className="text-xl font-bold">Runtime Info</h1>
          <div className="grid grid-cols-3">
            <GridItem label="name" value={d.runtime.name} />
            <GridItem label="version" value={d.runtime.version} />
            {/* <GridItem label="commit hash" value={d.runtime.commit_hash || ""} />
            <GridItem
              label="release date"
              value={d.runtime.release_date || ""}
            /> */}
          </div>
        </div>
      </div>
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

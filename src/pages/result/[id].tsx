import { fetcher } from "@/lib/swr";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { z } from "zod";

const SystemSchema = z.object({
  id: z.string().uuid(),
  cpu_name: z.string(),
  cpu_architecture: z.string(),
  ram_gb: z.string(),
  kernel_type: z.string(),
  kernel_release: z.string(),
  system_version: z.string(),
  system_architecture: z.string(),
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
});

const RuntimeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  commit_hash: z.string(),
  release_date: z.string(),
  created_at: z.string(),
});

const ResultSchema = z.object({
  id: z.string().uuid(),
  benchmark_run_id: z.string().uuid(),
  test_name: z.string(),
  prompt_length: z.number(),
  generation_length: z.number(),
  avg_time_ms: z.number(),
  power_watts: z.number(),
  prompt_tokens_per_second: z.number(),
  prompt_tokens_per_second_per_watt: z.number(),
  generated_tokens_per_second: z.number(),
  generated_tokens_per_second_per_watt: z.number(),
  context_window_size: z.number(),
  vram_used_mb: z.number(),
  time_to_first_token_ms: z.number(),
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
      <div></div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-96 p-2 bg-orange-200 rounded-lg border-4 border-orange-400">
          <h1 className="text-xl font-bold">System Info</h1>
          <div className="grid grid-cols-2">
            <GridItem label="cpu" value={d.system.cpu_name} />
            <GridItem label="ram" value={`${d.system.ram_gb} GB`} />
            <GridItem label="arch" value={d.system.cpu_architecture} />
            <GridItem label="kernel" value={d.system.kernel_type} />
            <GridItem label="kernel release" value={d.system.kernel_release} />
            <GridItem label="system version" value={d.system.system_version} />
          </div>
        </div>
        <a
          className="w-96 p-2 bg-orange-200 rounded-lg border-4 border-orange-400"
          href={`/accelerator/${d.accelerator.name.replaceAll(" ", ":")}-${
            d.accelerator.memory_gb
          }`}
        >
          <h1 className="text-xl font-bold">Accelerator Info</h1>
          <div className="grid grid-cols-2">
            <GridItem label="name" value={d.accelerator.name} />
            <GridItem label="memory" value={`${d.accelerator.memory_gb} GB`} />
            <GridItem label="type" value={d.accelerator.type} />
          </div>
        </a>
        <div className="w-96 p-2 bg-orange-200 rounded-lg border-4 border-orange-400">
          <h1 className="text-xl font-bold">Runtime Info</h1>
          <div className="grid grid-cols-2">
            <GridItem label="name" value={d.runtime.name} />
            <GridItem label="version" value={d.runtime.version} />
            <GridItem label="commit hash" value={d.runtime.commit_hash} />
            <GridItem label="release date" value={d.runtime.release_date} />
          </div>
        </div>
      </div>
      <div className="w-full p-2 bg-orange-200 rounded-lg border-4 border-orange-400">
        <h1 className="text-xl font-bold">Results</h1>
        <table className="w-full">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Prompt Length</th>
              <th>Generation Length</th>
              <th>Avg Time (ms)</th>
              <th>Power (W)</th>
              <th>Prompt Tokens/s</th>
              <th>Prompt Tokens/s/W</th>
              <th>Generated Tokens/s</th>
              <th>Generated Tokens/s/W</th>
              <th>Context Window Size</th>
              <th>VRAM Used (MB)</th>
              <th>Time to First Token (ms)</th>
            </tr>
          </thead>
          <tbody>
            {d.results.map((result) => (
              <tr key={result.id}>
                <td>{result.test_name}</td>
                <td>{result.prompt_length}</td>
                <td>{result.generation_length}</td>
                <td>{result.avg_time_ms}</td>
                <td>{result.power_watts}</td>
                <td>{result.prompt_tokens_per_second}</td>
                <td>{result.prompt_tokens_per_second_per_watt}</td>
                <td>{result.generated_tokens_per_second}</td>
                <td>{result.generated_tokens_per_second_per_watt}</td>
                <td>{result.context_window_size}</td>
                <td>{result.vram_used_mb}</td>
                <td>{result.time_to_first_token_ms}</td>
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
      <p>{value}</p>
    </>
  );
};

export default Page;

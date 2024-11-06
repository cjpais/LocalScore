import { fetcher } from "@/lib/swr";
import React from "react";
import useSWR from "swr";
import { z } from "zod";

const RunSchema = z.object({
  id: z.string().uuid(),
  system_id: z.string().uuid(),
  accelerator_id: z.string().uuid(),
  model_variant_id: z.string().uuid(),
  runtime_id: z.string().uuid(),
  run_date: z.string(),
  created_at: z.string(),
  accelerator: z.string(),
  accelerator_memory_gb: z.string(),
  model: z.string(),
  quantization: z.string(),
});

const RunsSchema = z.array(RunSchema);

const Latest = () => {
  const { data, error } = useSWR(`/api/results`, fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return;

  const parsedData = RunsSchema.safeParse(data);

  if (!parsedData.success) {
    return <div>Invalid data: {parsedData.error.message}</div>;
  }

  const d = parsedData.data;

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-2xl">latest llamascore results</h1>
      <div className="flex flex-col gap-4">
        {d.map((run) => (
          <a
            href={`/result/${run.id}`}
            key={run.id}
            className="p-4 grid grid-cols-4 border border-gray-200 rounded-lg"
          >
            <div>
              <p>Accelerator</p>
              <a
                href={`/accelerator/${run.accelerator.replaceAll(" ", "-")}/${
                  run.accelerator_memory_gb
                }`}
              >
                {run.accelerator} {run.accelerator_memory_gb}GB
              </a>
            </div>
            <div>
              <p>Uploaded</p>
              <p>{run.run_date}</p>
            </div>
            <div>
              <p>Model</p>
              <p>
                {run.model} {run.quantization}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Latest;

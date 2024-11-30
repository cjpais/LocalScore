import PageHeader from "@/components/PageHeader";
import { fetcher } from "@/lib/swr";
import Link from "next/link";
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
  accelerator_type: z.string(),
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
    <>
      <PageHeader text="Latest LocalScore Results" />
      <div className="flex flex-col gap-6">
        {d.map((run) => (
          <div key={run.id} className="">
            <div className="flex justify-between">
              <div className="flex text-sm gap-1">
                <Link
                  href={`/result/${run.id}`}
                  className="text-primary-500 hover:underline"
                >
                  {run.id}
                </Link>
              </div>
              <div className="text-sm">
                <p>{new Date(run.run_date).toDateString()}</p>
              </div>
            </div>
            <div className="flex justify-between bg-primary-50 rounded-md p-2 items-center">
              <div className="flex flex-col">
                <Link
                  className="font-bold text-primary-500 hover:underline"
                  href={`/accelerator/${run.accelerator}/${run.accelerator_memory_gb}`}
                >
                  {run.accelerator}
                </Link>
                <div className="text-sm">
                  {run.accelerator_type} / {run.accelerator_memory_gb}GB
                </div>
              </div>
              <Link
                href={`/model/${run.model}/${run.quantization}`}
                className="text-primary-500 hover:underline"
              >
                <p className="font-medium">{run.model}</p>
                <p className=" text-right"> {run.quantization}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Latest;

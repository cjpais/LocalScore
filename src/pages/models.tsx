import { fetcher } from "@/lib/swr";
import Link from "next/link";
import React from "react";
import useSWR from "swr";
import { z } from "zod";

const ResponseSchema = z.array(
  z.object({ model: z.string(), quantization: z.string() })
);

const Models = () => {
  const { data, error, isLoading } = useSWR("/api/models", fetcher);

  if (error || isLoading) return;
  //   if (error) return <div>Failed to load</div>;
  //   if (isLoading) return <div>Loading...</div>;

  const parsed = ResponseSchema.safeParse(data);
  if (!parsed.success) {
    return (
      <div>
        <pre>{JSON.stringify(parsed.error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1>All Models</h1>
      <div>search here</div>
      <div className="grid grid-cols-3 gap-8 max-w-4xl pt-12 self-center">
        {parsed.data.map((model) => (
          <div key={model.model} className="w-full">
            <Link href={`/model/${model.model}/${model.quantization}`}>
              {model.model}
            </Link>
            <p>{model.quantization}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Models;

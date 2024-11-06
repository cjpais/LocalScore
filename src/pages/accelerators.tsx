import { fetcher } from "@/lib/swr";
import Link from "next/link";
import React from "react";
import useSWR from "swr";
import { z } from "zod";

const ResponseSchema = z.array(
  z.object({
    name: z.string(),
    memory: z.string(),
    type: z.string(),
    manufacturer: z.string(),
  })
);

const Accelerators = () => {
  const { data, error, isLoading } = useSWR("/api/accelerators", fetcher);

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
      <h1>All Accelerators</h1>
      <div>search here</div>
      <div className="grid grid-cols-3 gap-8 max-w-4xl pt-12 self-center">
        {parsed.data.map((accelerator, id) => (
          <Link
            key={id}
            href={`/accelerator/${accelerator.name}/${accelerator.memory}`}
          >
            <div className="flex flex-col">
              <p>
                {accelerator.name} - {accelerator.memory}
              </p>
              <p>{accelerator.type}</p>
              <p>{accelerator.manufacturer}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Accelerators;

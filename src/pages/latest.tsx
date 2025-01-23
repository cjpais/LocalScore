import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import { getBenchmarkResults } from "@/db/queries";
import { PerformanceMetricKey, Run, System } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import dayjs from "dayjs";
import Card from "@/components/Card";
import PerformanceMetricDisplay from "@/components/PerformanceMetricDisplay";
import AcceleratorInfo from "@/components/AcceleratorInfo";
import ModelInfo from "@/components/ModelInfo";
import SystemInfo from "@/components/SystemInfo";

const RunCard: React.FC<{ run: Run }> = ({ run }) => (
  <Card className="flex flex-col">
    <div className="flex flex-col justify-between pb-1">
      <div className="flex justify-between">
        <Link
          href={`/result/${run.id}`}
          className="text-primary-500 hover:underline text-sm font-medium"
        >
          {run.id}
        </Link>
        <p className="text-sm text-gray-600 font-light">
          {dayjs(run.run_date).format("MM/DD/YYYY - h:mm A")}
        </p>
      </div>
    </div>
    <Separator thickness={2} className="pb-2" />
    <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] py-1.5">
      <div className="flex flex-col col-span-8 justify-center gap-1">
        <AcceleratorInfo
          id={run.accelerator_id}
          name={run.accelerator}
          type={run.accelerator_type}
          memory_gb={run.accelerator_memory_gb}
        />

        <ModelInfo {...run.model} />
      </div>
      {/* <div className="w-[2px] h-full bg-black"></div> */}
      <Separator
        thickness={2}
        direction="vertical"
        className="flex justify-end self-end"
      />
      <div className="grid grid-cols-2 gap-2 col-span-7">
        <PerformanceMetricDisplay
          label="generation"
          metricKey="avg_gen_tps"
          value={run.avg_gen_tps}
        />
        <PerformanceMetricDisplay
          label="time to first token"
          metricKey="avg_ttft"
          value={run.avg_ttft}
        />
        <PerformanceMetricDisplay
          label="prompt"
          metricKey="avg_prompt_tps"
          value={run.avg_prompt_tps}
        />
        <PerformanceMetricDisplay
          label="LocalScore"
          metricKey="performance_score"
          value={run.performance_score}
        />
      </div>
    </div>
    <Separator thickness={2} className="mt-2" />
    <SystemInfo systemInfo={run.system} />
  </Card>
);

const Latest = ({ results }: { results: Run[] }) => {
  const router = useRouter();
  const { offset } = router.query;
  const currentOffset = Number(offset) || 0;

  const handleNext = () => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, offset: currentOffset + 10 },
    });
  };

  const handlePrevious = () => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, offset: currentOffset - 10 },
    });
  };

  return (
    <div className="">
      <PageHeader text="Latest LocalScore Results" />
      <div className="flex flex-col gap-4 mt-6">
        {results.map((run) => (
          <RunCard key={run.id} run={run} />
        ))}
      </div>
      <div className="flex justify-between mt-6">
        {currentOffset > 0 && (
          <button
            onClick={handlePrevious}
            className="px-4 py-2 bg-primary-500 text-white rounded"
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-primary-500 text-white rounded ml-auto"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { offset } = context.query;
  const offsetValue = offset ? parseInt(offset as string) : 0;

  const results = await getBenchmarkResults({
    sortDirection: "desc",
    limit: 10,
    offset: offsetValue,
  });

  return {
    props: {
      results,
    },
  };
};

export default Latest;

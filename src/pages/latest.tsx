import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import { getBenchmarkResults } from "@/db/queries";
import { Run } from "@/lib/types";
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
          Test #{run.id}
        </Link>
        <p className="text-sm text-gray-600 font-light">
          {dayjs(run.run_date).format("MM/DD/YYYY - h:mm A")}
        </p>
      </div>
    </div>
    <Separator thickness={2} className="pb-2" />
    <div className="flex flex-col md:grid md:grid-cols-[repeat(16,minmax(0,1fr))] py-1.5">
      <div className="flex md:flex-col sm:flex-row flex-col col-span-9 justify-center gap-1 pr-2">
        <AcceleratorInfo
          id={run.accelerator_id}
          name={run.accelerator}
          type={run.accelerator_type}
          memory_gb={run.accelerator_memory_gb}
        />

        <Separator thickness={2} direction="vertical" className="md:hidden" />

        <ModelInfo {...run.model} />
      </div>
      <Separator
        thickness={2}
        direction="vertical"
        className="justify-end self-end hidden md:flex"
      />
      <Separator
        thickness={2}
        direction="horizontal"
        className="block md:hidden my-2"
      />
      <div className="grid md:grid-cols-2 sm:grid-cols-4 grid-cols-2 sm:gap-2 gap-x-16 gap-y-2 col-span-6 items-center self-center sm:self-auto">
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
      <PageHeader>Latest LocalScore Results</PageHeader>
      <div className="flex flex-col gap-4 mt-6">
        {results.map((run) => (
          <RunCard key={run.id} run={run} />
        ))}
      </div>
      <div className="flex justify-between mt-6">
        {currentOffset > 0 && (
          <button
            onClick={handlePrevious}
            className="px-4 py-2 bg-primary-100 text-primary-500 hover:text-white hover:bg-primary-500 rounded"
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-primary-100 text-primary-500 hover:text-white hover:bg-primary-500 rounded ml-auto"
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

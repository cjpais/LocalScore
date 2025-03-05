import PageHeader from "@/components/layout/PageHeader";
import { getBenchmarkResults } from "@/db/queries";
import { Run } from "@/lib/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import Head from "next/head";
import LatestRunCard from "@/components/cards/LatestRunCard";

const PaginationControls = () => {
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
  );
};

const Latest = ({ results }: { results: Run[] }) => {
  return (
    <>
      <Head>
        <title>Lastest LocalScore Results</title>
        <meta
          name="description"
          content="View the most recent user-submitted LocalScore benchmarks comparing GPU and AI accelerator inference speeds. See real-world performance data from the community on running AI models locally."
        />
      </Head>

      <div>
        <PageHeader>Latest LocalScore Results</PageHeader>
        <div className="flex flex-col gap-4 mt-6">
          {results.map((run) => (
            <LatestRunCard key={run.id} run={run} />
          ))}
        </div>

        <PaginationControls />
      </div>
    </>
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

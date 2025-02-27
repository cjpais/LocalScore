import AcceleratorCompareCard from "@/components/AcceleratorCompareCard";
import Leaderboard from "@/components/Leaderboard";
import ModelInfo from "@/components/ModelInfo";
import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import {
  getPerformanceScores,
  getTopAcceleratorsByModelVariants,
} from "@/db/queries";
import { PerformanceScore } from "@/lib/types";
import { GetServerSideProps } from "next";
import React from "react";

const Index = ({ result }: { result: PerformanceScore | null }) => {
  if (!result) {
    return <div>Model not found</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader>
        <ModelInfo {...result.model} variant="header" />
      </PageHeader>

      <AcceleratorCompareCard result={result} />

      <Separator thickness={2} />

      <Leaderboard data={[result]} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  // TODO use zod in types.
  const modelVariantIds = [parseInt(id as string)];

  const acceleratorIds = await getTopAcceleratorsByModelVariants({
    modelVariantIds,
  });

  const results = await getPerformanceScores(acceleratorIds, modelVariantIds);

  return {
    props: {
      result: results[0] || null,
    },
  };
};

export default Index;

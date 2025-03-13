import AcceleratorCompareCard from "@/components/cards/compare/AcceleratorCompareCard";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import ModelInfo from "@/components/display/ModelInfo";
import PageHeader from "@/components/layout/PageHeader";
import Separator from "@/components/ui/Separator";
import {
  getPerformanceScores,
  getTopAcceleratorsByModelVariants,
} from "@/db/queries";
import { PerformanceScore } from "@/lib/types";
import { GetServerSideProps } from "next";
import React from "react";
import Meta from "@/components/layout/Meta";

const Index = ({
  result,
  id,
}: {
  result: PerformanceScore | null;
  id: string;
}) => {
  if (!result) {
    return <div>Model not found</div>;
  }

  return (
    <div className="space-y-4">
      <Meta
        title={`${result.model.name} - ${result.model.quant} Results`}
        description={`Compare how different accelerators perform on the model ${result.model.name} - ${result.model.quant}`}
      />

      <PageHeader>
        <ModelInfo {...result.model} variant="header" />
      </PageHeader>

      <AcceleratorCompareCard result={result} key={id} />

      <Separator thickness={2} />

      <Leaderboard data={[result]} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600"
  );

  const { id: idRaw } = context.query;
  const id = idRaw as string;

  // TODO use zod in types.
  const modelVariantIds = [parseInt(id)];

  const acceleratorIds = await getTopAcceleratorsByModelVariants({
    modelVariantIds,
  });

  const results = await getPerformanceScores(acceleratorIds, modelVariantIds);

  return {
    props: {
      result: results[0] || null,
      id,
    },
  };
};

export default Index;

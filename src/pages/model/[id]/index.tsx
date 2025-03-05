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
import Head from "next/head";
import React from "react";

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
      <Head>
        <title>
          {result.model.name} - {result.model.quant} Results
        </title>
        <meta
          name="description"
          content={`Compare how different accelerators perform on the model ${result.model.name} - ${result.model.quant}`}
        />
      </Head>

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

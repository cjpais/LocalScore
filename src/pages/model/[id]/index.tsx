import AcceleratorCompareCard from "@/components/AcceleratorCompareCard";
import Leaderboard from "@/components/Leaderboard";
import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import {
  getPerformanceScores,
  getTopAcceleratorsByModelVariants,
} from "@/db/queries";
import { PerformanceScore } from "@/lib/types";
import { getModelParamsString } from "@/lib/utils";
import { GetServerSideProps } from "next";
import React from "react";

const Index = ({ result }: { result: PerformanceScore | null }) => {
  if (!result) {
    return <div>Model not found</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader text={result.model.name} />

      <div className="flex gap-5">
        <div className="flex-1 rounded-md bg-primary-100 p-6">
          <h3 className="text-xl font-semibold mb-3 text-center">Parameters</h3>
          <div className="text-center text-xl">
            {getModelParamsString(result.model.params)}
          </div>
        </div>
        <div className="flex-1 rounded-md bg-primary-100 p-6">
          <h3 className="text-xl font-semibold mb-3 text-center">
            Quantization
          </h3>
          <div className="text-center text-xl">{result.model.quant}</div>
        </div>
      </div>

      <Separator thickness={2} />

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

import Meta from "@/components/layout/Meta";
import Separator from "@/components/ui/Separator";
import {
  getModelVariants,
  getPerformanceScores,
  getTopAcceleratorsByModelVariants,
} from "@/db/queries";
import { OFFICIAL_MODELS } from "@/lib/config";
import { PerformanceScore } from "@/lib/types";
import HomepageLeaderboard from "@/components/leaderboard/HomepageLeaderboard";
// import Link from "nextlink";

export default function Home({ results }: { results: PerformanceScore[] }) {
  return (
    <>
      <Meta />
      <div className="flex flex-col gap-5 md:text-xl">
        <div className="text-center">
          <p>
            <b>LocalScore</b> is an open benchmark which helps you understand
            how well your computer can handle local AI tasks.{" "}
          </p>
          {/* <Link href="/about" className="text-primary-500 hover:underline">
            Learn more
          </Link> */}
        </div>
        <Separator thickness={2} />
      </div>
      <HomepageLeaderboard data={results} />
    </>
  );
}

export async function getStaticProps() {
  const models = OFFICIAL_MODELS.map((model) => ({
    name: model.name,
    quant: model.quant,
  }));

  const modelVariants = await getModelVariants(models);
  const modelVariantIds = modelVariants.map((mv) => mv.variantId);
  const acceleratorIds = await getTopAcceleratorsByModelVariants({
    modelVariantIds,
    numResults: 20,
  });

  const results = await getPerformanceScores(acceleratorIds, modelVariantIds);

  return {
    props: {
      results,
    },
    // Revalidate every minute
    revalidate: 60,
  };
}

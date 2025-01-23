import Leaderboard from "@/components/Leaderboard";
import Separator from "@/components/Separator";
import {
  getModelVariants,
  getPerformanceScores,
  getTopAcceleratorsByModelVariants,
} from "@/db/queries";
import { OFFICIAL_MODELS } from "@/lib/config";
import { PerformanceScore } from "@/lib/types";
import { GetServerSideProps } from "next";
import Link from "next/link";

export default function Home({ results }: { results: PerformanceScore[] }) {
  return (
    <>
      <div className="flex flex-col gap-5 md:text-xl">
        <p>
          <b>LocalScore</b> is an{" "}
          <Link
            className="text-primary-500 hover:underline"
            href={"https://github.com/cjpais/localscore"}
          >
            open benchmark
          </Link>{" "}
          which helps you understand how well your computer can handle AI tasks.
        </p>
        {/* <p>
          Built on top of{" "}
          <Link
            className="text-primary-500 hover:underline"
            href={"https://llamafile.ai"}
          >
            llamafile
          </Link>
          , it measures both speed and efficiency of AI inference across any
          hardware setup. Our community-driven platform collects and shares
          benchmark data from devices ranging from basic laptops to high-end
          workstations. All results are openly available for you to explore and
          compare.
        </p> */}
        {/* <Link
          className="bg-primary-500 px-5 py-[10px] w-fit rounded-md text-white hover:bg-primary-200 text-base"
          href="/download"
        >
          Download LocalScore
        </Link> */}
        <Separator thickness={2} />
      </div>
      <Leaderboard data={results} variant="homepage" />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=1, stale-while-revalidate=59"
  );

  const models = OFFICIAL_MODELS.map((model) => ({
    name: model.name,
    quant: model.quant,
  }));

  const modelVariants = await getModelVariants(models);
  const modelVariantIds = modelVariants.map((mv) => mv.variantId);
  const acceleratorIds = await getTopAcceleratorsByModelVariants({
    modelVariantIds,
    numResults: 100,
  });

  const results = await getPerformanceScores(acceleratorIds, modelVariantIds);

  console.log(results[0].results);

  return {
    props: {
      results,
    },
  };
};

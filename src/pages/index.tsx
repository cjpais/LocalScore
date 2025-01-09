import Leaderboard from "@/components/Leaderboard";
import Separator from "@/components/Separator";
import { OFFICIAL_MODELS } from "@/lib/config";
import { postFetcher } from "@/lib/swr";
import { PerformanceScoresSchema } from "@/lib/types";
import Link from "next/link";
import useSWR from "swr";

export default function Home() {
  const { data, error, isLoading } = useSWR(
    [
      "/api/getPerformanceScores",
      {
        models: OFFICIAL_MODELS.map((m) => ({
          name: m.name,
          quantization: m.quant,
        })),
      },
    ],
    ([url, payload]) => postFetcher(url, payload)
  );

  const parsed = PerformanceScoresSchema.safeParse(data);

  if (isLoading) return null;
  if (error) return <div>Error: {error.message}</div>;
  if (!data || !parsed.success)
    return <div>{JSON.stringify(parsed.error)}</div>;

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
      <Leaderboard data={parsed.data} variant="homepage" />
    </>
  );
}

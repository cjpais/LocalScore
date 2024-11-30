import Leaderboard from "@/components/Leaderboard";
import { OFFICIAL_MODELS } from "@/lib/config";
import { postFetcher } from "@/lib/swr";
import { PerformanceScoresSchema } from "@/lib/types";
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
      <div className="flex flex-col gap-5 text-xl">
        <p>
          LocalScore is an open benchmark which measures your computer`&#39;s
          real-world AI performance.
        </p>
        <p>this is more text about what it is</p>
      </div>
      <Leaderboard data={parsed.data} />
    </>
  );
}

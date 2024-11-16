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
    <div>
      <main className="flex flex-col w-full items-center gap-5">
        <div className="bg-[#EEEEEE] max-w-lg px-5 py-3 w-full rounded-md">
          Search Models/Accelerators
        </div>
        <Leaderboard data={parsed.data} />
      </main>
      <footer></footer>
    </div>
  );
}

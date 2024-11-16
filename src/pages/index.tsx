import Leaderboard from "@/components/Leaderboard";
import SearchBar from "@/components/SearchBar";
import { OFFICIAL_MODELS } from "@/lib/config";
import { fetcher, postFetcher } from "@/lib/swr";
import { PerformanceScoresSchema, SearchBarOption } from "@/lib/types";
import { useState } from "react";
import useSWR from "swr";

export default function Home() {
  const [selectedOption] = useState<SearchBarOption | null>(null);
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

  const { data: searchResponse, isLoading: searchLoading } = useSWR(
    "/api/search?q=",
    fetcher
  );

  const parsed = PerformanceScoresSchema.safeParse(data);

  if (isLoading || searchLoading) return null;
  if (error) return <div>Error: {error.message}</div>;
  if (!data || !parsed.success)
    return <div>{JSON.stringify(parsed.error)}</div>;

  return (
    <div>
      <main className="flex flex-col w-full items-center gap-5">
        <SearchBar
          value={selectedOption}
          onChange={(option) => {
            // TODO this could be a link or set state for us to update the whole page with

            // redirect to the appopriate page
            if (option === null) return;
            if (option.group === "model") {
              window.location.href = `/model/${option.modelName}/${option.quantization}`;
            } else {
              window.location.href = `/accelerator/${option.acceleratorName}/${option.acceleratorMemory}`;
            }
          }}
          defaultOptions={searchResponse}
        />
        <Leaderboard data={parsed.data} />
      </main>
      <footer></footer>
    </div>
  );
}

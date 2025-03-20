import { AcceleratorType, PerformanceScore } from "@/lib/types";
import { useState } from "react";
import Card from "../ui/Card";
import CardHeader from "../ui/CardHeader";
import LeaderboardTable from "./LeaderboardTable";
import LeaderboardAcceleratorSelect from "./LeaderboardAcceleratorSelect";
import LeaderboardSelectedModelHeader from "./LeaderboardSelectedModelHeader";
import { OFFICIAL_MODELS } from "@/lib/config";
import { Tab, Tabs } from "../ui/Tab";

interface LeaderboardProps {
  data: PerformanceScore[];
}

const HomepageLeaderboard = ({ data }: LeaderboardProps) => {
  const [filterType, setFilterType] = useState<AcceleratorType>("GPU");

  //   const modelToUse = data[0]?.model;
  //   const selectedModelData = data.find((d) => d.model.name === modelToUse?.name);

  return (
    <div className="space-y-4">
      <CardHeader
        text="LEADERBOARD"
        className="w-full justify-center !sm:text-2xl !text-3xl"
      />

      <Tabs defaultTab={1} labelClassName="!font-bold text-xl">
        {OFFICIAL_MODELS.map((model) => {
          const selectedModelData = data.find(
            (d) => d.model.name === model.name
          );

          return (
            <Tab
              label={`${model.humanLabel} - ${model.params}`}
              key={model.name}
            >
              <Card className="flex flex-col gap-4 overflow-hidden">
                <div className="flex justify-between items-center">
                  <LeaderboardSelectedModelHeader data={selectedModelData} />
                  <LeaderboardAcceleratorSelect onChange={setFilterType} />
                </div>

                <LeaderboardTable
                  data={selectedModelData}
                  filterType={filterType}
                />

                {/* <LeaderboardSelectedModelHeader data={} />
          <div className="flex items-center gap-[1px] py-[10px]">
          </div> */}
              </Card>
            </Tab>
          );
        })}
      </Tabs>

      {/* <Card className="flex flex-col gap-3 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <LeaderboardSelectedModelHeader data={selectedModelData} />
          <div className="flex items-center gap-[1px] py-[10px]">
            <LeaderboardAcceleratorSelect onChange={setFilterType} />
          </div>
        </div>

        <LeaderboardTable data={selectedModelData} filterType={filterType} />
      </Card> */}
    </div>
  );
};

export default HomepageLeaderboard;

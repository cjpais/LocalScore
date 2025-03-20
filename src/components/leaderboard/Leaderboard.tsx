import { AcceleratorType, PerformanceScore } from "@/lib/types";
import { useState } from "react";
import Card from "../ui/Card";
import CardHeader from "../ui/CardHeader";
import LeaderboardTable from "./LeaderboardTable";
import LeaderboardAcceleratorSelect from "./LeaderboardAcceleratorSelect";

interface LeaderboardProps {
  data: PerformanceScore[];
}

const Leaderboard = ({ data }: LeaderboardProps) => {
  const [filterType, setFilterType] = useState<AcceleratorType>("GPU");

  const modelToUse = data[0]?.model;
  const selectedModelData = data.find((d) => d.model.name === modelToUse?.name);

  return (
    <Card className="flex flex-col gap-3 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <CardHeader text="LEADERBOARD" />
        <div className="flex items-center gap-[1px] py-[10px]">
          <LeaderboardAcceleratorSelect onChange={setFilterType} />
        </div>
      </div>

      <LeaderboardTable data={selectedModelData} filterType={filterType} />
    </Card>
  );
};

export default Leaderboard;

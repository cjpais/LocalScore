import { OFFICIAL_MODELS } from "@/lib/config";
import { AcceleratorType, PerformanceScore } from "@/lib/types";
import { useState } from "react";
import Separator from "./Separator";
import Carat from "./icons/Carat";
import LeaderboardTable from "./LeaderboardTable";

const Leaderboard = ({ data }: { data: PerformanceScore[] }) => {
  // TODO use the first model give in the data
  const [selectedModel, setSelectedModel] = useState(OFFICIAL_MODELS[0]);
  const [filterType, setFilterType] = useState<AcceleratorType>("ALL");

  const selectedModelData = data.find(
    (d) => d.model.name === selectedModel.name
  );

  if (!selectedModelData) return null;

  return (
    <div className="flex flex-col gap-3 overflow-hidden">
      <div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 text-2xl font-black tracking-wider">
            LEADERBOARD
          </div>
          <div className="flex items-center gap-[1px] py-[10px]">
            <div>
              {/* <label>accelerator</label> */}
              <div className="relative w-32">
                <select
                  className="px-5 py-[10px] text-primary-500 bg-primary-100 border-none appearance-none rounded-md rounded-r-none w-full font-medium focus:outline-none"
                  onChange={(e) =>
                    setFilterType(e.target.value as AcceleratorType)
                  }
                >
                  <option value="All">CPU+GPU</option>
                  <option value="GPU">GPU</option>
                  <option value="CPU">CPU</option>
                </select>
                <Carat className="absolute left-24 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              {/* <label>accelerator</label> */}
              <div className="relative w-32">
                <select
                  className="px-5 py-[10px] text-primary-500 bg-primary-100 border-none appearance-none rounded-md rounded-l-none w-full font-medium focus:outline-none"
                  onChange={(e) => {
                    const model = OFFICIAL_MODELS.find(
                      (m) => m.label === e.target.value
                    );
                    if (model) setSelectedModel(model);
                  }}
                >
                  {OFFICIAL_MODELS.map((m) => (
                    <option key={m.label} value={m.label}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <Carat className="absolute left-24 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        <Separator thickness={2} />
      </div>

      <LeaderboardTable data={selectedModelData} filterType={filterType} />
    </div>
  );
};

export default Leaderboard;

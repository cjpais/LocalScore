import { OFFICIAL_MODELS } from "@/lib/config";
import { AcceleratorType, PerformanceScore } from "@/lib/types";
import { useState } from "react";
import Separator from "./Separator";
import Carat from "./icons/Carat";
import LeaderboardTable from "./LeaderboardTable";
import LeaderboardTableHeader from "./LeaderboardTableHeader";
import Card from "./Card";

interface LeaderboardProps {
  data: PerformanceScore[];
  variant?: "homepage" | "model";
}

const AcceleratorSelect = ({
  onChange,
}: {
  onChange: (value: AcceleratorType) => void;
}) => (
  <div className="relative w-32">
    <select
      className="px-5 py-[10px] text-primary-500 bg-primary-100 border-none appearance-none rounded-md w-full font-medium focus:outline-none"
      onChange={(e) => onChange(e.target.value as AcceleratorType)}
    >
      <option value="GPU">GPU</option>
      <option value="ALL">CPU+GPU</option>
      <option value="CPU">CPU</option>
    </select>
    <Carat className="absolute left-24 top-1/2 transform -translate-y-1/2 pointer-events-none" />
  </div>
);

const ModelSelect = ({ onChange }: { onChange: (value: string) => void }) => (
  <div className="relative w-32">
    <select
      className="px-5 py-[10px] text-primary-500 bg-primary-100 border-none appearance-none rounded-md w-full font-medium focus:outline-none"
      onChange={(e) => onChange(e.target.value)}
    >
      {OFFICIAL_MODELS.map((m) => (
        <option key={m.label} value={m.label}>
          {m.label}
        </option>
      ))}
    </select>
    <Carat className="absolute left-24 top-1/2 transform -translate-y-1/2 pointer-events-none" />
  </div>
);

const Leaderboard = ({ data, variant = "model" }: LeaderboardProps) => {
  const [filterType, setFilterType] = useState<AcceleratorType>("GPU");
  const [selectedModel, setSelectedModel] = useState(OFFICIAL_MODELS[0]);

  const modelToUse = variant === "homepage" ? selectedModel : data[0]?.model;
  const selectedModelData = data.find((d) => d.model.name === modelToUse?.name);

  if (!selectedModelData) return null;

  return (
    <Card className="flex flex-col gap-3 overflow-hidden">
      <div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 text-2xl font-black tracking-wider">
            LEADERBOARD
          </div>
          <div className="flex items-center gap-[1px] py-[10px]">
            <AcceleratorSelect onChange={setFilterType} />
            {variant === "homepage" && (
              <ModelSelect
                onChange={(value) => {
                  const model = OFFICIAL_MODELS.find((m) => m.label === value);
                  if (model) setSelectedModel(model);
                }}
              />
            )}
          </div>
        </div>
        {variant === "homepage" && <Separator thickness={2} />}
      </div>

      <div>
        {variant === "homepage" && (
          <LeaderboardTableHeader data={selectedModelData} />
        )}
        <LeaderboardTable data={selectedModelData} filterType={filterType} />
      </div>
    </Card>
  );
};

export default Leaderboard;

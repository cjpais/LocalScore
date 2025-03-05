import { OFFICIAL_MODELS } from "@/lib/config";
import { AcceleratorType, PerformanceScore } from "@/lib/types";
import { useState } from "react";
import Separator from "../ui/Separator";
import Card from "../ui/Card";
import CardHeader from "../ui/CardHeader";
import GenericSelect from "../ui/GenericSelect";
import LeaderboardTableHeader from "./LeaderboardTableHeader";
import LeaderboardTable from "./LeaderboardTable";

interface LeaderboardProps {
  data: PerformanceScore[];
  variant?: "homepage" | "model";
}

const AcceleratorSelect = ({
  onChange,
  variant = "homepage",
}: {
  onChange: (value: AcceleratorType) => void;
  variant?: "homepage" | "model";
}) => {
  const acceleratorOptions: { value: AcceleratorType; label: string }[] = [
    { value: "GPU", label: "GPU" },
    { value: "ALL", label: "CPU+GPU" },
    { value: "CPU", label: "CPU" },
  ];

  return (
    <div className={`relative w-28 sm:w-32`}>
      <GenericSelect
        options={acceleratorOptions}
        onChange={onChange}
        roundedStyle={variant === "model" ? "both" : "left"}
        defaultValue="GPU"
      />
    </div>
  );
};

const ModelSelect = ({ onChange }: { onChange: (value: string) => void }) => {
  const modelOptions = OFFICIAL_MODELS.map((m) => ({
    value: m.label,
    label: m.label,
  }));

  return (
    <div className={`relative w-28 sm:w-32`}>
      <GenericSelect
        options={modelOptions}
        onChange={onChange}
        roundedStyle="right"
        defaultValue={modelOptions[0]?.value}
      />
    </div>
  );
};

const Leaderboard = ({ data, variant = "model" }: LeaderboardProps) => {
  const [filterType, setFilterType] = useState<AcceleratorType>("GPU");
  const [selectedModel, setSelectedModel] = useState(OFFICIAL_MODELS[0]);

  const modelToUse = variant === "homepage" ? selectedModel : data[0]?.model;
  const selectedModelData = data.find((d) => d.model.name === modelToUse?.name);

  if (!selectedModelData) return null;

  return (
    <Card className="flex flex-col gap-3 overflow-hidden">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <CardHeader text="LEADERBOARD" />
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

      <div className="space-y-3">
        {variant === "homepage" && (
          <LeaderboardTableHeader data={selectedModelData} />
        )}
        <LeaderboardTable data={selectedModelData} filterType={filterType} />
      </div>
    </Card>
  );
};

export default Leaderboard;

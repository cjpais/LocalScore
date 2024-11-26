import { OFFICIAL_MODELS } from "@/lib/config";
import { LeaderboardResult, PerformanceScore } from "@/lib/types";
import { useState } from "react";
import ScrollableSelect from "./ScrollableSelect";
import { capitalize } from "@/lib/utils";
import Link from "next/link";
import Separator from "./Separator";
import Card from "./Card";

const HeaderItem = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return <div className={`text-sm text-primary-500 ${className}`}>{text}</div>;
};

// Header.jsx
const Header = () => {
  return (
    <>
      <HeaderItem className="col-span-3" text="ACCELERATOR" />
      <HeaderItem className="justify-self-center" text="PERFORMANCE" />
      <HeaderItem className="justify-self-center" text="EFFICIENCY" />
      <HeaderItem className="justify-self-center" text="TOK/SEC" />
    </>
  );
};

// GPUItem.jsx
const GPUItem = ({ result }: { result: LeaderboardResult }) => {
  return (
    <>
      <div className="col-span-3">
        <Link
          className="font-bold text-primary-500 hover:underline"
          href={`/accelerator/${result.accelerator_name}/${result.accelerator_memory_gb}`}
        >
          {result.accelerator_name}
        </Link>
        <div className="text-sm">
          {result.accelerator_type} / {result.accelerator_memory_gb}GB
        </div>
      </div>
      <div className="justify-self-center font-bold tracking-wider text-lg">
        {result.performance_score}
      </div>
      <div className="justify-self-center text-lg">
        {result.efficiency_score}
      </div>
      <div className="justify-self-center text-lg">
        {result.avg_gen_tps.toFixed(2)}
      </div>
    </>
  );
};

// GPUList.jsx
// TODO be able to sort/display by performance score or efficiency score
const Leaderboard = ({ data }: { data: PerformanceScore }) => {
  const [selectedModel, setSelectedModel] = useState(OFFICIAL_MODELS[0]);

  const selectedModelData = data.find(
    (d) => d.model.name === selectedModel.name
  );

  if (!selectedModelData) return null;
  const selectedData = selectedModelData.results.sort(
    (a, b) => b.performance_score - a.performance_score
  );
  return (
    <div className="flex flex-col gap-5 max-w-xl overflow-hidden">
      <div>
        <div className="flex justify-between items-center">
          <p className="text-2xl font-black tracking-wider">LEADERBOARD</p>
          <ScrollableSelect
            options={OFFICIAL_MODELS.map((m) => capitalize(m.label))}
            onSelect={(option) => {
              const model = OFFICIAL_MODELS.find(
                (m) => capitalize(m.label) === option
              );
              console.log(model);
              if (model) setSelectedModel(model);
            }}
          />
        </div>
        <Separator thickness={2} />
      </div>

      <div>
        <div className="flex py-2 items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold tracking-[.24px]">
              {capitalize(selectedModel.label)}
            </p>
            <Link
              href={`/model/${selectedModel.name}/${selectedModel.quant}`}
              className="font-light relative group"
            >
              <span>
                <span className="font-medium">{selectedModel.name}:</span>
                <span className="ml-2">{selectedModel.quant}</span>
              </span>
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </Link>
          </div>
          <a
            href={`https://huggingface.co/Mozilla/${selectedModel.name.replaceAll(
              " ",
              "-"
            )}-llamafile`}
          >
            <Card className="text-primary-500 bg-primary-100 py-2 px-5">
              Download
            </Card>
          </a>
        </div>

        <div>
          <Separator thickness={2} />
          <div className="grid grid-cols-6 gap-4 py-2 px-4">
            <Header />
          </div>

          <Separator thickness={2} />

          <div className="space-y-2 py-3">
            {selectedData.map((result, index) => (
              <div
                key={index}
                className="grid grid-cols-6 gap-4 px-4 py-3 bg-[#E6DFFF40] rounded-md items-center"
              >
                <GPUItem result={result} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

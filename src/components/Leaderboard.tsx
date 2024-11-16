import { OFFICIAL_MODELS } from "@/lib/config";
import { LeaderboardResult, PerformanceScore } from "@/lib/types";
import { useState } from "react";
import ScrollableSelect from "./ScrollableSelect";
import { capitalize } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

// Header.jsx
const Header = () => {
  return (
    <>
      <div className="font-bold col-span-3">ACCELERATOR</div>
      <div className="font-bold justify-self-end">🚀 Score</div>
      <div className="font-bold justify-self-end">🌱 Score</div>
      <div className="font-bold justify-self-end">Tok/Sec</div>
    </>
  );
};

// GPUItem.jsx
const GPUItem = ({ result }: { result: LeaderboardResult }) => {
  return (
    <>
      <div className="col-span-3">
        <Link
          className="font-bold text-gray-800"
          href={`/accelerator/${result.accelerator_name}/${result.accelerator_memory_gb}`}
        >
          {result.accelerator_name}
        </Link>
        <div className="text-sm text-gray-500">
          {result.accelerator_type} / {result.accelerator_memory_gb} GB
        </div>
      </div>
      <div className="justify-self-end font-mono font-bold text-lg text-purple-700">
        {(result.performance_score * 10).toFixed(0)}
      </div>
      <div className="justify-self-end font-bold text-lg text-green-700">
        {(result.efficiency_score * 10).toFixed(2)}
      </div>
      <div className="text-gray-800 justify-self-end font-mono">
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
  // const gpus = Array(8).fill({
  //   model: "GTX 6090ti",
  //   specs: "GPU / 64GB",
  //   score: "347562",
  //   power: "1232",
  // });

  return (
    <div className="flex flex-col gap-2 max-w-xl mx-auto overflow-hidden">
      <p className="text-3xl font-black tracking-wider">LEADERBOARD</p>
      <ScrollableSelect
        options={OFFICIAL_MODELS.map((m) => m.label)}
        onSelect={(option) => {
          const model = OFFICIAL_MODELS.find((m) => m.label === option);
          if (model) setSelectedModel(model);
        }}
      />
      <div className="h-px bg-[#00000019]"></div>

      <div className="flex py-2 items-center justify-between">
        <p className="text-2xl font-extrabold tracking-[.24px]">
          {capitalize(selectedModel.label)}
        </p>
        <Link
          className="flex gap-2 font-light hover:underline"
          href={`/model/${selectedModel.name}/${selectedModel.quant}`}
        >
          <p className="font-medium">
            {selectedModel.name}: {selectedModel.quant}
          </p>
        </Link>
        <a
          href={`https://huggingface.co/Mozilla/${selectedModel.name.replaceAll(
            " ",
            "-"
          )}-llamafile`}
        >
          <Image
            src="/hf-logo.svg"
            alt="A smiling emoji with its hands forming a hug around itself. The emoji has a wide, open-mouthed smile, and its cheeks are blushing slightly. The hands are raised as if it is embracing itself in a friendly and warm manner. This emoji conveys a sense of joy, self-love, or comfort."
            width={40}
            height={40}
          />
        </a>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <Header />
      </div>

      <div className="h-px bg-gray-200"></div>

      <div className="space-y-2">
        {selectedData.map((result, index) => (
          <div
            key={index}
            className="grid grid-cols-6 gap-4 px-4 py-3 bg-[#FAFAFA] rounded-md items-center"
          >
            <GPUItem result={result} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

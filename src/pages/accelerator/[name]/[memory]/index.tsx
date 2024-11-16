import { useRouter } from "next/router";
import React from "react";

const Index = () => {
  const router = useRouter();
  const { name, memory } = router.query;

  return (
    <div className="space-y-6">
      <h3>
        {name} - {memory}GB
      </h3>
      <div className="grid grid-cols-2 w-max gap-4">
        <ScoreDisplay label="Performance Score" score="10234" emoji="🚀" />
        <ScoreDisplay label="Efficiency Score" score="841" emoji="🌱" />
        <ScoreDisplay label="Tokens Per Second" score="20.43 t/s" emoji="" />
        <ScoreDisplay label="Time To First Token" score="100.42 ms" emoji="" />
      </div>
    </div>
  );
};

const ScoreDisplay = ({
  score,
  label,
  emoji,
  variant = "default",
}: {
  score: string;
  label?: string;
  emoji: string;
  variant?: "default" | "slim";
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-auto h-auto rounded-xl border-2 py-4 px-6 gap-4">
      {variant === "default" && <div className="font-bold">{label}</div>}
      <div className="flex-grow flex gap-2 items-center justify-center font-bold text-2xl">
        <p>{emoji}</p>
        <p>{score}</p>
      </div>
    </div>
  );
};

export default Index;

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LeaderboardResult } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { LEADERBOARD_COLUMNS } from "./constants";

interface AcceleratorRowProps {
  result: LeaderboardResult;
}

const LeaderboardAcceleratorRow: React.FC<AcceleratorRowProps> = ({
  result,
}) => {
  return (
    <>
      <div className="col-span-4">
        <Link
          className="font-bold text-primary-500 hover:underline"
          href={`/accelerator/${result.accelerator.id}`}
        >
          {result.accelerator.name}
        </Link>

        <div className="text-sm flex gap-1 items-center">
          <Image
            src="/accel.svg"
            width={20}
            height={20}
            alt="a small icon of a computer chip"
          />{" "}
          {result.accelerator.type} / {result.accelerator.memory_gb}GB
        </div>
      </div>
      {LEADERBOARD_COLUMNS.map((column, index) => (
        <div key={index} className="flex flex-col items-center justify-center">
          <div className={`text-lg ${column.className}`}>
            {formatMetricValue(column.key, result[column.key]).formatted}
          </div>
          <div className="text-xs">
            {formatMetricValue(column.key, result[column.key]).suffix}
          </div>
        </div>
      ))}
    </>
  );
};

export default LeaderboardAcceleratorRow;

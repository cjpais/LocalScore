import React from "react";
import Link from "next/link";
// import Image from "next/image";
import { LeaderboardResult } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { LEADERBOARD_COLUMNS } from "./constants";
import Separator from "../ui/Separator";

interface AcceleratorRowProps {
  result: LeaderboardResult;
}

const LeaderboardAcceleratorRow: React.FC<AcceleratorRowProps> = ({
  result,
}) => {
  return (
    <>
      <div className="sm:col-span-4 col-span-8 flex sm:flex-col justify-between">
        <div className="font-bold sm:text-base text-sm flex gap-2">
          {/* <p>#{result.performance_rank}</p> */}
          <Link
            className="text-primary-500 hover:underline"
            href={`/accelerator/${result.accelerator.id}`}
          >
            {result.accelerator.name}
          </Link>
        </div>

        <div className="flex gap-1 items-center sm:text-sm text-xs">
          {/* <Image
            src="/accel.svg"
            width={20}
            height={20}
            alt="a small icon of a computer chip"
          />{" "} */}
          {result.accelerator.type} / {result.accelerator.memory_gb}GB
        </div>
      </div>
      <Separator thickness={2} className="col-span-8 sm:hidden" />
      {LEADERBOARD_COLUMNS.map((column, index) => (
        <div
          key={index}
          className="flex flex-col items-center sm:justify-center sm:col-span-1 col-span-2"
        >
          <div className="sm:hidden block text-[10px] text-primary-500">
            {column.label}
          </div>
          <div className={`sm:text-lg ${column.className}`}>
            {formatMetricValue(column.key, result[column.key]).formatted}
          </div>
          <div className="sm:text-xs text-[10px]">
            {formatMetricValue(column.key, result[column.key]).suffix}
          </div>
        </div>
      ))}
    </>
  );
};

export default LeaderboardAcceleratorRow;

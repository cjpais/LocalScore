import { PerformanceScore } from "@/lib/types";
import Link from "next/link";
import React from "react";

const LeaderboardTableHeader = ({ data }: { data: PerformanceScore }) => {
  return (
    <div className="flex py-2 items-center justify-between">
      <div>
        <Link
          href={`/model/${data.model.name}/${data.model.quant}`}
          className="font-light relative group"
        >
          <span>
            <span className="font-medium">{data.model.name}:</span>
            <span className="ml-2">{data.model.quant}</span>
          </span>
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform"></span>
        </Link>
      </div>
    </div>
  );
};

export default LeaderboardTableHeader;

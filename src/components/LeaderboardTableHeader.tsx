import { PerformanceScore } from "@/lib/types";
import Link from "next/link";
import React from "react";
import Image from "next/image";

const LeaderboardTableHeader = ({ data }: { data: PerformanceScore }) => {
  return (
    <div className="flex py-2 items-center gap-2">
      <Image src={"/model.svg"} alt="model icon" width={20} height={20} />
      <div>
        <Link
          href={`/model/${data.model.variantId}`}
          className="font-light relative group"
        >
          <span>
            <span className="font-semibold text-lg">{data.model.name}:</span>
            <span className="ml-1 text-lg">{data.model.quant}</span>
          </span>
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform"></span>
        </Link>
      </div>
    </div>
  );
};

export default LeaderboardTableHeader;

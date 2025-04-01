import { PerformanceScore } from "@/lib/types";
import Link from "next/link";
import React from "react";
import Image from "next/image";

const LeaderboardSelectedModelHeader = ({
  data,
}: {
  data: PerformanceScore | undefined;
}) => {
  if (!data) return null;

  return (
    <div className="flex py-2 items-center gap-2">
      <Image src={"/model.svg"} alt="model icon" width={24} height={24} />
      <div>
        <Link
          href={`/model/${data.model.variantId}`}
          className="font-light relative group text-sm sm:text-base"
        >
          <span className="sm:inline-block hover:underline underline-offset-4 flex flex-col">
            <span className="font-semibold sm:text-lg">{data.model.name}</span>{" "}
            <span className="sm:text-lg">{data.model.quant}</span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default LeaderboardSelectedModelHeader;

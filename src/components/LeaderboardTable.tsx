import React, { useState } from "react";
import Separator from "./Separator";
import {
  AcceleratorType,
  LeaderboardResult,
  PerformanceMetricKey,
  PerformanceScore,
} from "@/lib/types";
import Link from "next/link";
import Arrow from "./icons/Arrow";

type SortDirection = "asc" | "desc";
interface Column {
  key: PerformanceMetricKey;
  label: string;
  sortable?: boolean;
  format?: (value: number) => string;
  suffix?: (value: number) => string;
  className?: string;
}

const LEADERBOARD_COLUMNS: Column[] = [
  {
    key: "avg_prompt_tps",
    label: "PROMPT",
    sortable: true,
    format: (value: number) => value.toFixed(),
    suffix: () => "tokens/s",
  },
  {
    key: "avg_gen_tps",
    label: "GENERATION",
    sortable: true,
    format: (value: number) =>
      value > 100 ? value.toFixed() : value.toFixed(1),
    suffix: () => "tokens/s",
  },
  {
    key: "avg_ttft",
    label: "TTFT",
    sortable: true,
    format: (value: number) =>
      value >= 1000 ? (value / 1000).toFixed(2) : value.toFixed(),
    suffix: (value: number) => (value >= 1000 ? "sec" : "ms"),
  },
  {
    key: "performance_score",
    label: "LOCALSCORE",
    sortable: true,
    format: (value: number) => value.toFixed(),
    className: "font-bold",
  },
];

const HeaderItem = ({
  text,
  sortable = false,
  onClick,
  className,
  sortKey,
  currentSortKey,
  sortDirection,
}: {
  text: string;
  sortable?: boolean;
  onClick?: () => void;
  className?: string;
  sortKey?: PerformanceMetricKey;
  currentSortKey?: PerformanceMetricKey;
  sortDirection?: SortDirection;
}) => {
  return (
    <div
      className={`text-xs text-primary-500 ${
        sortable ? "cursor-pointer hover:opacity-70" : ""
      } ${className} flex items-center gap-1`}
      onClick={onClick}
    >
      {sortable && sortKey === currentSortKey && (
        <Arrow
          direction={sortDirection === "asc" ? "up" : "down"}
          className="w-3 h-3 mb-[2px]"
          color="#582acb"
        />
      )}
      <p>{text}</p>
    </div>
  );
};

const Header = ({
  onSort,
  currentSortKey,
  sortDirection,
}: {
  onSort: (key: PerformanceMetricKey) => void;
  currentSortKey: PerformanceMetricKey;
  sortDirection: SortDirection;
}) => {
  return (
    <>
      <HeaderItem className="col-span-4" text="ACCELERATOR" />
      {LEADERBOARD_COLUMNS.map((column, index) => (
        <HeaderItem
          key={index}
          className="flex justify-center"
          text={column.label}
          sortable={column.sortable}
          onClick={() => onSort(column.key)}
          sortKey={column.key}
          currentSortKey={currentSortKey}
          sortDirection={sortDirection}
        />
      ))}
    </>
  );
};

const AcceleratorRow = ({ result }: { result: LeaderboardResult }) => {
  return (
    <>
      <div className="col-span-4">
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
      {LEADERBOARD_COLUMNS.map((column, index) => (
        <div key={index} className="flex flex-col items-center justify-center">
          <div className={`text-lg ${column.className}`}>
            {column.format
              ? column.format(result[column.key])
              : result[column.key].toFixed()}
          </div>
          <div className="text-xs">{column.suffix?.(result[column.key])}</div>
        </div>
      ))}
    </>
  );
};

const LeaderboardTable = ({
  data,
  filterType,
}: {
  data: PerformanceScore;
  filterType: AcceleratorType;
}) => {
  const [sortKey, setSortKey] =
    useState<PerformanceMetricKey>("performance_score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filteredData = data.results.filter((result) => {
    if (filterType === "ALL") return true;
    return result.accelerator_type === filterType;
  });

  const handleSort = (key: PerformanceMetricKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortedData = [...filteredData].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * multiplier;
  });

  return (
    <div>
      <Separator thickness={2} />
      <div className="grid grid-cols-8 gap-4 py-2 px-4">
        <Header
          onSort={handleSort}
          currentSortKey={sortKey}
          sortDirection={sortDirection}
        />
      </div>

      <Separator thickness={2} />

      <div className="space-y-2 py-3">
        {sortedData.map((result, index) => (
          <div
            key={index}
            className="grid grid-cols-8 gap-4 px-4 py-3 bg-[#E6DFFF40] rounded-md items-center"
          >
            <AcceleratorRow result={result} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardTable;

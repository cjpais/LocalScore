import React from "react";
import { LEADERBOARD_COLUMNS } from "./constants";
import { PerformanceMetricKey, SortDirection } from "@/lib/types";
import ArrowIcon from "../icons/ArrowIcon";

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
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <div
      className={`text-xs text-primary-500 select-none ${
        sortable ? "cursor-pointer hover:opacity-70" : ""
      } ${className} flex items-center gap-1`}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {sortable && sortKey === currentSortKey && (
        <ArrowIcon
          direction={sortDirection === "asc" ? "up" : "down"}
          className="w-3 h-3 mb-[2px]"
          color="#582acb"
        />
      )}
      <p className="select-none">{text}</p>
    </div>
  );
};

const LeaderboardHeader = ({
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

export default LeaderboardHeader;

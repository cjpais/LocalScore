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

  const showArrow = sortable && sortKey === currentSortKey;

  return (
    <div
      className={`text-xs text-primary-500 select-none ${
        sortable ? "cursor-pointer hover:opacity-70" : ""
      } ${className} relative`}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center">
        <span className="select-none">{text}</span>
        {showArrow && (
          <span className="inline-flex ml-1">
            <ArrowIcon
              direction={sortDirection === "asc" ? "up" : "down"}
              className="w-3 h-3 mb-[2px]"
              color="#582acb"
            />
          </span>
        )}
      </div>
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
          className="hidden sm:flex justify-center"
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

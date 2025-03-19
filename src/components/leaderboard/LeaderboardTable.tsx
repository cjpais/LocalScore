import React, { useState } from "react";
import Separator from "../ui/Separator";
import {
  AcceleratorType,
  PerformanceMetricKey,
  PerformanceScore,
  SortDirection,
} from "@/lib/types";
import LeaderboardAcceleratorRow from "./LeaderboardAcceleratorRow";
import LeaderboardHeader from "./LeaderboardHeader";

const LeaderboardTable = ({
  data,
  filterType,
}: {
  data: PerformanceScore | undefined;
  filterType: AcceleratorType;
}) => {
  const [sortKey, setSortKey] =
    useState<PerformanceMetricKey>("performance_score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  if (!data) return null;

  const filteredData = data.results.filter((result) => {
    if (filterType === "ALL") return true;
    return result.accelerator.type === filterType;
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
      <div className="sm:grid grid-cols-8 gap-4 py-2 px-4 hidden">
        <LeaderboardHeader
          onSort={handleSort}
          currentSortKey={sortKey}
          sortDirection={sortDirection}
        />
      </div>

      <Separator thickness={2} className="sm:block hidden" />

      <div className="space-y-2 py-3">
        {sortedData.map((result, index) => (
          <div
            key={index}
            className="grid grid-cols-8 sm:gap-4 gap-2 px-4 py-3 bg-primary-10 rounded-md sm:items-center"
          >
            <LeaderboardAcceleratorRow result={result} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardTable;

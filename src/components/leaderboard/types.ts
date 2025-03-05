import { PerformanceMetricKey } from "@/lib/types";

export interface LeaderboardColumn {
  key: PerformanceMetricKey;
  label: string;
  sortable?: boolean;
  className?: string;
}

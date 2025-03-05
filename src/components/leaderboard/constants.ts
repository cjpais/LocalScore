import { PerformanceMetricKey } from "@/lib/types";

export interface LeaderboardColumn {
  key: PerformanceMetricKey;
  label: string;
  sortable?: boolean;
  className?: string;
}
export const LEADERBOARD_COLUMNS: LeaderboardColumn[] = [
  {
    key: "avg_prompt_tps",
    label: "PROMPT",
    sortable: true,
  },
  {
    key: "avg_gen_tps",
    label: "GENERATION",
    sortable: true,
  },
  {
    key: "avg_ttft",
    label: "TTFT",
    sortable: true,
  },
  {
    key: "performance_score",
    label: "LOCALSCORE",
    sortable: true,
    className: "font-bold",
  },
];

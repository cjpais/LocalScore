import { OFFICIAL_MODELS } from "@/lib/config";
import { OperatingSystem } from "@/lib/types";
import { create } from "zustand";

interface DownloadState {
  // State
  selectedModelIndex: number;
  selectedModel: (typeof OFFICIAL_MODELS)[number];
  models: typeof OFFICIAL_MODELS;
  operatingSystem: OperatingSystem;

  // Actions
  setSelectedModelIndex: (index: number) => void;
  setOperatingSystem: (os: OperatingSystem) => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  // Initial state
  selectedModelIndex: 0,
  selectedModel: OFFICIAL_MODELS[0],
  models: OFFICIAL_MODELS,
  operatingSystem: "MacOS/Linux",

  // Actions
  setSelectedModelIndex: (index: number) =>
    set({ selectedModelIndex: index, selectedModel: OFFICIAL_MODELS[index] }),
  setOperatingSystem: (os: OperatingSystem) => set({ operatingSystem: os }),
}));

export const OFFICIAL_MODELS = [
  { label: "1B", name: "Llama 3.2 1B Instruct", quant: "Q5_K - Medium" },
  { label: "3B", name: "Llama 3.2 3B Instruct", quant: "Q6_K" },
  { label: "8B", name: "Llama 3.1 8B Instruct", quant: "Q4_K - Medium" },
  // { label: "14B", name: "Qwen ", quant: "Q4_K - Medium" },
  // { label: "32B", name: "Qwen", quant: "Q4_K - Medium" },
  // { label: "medium", name: "Qwen2.5 14B Instruct", quant: "Q4_K - Medium" },
];

export const OFFICIAL_ACCELERATORS = [
  { name: "NVIDIA GeForce RTX 3090", memory: "23.60" },
  { name: "NVIDIA GeForce RTX 3080 Ti", memory: "11.55" },
  { name: "NVIDIA GeForce RTX 3060", memory: "11.67" },
];

export const MODEL_MAP = OFFICIAL_MODELS.reduce((map, model) => {
  map[model.label] = { name: model.name, quant: model.quant };
  return map;
}, {} as Record<string, { name: string; quant: string }>);

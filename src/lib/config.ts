export const OFFICIAL_MODELS = [
  {
    name: "Llama 3.2 1B Instruct",
    shortName: "LLama 3.2",
    label: "1B",
    quant: "Q6_K",
    vram: "2GB",
    params: "1B",
    // url: "https://huggingface.co/Mozilla/Meta-Llama-3.1-8B-llamafile/resolve/main/Meta-Llama-3.1-8B.Q4_K_M.llamafile"
  },
  // {
  //   name: "Llama 3.1 3B Instruct",
  //   shortName: "LLama 3.1 3B",
  //   label: "3B",
  //   quant: "Q4_K - Medium",
  //   vram: "3.2GB",
  // },
  {
    name: "Meta Llama 3.1 8B Instruct",
    shortName: "LLama 3.1",
    label: "8B",
    quant: "Q4_K - Medium",
    vram: "6GB",
    params: "8B",
  },
  {
    name: "Qwen2.5 14B Instruct",
    shortName: "Qwen2.5",
    label: "14B",
    quant: "Q4_K - Medium",
    vram: "10GB",
    params: "14B",
  },
  // {
  //   name: "QwQ 32B",
  //   shortName: "QwQ 32B",
  //   label: "32B",
  //   quant: "Q4_K - Medium",
  //   vram: "24GB",
  // },
];

export const OFFICIAL_ACCELERATORS = [
  // { name: "NVIDIA GeForce RTX 3090", memory: "23.59" },
  // { name: "NVIDIA GeForce RTX 4060 Ti", memory: "15.61" },
  { name: "Orin", memory: "7.44" },
];

export const MODEL_MAP = OFFICIAL_MODELS.reduce((map, model) => {
  map[model.label] = { name: model.name, quant: model.quant };
  return map;
}, {} as Record<string, { name: string; quant: string }>);

export const NUM_DEFAULT_GRAPH_RESULTS = 5;

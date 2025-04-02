export const LOCALSCORE_VERSION = "0.9.2";
export const OFFICIAL_MODELS = [
  {
    name: "Llama 3.2 1B Instruct",
    shortName: "LLama 3.2",
    label: "1B",
    humanLabel: "Tiny",
    quant: "Q4_K - Medium",
    vram: "2GB",
    params: "1B",
    hfName: "bartowski/Llama-3.2-1B-Instruct-GGUF",
    hfDownload:
      "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf",
    hfFilename: "Llama-3.2-1B-Instruct-Q4_K_M.gguf",
  },
  {
    name: "Meta Llama 3.1 8B Instruct",
    shortName: "LLama 3.1",
    label: "8B",
    humanLabel: "Small",
    quant: "Q4_K - Medium",
    vram: "6GB",
    params: "8B",
    hfName: "bartowski/Meta-Llama-3.1-8B-Instruct-GGUF",
    hfDownload:
      "https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
    hfFilename: "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
  },
  {
    name: "Qwen2.5 14B Instruct",
    shortName: "Qwen 2.5",
    label: "14B",
    humanLabel: "Medium",
    quant: "Q4_K - Medium",
    vram: "10GB",
    params: "14B",
    hfName: "bartowski/Qwen2.5-14B-Instruct-GGUF",
    hfDownload:
      "https://huggingface.co/bartowski/Qwen2.5-14B-Instruct-GGUF/resolve/main/Qwen2.5-14B-Instruct-Q4_K_M.gguf",
    hfFilename: "Qwen2.5-14B-Instruct-Q4_K_M.gguf",
  },
];

export const MODEL_MAP = OFFICIAL_MODELS.reduce((map, model) => {
  map[model.label] = { name: model.name, quant: model.quant };
  return map;
}, {} as Record<string, { name: string; quant: string }>);

export const NUM_DEFAULT_GRAPH_RESULTS = 5;

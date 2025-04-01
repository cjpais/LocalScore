import type { NextApiRequest, NextApiResponse } from "next";

// Define model URLs (replace with your actual Hugging Face links)
const MODEL_URLS: Record<string, string> = {
  "localscore-tiny":
    "https://huggingface.co/Mozilla/LocalScore/resolve/main/localscore-tiny-1b",
  "localscore-small":
    "https://huggingface.co/Mozilla/LocalScore/resolve/main/localscore-small-8b",
  "localscore-medium":
    "https://huggingface.co/Mozilla/LocalScore/resolve/main/localscore-medium-14b",
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { model } = req.query as { model: string };

  // Validate the model and redirect
  if (MODEL_URLS[model]) {
    res.redirect(307, MODEL_URLS[model]);
  } else {
    res
      .status(404)
      .json({ error: "Model not found. Valid options: tiny, small, medium" });
  }
}

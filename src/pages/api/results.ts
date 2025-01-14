// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getBenchmarkResults } from "@/db/queries";

import type { NextApiRequest, NextApiResponse } from "next";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get pagination parameters from query
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  let limit = parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE;

  // Enforce limit boundaries
  limit = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, limit));

  // Calculate offset
  const offset = (page - 1) * limit;

  // Get sort direction from query
  const sortDirection = req.query.sortDirection === "asc" ? "asc" : "desc";

  const results = await getBenchmarkResults({ sortDirection, limit, offset });

  res.status(200).json(results);
}

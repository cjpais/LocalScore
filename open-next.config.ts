// OpenNext config for the Cloudflare deployment (ignored by Vercel).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

export default defineCloudflareConfig({
  // Stores ISR pages (the homepage revalidates every 60s) in R2.
  incrementalCache: r2IncrementalCache,
  // Revalidates through the WORKER_SELF_REFERENCE service binding.
  queue: memoryQueue,
});

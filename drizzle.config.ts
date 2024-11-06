import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env.local file
dotenv.config({ path: ".env.local" });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

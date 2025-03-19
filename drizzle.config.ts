import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env.local file
dotenv.config({ path: ".env.local" });

export default defineConfig({
  out: "./migrations",
  schema: "./src/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL
      ? process.env.TURSO_DATABASE_URL
      : "file:db.sqlite",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});

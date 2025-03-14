import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env.local file
dotenv.config({ path: ".env.local" });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.PGHOST!,
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD!,
    database: process.env.PGDATABASE!,
    port: parseInt(process.env.PGPORT!),
    // ssl: false,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

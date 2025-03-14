import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PGHOST: z.string(),
  PGDATABASE: z.string(),
  PGUSER: z.string(),
  PGPASSWORD: z.string(),
  PGPORT: z.coerce.number().default(5432),
});

export const env = envSchema.parse(process.env);

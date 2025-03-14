import { env } from "@/lib/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  user: env.PGUSER,
  host: env.PGHOST,
  database: env.PGDATABASE,
  password: env.PGPASSWORD,
  port: env.PGPORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const db = drizzle({ client: pool });

export default db;

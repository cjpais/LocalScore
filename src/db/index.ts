import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host:
    process.env.NODE_ENV === "production"
      ? process.env.INSTANCE_CONNECTION_NAME
      : process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  // ssl: {
  //   // @ts-expect-error require true is not recognized by @types/pg, but does exist on pg
  //   require: true,
  //   rejectUnauthorized: false,
  // },
});

const db = drizzle({ client: pool });

export default db;

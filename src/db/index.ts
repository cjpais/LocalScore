// import { env } from "@/lib/env";
import { drizzle } from "drizzle-orm/libsql";
import { createClient as createTursoClient } from "@libsql/client/web";
import { createClient as createNodeClient } from "@libsql/client/node";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";

// const pool = new Pool({
//   user: env.PGUSER,
//   host: env.PGHOST,
//   database: env.PGDATABASE,
//   password: env.PGPASSWORD,
//   port: env.PGPORT,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// const db = drizzle({ client: pool });

const dbClient = process.env.TURSO_DATABASE_URL
  ? createTursoClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : createNodeClient({
      url: "file:db.sqlite",
    });

const db = drizzle({ client: dbClient });

export default db;

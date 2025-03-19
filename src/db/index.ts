import { drizzle } from "drizzle-orm/libsql";
import { createClient as createTursoClient } from "@libsql/client/web";
import { createClient as createNodeClient } from "@libsql/client/node";

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

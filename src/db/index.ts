import { drizzle } from "drizzle-orm/libsql";
import { createClient as createTursoClient } from "@libsql/client/web";
// The bare entry resolves per runtime: the native Node client under Node (local
// file:db.sqlite) and the web client on Cloudflare Workers, where the native
// "@libsql/client/node" can't load.
import { createClient as createLocalClient } from "@libsql/client";

const dbClient = process.env.TURSO_DATABASE_URL
  ? createTursoClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : createLocalClient({
      url: "file:db.sqlite",
    });

const db = drizzle({ client: dbClient });

export default db;

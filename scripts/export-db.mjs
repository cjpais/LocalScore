// Exports the production database to a standalone SQLite file for the public
// download (see .github/workflows/export-db.yml).
//
//   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/export-db.mjs out.sqlite
//
// Only reads from Turso: copies the schema, then every table in batches, into a
// local file, then compacts and checks it.
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

const BATCH = 5000;
const out = path.resolve(process.argv[2] ?? "localscore.sqlite");
const { TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: authToken } = process.env;
if (!url) {
  console.error("TURSO_DATABASE_URL is not set");
  process.exit(1);
}

const remote = createClient({ url, authToken, intMode: "bigint" });
const tmp = `${out}.tmp`;
fs.rmSync(tmp, { force: true });
const local = createClient({ url: `file:${tmp}`, intMode: "bigint" });
// Tables are copied in name order, not dependency order.
await local.execute("PRAGMA foreign_keys = OFF");

// SQLite's own tables and libSQL/Turso internals stay out of the export.
const { rows: schema } = await remote.execute(
  `SELECT type, name, sql FROM sqlite_master
   WHERE sql IS NOT NULL
     AND name NOT LIKE 'sqlite_%'
     AND name NOT LIKE 'libsql_%'
     AND name NOT LIKE '_litestream_%'`
);
const byType = (t) => schema.filter((r) => r.type === t);

for (const { sql } of byType("table")) await local.execute(sql);

for (const { name } of byType("table")) {
  const quoted = `"${String(name).replaceAll('"', '""')}"`;
  let copied = 0;
  for (let offset = 0; ; offset += BATCH) {
    const res = await remote.execute(
      `SELECT * FROM ${quoted} ORDER BY rowid LIMIT ${BATCH} OFFSET ${offset}`
    );
    if (res.rows.length === 0) break;
    const cols = res.columns.map((c) => `"${c.replaceAll('"', '""')}"`);
    const insert = `INSERT INTO ${quoted} (${cols.join(", ")}) VALUES (${cols
      .map(() => "?")
      .join(", ")})`;
    await local.batch(
      res.rows.map((row) => ({
        sql: insert,
        args: res.columns.map((_, i) => row[i]),
      })),
      "write"
    );
    copied += res.rows.length;
    if (res.rows.length < BATCH) break;
  }
  console.log(`  ${name}: ${copied} rows`);
}

for (const type of ["index", "view", "trigger"])
  for (const { sql } of byType(type)) await local.execute(sql);

const check = await local.execute("PRAGMA integrity_check");
if (check.rows[0][0] !== "ok") throw new Error("integrity check failed");
const dangling = await local.execute("PRAGMA foreign_key_check");
if (dangling.rows.length)
  console.warn(`  note: ${dangling.rows.length} rows reference missing rows`);
fs.rmSync(out, { force: true });
await local.execute({ sql: "VACUUM INTO ?", args: [out] });
local.close();
remote.close();
fs.rmSync(tmp, { force: true });
for (const f of [`${tmp}-wal`, `${tmp}-shm`]) fs.rmSync(f, { force: true });

console.log(`Wrote ${out} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)`);

import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import path from "node:path";

let netlifyDbUrl: string | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getConnectionString } = require("@netlify/database");
  netlifyDbUrl = typeof getConnectionString === "function" ? getConnectionString() : undefined;
} catch {
  // Ignored if not running in Netlify environment
}

const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL || netlifyDbUrl;

type DbType = ReturnType<typeof drizzlePg>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaPglite?: PGlite;
  __arenaDb?: DbType;
};

export const pool = databaseUrl
  ? (globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      }))
  : undefined;

if (pool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

function getDatabase(): DbType {
  if (globalForDb.__arenaDb) {
    return globalForDb.__arenaDb;
  }

  let instance: DbType;
  if (databaseUrl && pool) {
    instance = drizzlePg(pool);
  } else {
    const dataDir = path.join(process.cwd(), ".pgdata");
    const pglite = globalForDb.__arenaPglite ?? new PGlite(dataDir);
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaPglite = pglite;
    }
    // drizzle-orm/pglite and drizzle-orm/node-postgres share the same PgDatabase interface
    instance = drizzlePglite(pglite) as unknown as DbType;
  }

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaDb = instance;
  }
  return instance;
}

export const db: DbType = getDatabase();

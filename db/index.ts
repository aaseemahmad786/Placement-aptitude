import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import path from "node:path";

let netlifyDbUrl: string | undefined;
try {
  const { getConnectionString } = require("@netlify/database");
  netlifyDbUrl = typeof getConnectionString === "function" ? getConnectionString() : undefined;
} catch {
  // Ignored if not running in Netlify environment
}

export const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL || netlifyDbUrl;

export const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build";

type DbType = ReturnType<typeof drizzlePg>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaDb?: DbType;
};

export const pool = databaseUrl
  ? (globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      }))
  : undefined;

if (pool) {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

function getDatabase(): DbType {
  if (globalForDb.__arenaDb) {
    return globalForDb.__arenaDb;
  }

  let instance: DbType;
  if (databaseUrl && pool) {
    instance = drizzlePg(pool);
  } else if (process.env.NODE_ENV !== "production") {
    try {
      const { PGlite } = require("@electric-sql/pglite");
      const { drizzle: drizzlePglite } = require("drizzle-orm/pglite");
      const dataDir = path.join(process.cwd(), ".pgdata");
      const pglite = new PGlite(dataDir);
      instance = drizzlePglite(pglite) as unknown as DbType;
    } catch {
      instance = drizzlePg(new Pool());
    }
  } else {
    // In production without DATABASE_URL, create dummy instance.
    // getAppData() falls back to static data so queries are not made.
    instance = drizzlePg(new Pool());
  }

  globalForDb.__arenaDb = instance;
  return instance;
}

export const db: DbType = new Proxy({} as DbType, {
  get(_target, prop) {
    const database = getDatabase();
    return database[prop as keyof DbType];
  },
});

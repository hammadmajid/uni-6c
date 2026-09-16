import { neon } from "@neondatabase/serverless";

/** Postgres via Neon's HTTP driver. Returns null when DATABASE_URL is not set. */
export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

let ensured = false;

/** Creates the single progress table on first use. Safe to call repeatedly. */
export async function ensureSchema(sql: NonNullable<ReturnType<typeof getSql>>) {
  if (ensured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  ensured = true;
}

/** Optional shared secret so a public deployment cannot be written to by strangers. */
export function checkSecret(req: Request): boolean {
  const expected = process.env.PROGRESS_SECRET;
  if (!expected) return true;
  return req.headers.get("x-progress-secret") === expected;
}

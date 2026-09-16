import { NextResponse } from "next/server";
import { checkSecret, ensureSchema, getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

const ROW_ID = "default";

/** GET: the stored progress snapshot, or { configured: false } when no database is wired up. */
export async function GET(req: Request) {
  const sql = getSql();
  if (!sql) return NextResponse.json({ configured: false });
  if (!checkSecret(req)) return NextResponse.json({ configured: true, error: "unauthorized" }, { status: 401 });
  try {
    await ensureSchema(sql);
    const rows = await sql`SELECT data, updated_at FROM progress WHERE id = ${ROW_ID}`;
    if (rows.length === 0) return NextResponse.json({ configured: true, data: null, updatedAt: null });
    return NextResponse.json({
      configured: true,
      data: rows[0].data,
      updatedAt: new Date(rows[0].updated_at as string).getTime(),
    });
  } catch (e) {
    return NextResponse.json({ configured: true, error: String(e) }, { status: 500 });
  }
}

/** PUT { data }: replaces the snapshot. The client sends an already-merged state. */
export async function PUT(req: Request) {
  const sql = getSql();
  if (!sql) return NextResponse.json({ configured: false }, { status: 400 });
  if (!checkSecret(req)) return NextResponse.json({ configured: true, error: "unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as { data?: unknown };
    if (!body || typeof body.data !== "object" || body.data === null) {
      return NextResponse.json({ error: "missing data" }, { status: 400 });
    }
    await ensureSchema(sql);
    const json = JSON.stringify(body.data);
    const rows = await sql`
      INSERT INTO progress (id, data, updated_at)
      VALUES (${ROW_ID}, ${json}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
      RETURNING updated_at
    `;
    return NextResponse.json({ configured: true, updatedAt: new Date(rows[0].updated_at as string).getTime() });
  } catch (e) {
    return NextResponse.json({ configured: true, error: String(e) }, { status: 500 });
  }
}

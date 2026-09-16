import type { Activity } from "./progress-store";
import type { ReviewItem } from "./spaced";

/** The persisted slice of the progress store. Same shape on disk, in localStorage and in Postgres. */
export interface Snapshot {
  activities: Record<string, Activity>;
  lessons: Record<string, { completedAt: number }>;
  lastVisited: Record<string, { href: string; title: string; at: number }>;
  review: ReviewItem[];
}

export const emptySnapshot: Snapshot = { activities: {}, lessons: {}, lastVisited: {}, review: [] };

/**
 * Per-key merge of two snapshots so that two devices used at different times
 * never lose each other's work. Latest evidence wins for each record.
 */
export function mergeSnapshots(a: Snapshot, b: Snapshot): Snapshot {
  const activities: Record<string, Activity> = { ...a.activities };
  for (const [k, v] of Object.entries(b.activities)) {
    const cur = activities[k];
    if (!cur) {
      activities[k] = v;
      continue;
    }
    const newer = (v.lastAttemptAt ?? 0) >= (cur.lastAttemptAt ?? 0) ? v : cur;
    activities[k] = {
      ...newer,
      attempts: Math.max(cur.attempts, v.attempts),
      hintsUsed: Math.max(cur.hintsUsed, v.hintsUsed),
      correct: cur.correct || v.correct,
      status: cur.status === "completed" || v.status === "completed" ? "completed" : newer.status,
      confidence: newer.confidence ?? cur.confidence ?? v.confidence,
    };
  }

  const lessons = { ...a.lessons };
  for (const [k, v] of Object.entries(b.lessons)) {
    if (!lessons[k] || v.completedAt > lessons[k].completedAt) lessons[k] = v;
  }

  const lastVisited = { ...a.lastVisited };
  for (const [k, v] of Object.entries(b.lastVisited)) {
    if (!lastVisited[k] || v.at > lastVisited[k].at) lastVisited[k] = v;
  }

  const review = new Map<string, ReviewItem>();
  for (const r of a.review) review.set(r.key, r);
  for (const r of b.review) {
    const cur = review.get(r.key);
    if (!cur) {
      review.set(r.key, r);
      continue;
    }
    const pick = r.reviewCount > cur.reviewCount ? r : r.reviewCount < cur.reviewCount ? cur : r.nextReviewAt >= cur.nextReviewAt ? r : cur;
    review.set(r.key, pick);
  }

  return { activities, lessons, lastVisited, review: [...review.values()] };
}

export function isEmptySnapshot(s: Snapshot): boolean {
  return (
    Object.keys(s.activities).length === 0 &&
    Object.keys(s.lessons).length === 0 &&
    Object.keys(s.lastVisited).length === 0 &&
    s.review.length === 0
  );
}

const SECRET_KEY = "uni-6c-progress-secret";

export function getSecret(): string {
  try {
    return localStorage.getItem(SECRET_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setSecret(v: string) {
  try {
    if (v) localStorage.setItem(SECRET_KEY, v);
    else localStorage.removeItem(SECRET_KEY);
  } catch {
    /* private mode */
  }
}

function headers(): HeadersInit {
  const s = getSecret();
  return s ? { "content-type": "application/json", "x-progress-secret": s } : { "content-type": "application/json" };
}

export type SyncState = "checking" | "local-only" | "unauthorized" | "synced" | "saving" | "error";

export async function pullSnapshot(): Promise<{ state: SyncState; data: Snapshot | null }> {
  try {
    const res = await fetch("/api/progress", { headers: headers(), cache: "no-store" });
    if (res.status === 401) return { state: "unauthorized", data: null };
    const json = (await res.json()) as { configured: boolean; data?: Snapshot | null; error?: string };
    if (!json.configured) return { state: "local-only", data: null };
    if (json.error) return { state: "error", data: null };
    return { state: "synced", data: json.data ?? null };
  } catch {
    return { state: "error", data: null };
  }
}

export async function pushSnapshot(data: Snapshot): Promise<SyncState> {
  try {
    const res = await fetch("/api/progress", { method: "PUT", headers: headers(), body: JSON.stringify({ data }) });
    if (res.status === 401) return "unauthorized";
    if (!res.ok) return "error";
    const json = (await res.json()) as { configured: boolean };
    return json.configured ? "synced" : "local-only";
  } catch {
    return "error";
  }
}

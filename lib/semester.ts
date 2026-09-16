/**
 * SZABIST Fall 2026 calendar. Week 1 started Monday 14 Sept 2026.
 * Midterm is week 8. Week 15 is the last teaching week.
 */
export const SEMESTER_START = new Date("2026-09-14T00:00:00+05:00");
export const TOTAL_WEEKS = 15;
export const MIDTERM_WEEK = 8;

const DAY_MS = 86_400_000;

export function weekStart(week: number): Date {
  return new Date(SEMESTER_START.getTime() + (week - 1) * 7 * DAY_MS);
}

export function weekEnd(week: number): Date {
  return new Date(weekStart(week).getTime() + 6 * DAY_MS);
}

/** 0 before the semester, 1..15 during, 16 after. */
export function currentWeek(now: Date = new Date()): number {
  const diff = now.getTime() - SEMESTER_START.getTime();
  if (diff < 0) return 0;
  return Math.min(Math.floor(diff / (7 * DAY_MS)) + 1, TOTAL_WEEKS + 1);
}

export function formatWeekRange(week: number): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Karachi" });
  return `${fmt(weekStart(week))} – ${fmt(weekEnd(week))}`;
}

/**
 * SZABIST Fall 2026 calendar. Week 1 started Monday 14 Sept 2026.
 *
 * Week numbers follow the course outlines: 15 weeks, week 8 is the midterm.
 * On the ground the midterm block is two calendar weeks (2 Nov to 15 Nov),
 * so week 8 is 14 days long and weeks 9 to 15 start one calendar week later
 * than a naive "14 Sept + 7(N−1)" would put them. Week 15 ends 3 Jan 2027.
 */
export const SEMESTER_START = new Date("2026-09-14T00:00:00+05:00");
export const TOTAL_WEEKS = 15;
export const MIDTERM_WEEK = 8;
/** Calendar weeks the midterm block occupies. */
export const MIDTERM_CALENDAR_WEEKS = 2;

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

/** Extra calendar weeks that sit before the start of `week`. */
function shift(week: number): number {
  return week > MIDTERM_WEEK ? MIDTERM_CALENDAR_WEEKS - 1 : 0;
}

export function weekStart(week: number): Date {
  return new Date(SEMESTER_START.getTime() + (week - 1 + shift(week)) * WEEK_MS);
}

export function weekEnd(week: number): Date {
  const days = week === MIDTERM_WEEK ? MIDTERM_CALENDAR_WEEKS * 7 - 1 : 6;
  return new Date(weekStart(week).getTime() + days * DAY_MS);
}

/** 0 before the semester, 1..15 during (both midterm calendar weeks map to 8), 16 after. */
export function currentWeek(now: Date = new Date()): number {
  const diff = now.getTime() - SEMESTER_START.getTime();
  if (diff < 0) return 0;
  const calendarWeek = Math.floor(diff / WEEK_MS) + 1;
  const week =
    calendarWeek <= MIDTERM_WEEK
      ? calendarWeek
      : calendarWeek < MIDTERM_WEEK + MIDTERM_CALENDAR_WEEKS
        ? MIDTERM_WEEK
        : calendarWeek - (MIDTERM_CALENDAR_WEEKS - 1);
  return Math.min(week, TOTAL_WEEKS + 1);
}

export function formatWeekRange(week: number): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Karachi" });
  return `${fmt(weekStart(week))} – ${fmt(weekEnd(week))}`;
}

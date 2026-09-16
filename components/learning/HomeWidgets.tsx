"use client";

import Link from "next/link";
import { courseProgress, useProgressStore } from "@/lib/learning/progress-store";
import { dueItems } from "@/lib/learning/spaced";

export function CourseCardProgress({ courseSlug, total }: { courseSlug: string; total: number }) {
  const hydrated = useProgressStore((s) => s.hydrated);
  const lessons = useProgressStore((s) => s.lessons);
  const p = hydrated ? courseProgress(lessons, courseSlug, total) : { done: 0, total, pct: 0 };
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-300">
        <div className="h-full rounded-full bg-blue-700 transition-all duration-500" style={{ width: `${p.pct}%` }} />
      </div>
      <span className="text-label-12-mono text-gray-700" suppressHydrationWarning>
        {p.done}/{p.total}
      </span>
    </div>
  );
}

export function ReviewDueBadge({ courseSlug }: { courseSlug?: string }) {
  const hydrated = useProgressStore((s) => s.hydrated);
  const review = useProgressStore((s) => s.review);
  if (!hydrated) return null;
  const due = dueItems(courseSlug ? review.filter((r) => r.courseSlug === courseSlug) : review);
  if (due.length === 0) return null;
  const href = courseSlug ? `/learn/${courseSlug}/review` : `/learn/${due[0].courseSlug}/review`;
  return (
    <Link href={href} className="text-label-14 rounded-full border border-amber-700/50 bg-amber-700/10 px-3 py-1 text-amber-600 transition-colors hover:bg-amber-700/20">
      {due.length} due for review
    </Link>
  );
}

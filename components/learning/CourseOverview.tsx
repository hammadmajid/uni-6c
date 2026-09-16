"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Lock } from "lucide-react";
import type { CourseMeta, FlatLesson } from "@/lib/content";
import { courseProgress, useProgressStore } from "@/lib/learning/progress-store";
import { formatWeekRange } from "@/lib/semester";
import { ReviewDueBadge } from "./HomeWidgets";
import { Pill } from "./ui";

export function CourseOverview({
  course,
  lessons,
  thisWeek,
  midtermWeek,
}: {
  course: CourseMeta;
  lessons: FlatLesson[];
  thisWeek: number;
  midtermWeek: number;
}) {
  const hydrated = useProgressStore((s) => s.hydrated);
  const done = useProgressStore((s) => s.lessons);
  const last = useProgressStore((s) => s.lastVisited[course.slug]);
  const p = hydrated ? courseProgress(done, course.slug, lessons.length) : { done: 0, total: lessons.length, pct: 0 };

  const firstUnfinished = lessons.find((l) => !done[l.key]);
  const resume = hydrated ? (last ? { href: last.href, title: last.title } : firstUnfinished ? { href: firstUnfinished.href, title: `Week ${firstUnfinished.module.week} · ${firstUnfinished.lesson.title}` } : null) : null;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-400 bg-background-200 p-4">
        <div className="min-w-[160px] flex-1">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-label-12 text-gray-700">Progress</span>
            <span className="text-label-12-mono text-gray-900" suppressHydrationWarning>
              {p.done}/{p.total} lessons
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-300">
            <div className="h-full rounded-full bg-blue-700 transition-all duration-500" style={{ width: `${p.pct}%` }} />
          </div>
        </div>
        <ReviewDueBadge courseSlug={course.slug} />
        {resume && (
          <Link href={resume.href} className="text-label-14 flex items-center gap-1.5 rounded-md bg-gray-1000 px-3.5 py-2 text-black transition-colors hover:bg-white">
            {last ? "Resume" : "Start"} <ArrowRight size={14} />
          </Link>
        )}
      </div>
      {resume && last && (
        <p className="text-copy-13 mt-2 text-gray-700" suppressHydrationWarning>
          Last opened: {last.title}
        </p>
      )}

      <h2 className="text-heading-20 mt-12 mb-4 text-gray-1000">15-week roadmap</h2>
      <ol className="space-y-3">
        {course.modules.map((mod) => {
          const built = mod.lessons.length > 0;
          const isNow = mod.week === thisWeek;
          const isPast = mod.week < thisWeek;
          const modDone = mod.lessons.filter((l) => done[`${course.slug}/${mod.slug}/${l.slug}`]).length;
          return (
            <li
              key={mod.slug}
              className={`rounded-lg border p-4 ${isNow ? "border-blue-700/50 bg-blue-700/5" : built ? "border-gray-400 bg-background-200" : "border-gray-400/60"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-label-12-mono ${built ? "text-gray-900" : "text-gray-600"}`}>Week {String(mod.week).padStart(2, "0")}</span>
                <span className="text-label-12 text-gray-600">{formatWeekRange(mod.week)}</span>
                {isNow && <Pill tone="blue">this week</Pill>}
                {mod.week === midtermWeek && <Pill tone="amber">midterm</Pill>}
                {built && hydrated && modDone === mod.lessons.length && mod.lessons.length > 0 && <Pill tone="green">done</Pill>}
                {!built && (
                  <span className="text-label-12 ml-auto flex items-center gap-1 text-gray-600">
                    <Lock size={11} /> {isPast ? "not built" : "coming"}
                  </span>
                )}
              </div>
              <h3 className={`text-heading-16 mt-1.5 ${built ? "text-gray-1000" : "text-gray-700"}`}>{mod.title}</h3>
              <p className="text-copy-13 mt-1 text-gray-700">{mod.outline}</p>
              {built && (
                <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                  {mod.lessons.map((l) => {
                    const key = `${course.slug}/${mod.slug}/${l.slug}`;
                    const isDone = hydrated && !!done[key];
                    return (
                      <li key={l.slug}>
                        <Link
                          href={`/learn/${course.slug}/${mod.slug}/${l.slug}`}
                          className="text-copy-14 group flex items-center gap-2 rounded-md px-2 py-1.5 text-gray-900 transition-colors hover:bg-gray-100 hover:text-gray-1000"
                        >
                          {isDone ? <CheckCircle2 size={14} className="shrink-0 text-green-600" /> : <Circle size={14} className="shrink-0 text-gray-500" />}
                          <span className="truncate">{l.title}</span>
                          <span className="text-label-12-mono ml-auto shrink-0 text-gray-600">{l.minutes}m</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

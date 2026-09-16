"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Lock } from "lucide-react";
import type { CourseMeta } from "@/lib/content";
import { useProgressStore } from "@/lib/learning/progress-store";

export function ProgressRail({ course, currentKey, thisWeek }: { course: CourseMeta; currentKey?: string; thisWeek: number }) {
  const hydrated = useProgressStore((s) => s.hydrated);
  const lessons = useProgressStore((s) => s.lessons);
  const built = course.modules.filter((m) => m.lessons.length > 0);
  const upcoming = course.modules.filter((m) => m.lessons.length === 0);

  return (
    <nav className="h-full space-y-6 overflow-y-auto p-4" aria-label="Course progress">
      {built.map((mod) => (
        <div key={mod.slug}>
          <div className="mb-2 flex items-center gap-2 px-2">
            <h3 className="text-label-12 uppercase tracking-wider text-gray-700">Week {mod.week}</h3>
            {mod.week === thisWeek && <span className="text-label-12 rounded-full bg-blue-700/15 px-1.5 text-blue-600">now</span>}
          </div>
          <p className="text-label-12 mb-2 px-2 text-gray-800">{mod.title}</p>
          <ul className="space-y-0.5">
            {mod.lessons.map((lesson) => {
              const key = `${course.slug}/${mod.slug}/${lesson.slug}`;
              const isCurrent = key === currentKey;
              const isDone = hydrated && !!lessons[key];
              return (
                <li key={lesson.slug}>
                  <Link
                    href={`/learn/${course.slug}/${mod.slug}/${lesson.slug}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`text-copy-13 flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors ${
                      isCurrent ? "bg-blue-700/10 text-blue-600" : isDone ? "text-gray-800 hover:text-gray-1000" : "text-gray-700 hover:text-gray-1000"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={14} className="shrink-0 text-green-600" />
                    ) : isCurrent ? (
                      <ArrowRight size={14} className="shrink-0 text-blue-600" />
                    ) : (
                      <Circle size={14} className="shrink-0 text-gray-500" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {upcoming.length > 0 && (
        <div className="border-t border-gray-400 pt-4">
          <p className="text-label-12 flex items-center gap-1.5 px-2 text-gray-600">
            <Lock size={11} /> Weeks {upcoming[0].week}–{upcoming[upcoming.length - 1].week} unlock as the semester goes
          </p>
        </div>
      )}
    </nav>
  );
}

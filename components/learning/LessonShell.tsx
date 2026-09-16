"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Menu, X } from "lucide-react";
import type { CourseMeta, FlatLesson } from "@/lib/content";
import { courseProgress, useProgressStore } from "@/lib/learning/progress-store";
import { currentWeek } from "@/lib/semester";
import { LessonProvider } from "./LessonContext";
import { ProgressRail } from "./ProgressRail";
import { Button, Pill } from "./ui";

interface Props {
  course: CourseMeta;
  current: FlatLesson;
  prev: FlatLesson | null;
  next: FlatLesson | null;
  total: number;
  children: ReactNode;
}

export function LessonShell({ course, current, prev, next, total, children }: Props) {
  const [navOpen, setNavOpen] = useState(false);
  const hydrated = useProgressStore((s) => s.hydrated);
  const lessons = useProgressStore((s) => s.lessons);
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const uncompleteLesson = useProgressStore((s) => s.uncompleteLesson);
  const setLastVisited = useProgressStore((s) => s.setLastVisited);
  const activities = useProgressStore((s) => s.activities);

  const done = hydrated && !!lessons[current.key];
  const progress = hydrated ? courseProgress(lessons, course.slug, total) : { done: 0, total, pct: 0 };
  const week = currentWeek();

  const lessonActivities = Object.entries(activities).filter(([k]) => k.startsWith(current.key + "/"));
  const solved = lessonActivities.filter(([, a]) => a.correct).length;

  useEffect(() => {
    setLastVisited(course.slug, current.href, `Week ${current.module.week} · ${current.lesson.title}`);
  }, [course.slug, current.href, current.module.week, current.lesson.title, setLastVisited]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <LessonProvider
      value={{
        courseSlug: course.slug,
        moduleSlug: current.module.slug,
        lessonSlug: current.lesson.slug,
        lessonKey: current.key,
        href: current.href,
        title: current.lesson.title,
      }}
    >
      <div className="min-h-screen bg-background-100">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-400 bg-background-100/85 px-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setNavOpen(!navOpen)} className="rounded-md p-1.5 hover:bg-gray-100 lg:hidden" aria-label="Toggle navigation">
              {navOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Link href="/" className="text-label-12 shrink-0 text-gray-700 transition-colors hover:text-gray-1000">
              6C
            </Link>
            <span className="text-gray-500">/</span>
            <Link href={`/learn/${course.slug}`} className="text-label-14 shrink-0 text-gray-900 transition-colors hover:text-gray-1000">
              {course.short}
            </Link>
            <span className="hidden text-gray-500 sm:inline">/</span>
            <span className="text-label-14 hidden truncate text-gray-1000 sm:inline">
              Week {current.module.week} · {current.lesson.title}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-label-12-mono hidden text-gray-700 sm:inline" suppressHydrationWarning>
              {progress.done}/{progress.total} lessons
            </span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-300">
              <div className="h-full rounded-full bg-blue-700 transition-all duration-500" style={{ width: `${progress.pct}%` }} />
            </div>
          </div>
        </header>

        <div className="flex">
          <aside
            className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-gray-400 bg-background-100 pt-14 transition-transform duration-200 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:pt-0 ${
              navOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <ProgressRail course={course} currentKey={current.key} thisWeek={week} />
          </aside>
          {navOpen && <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setNavOpen(false)} />}

          <main className="min-w-0 flex-1">
            <article className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
              <div className="mb-8">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Pill tone={current.module.week === week ? "blue" : "gray"}>Week {current.module.week}</Pill>
                  <Pill>{current.lesson.minutes} min</Pill>
                  {current.lesson.kind === "checkpoint" && <Pill tone="amber">Checkpoint</Pill>}
                  {done && <Pill tone="green">Completed</Pill>}
                </div>
                <h1 className="text-heading-32 text-gray-1000">{current.lesson.title}</h1>
                <p className="text-copy-16 mt-3 text-gray-900">
                  <span className="text-gray-600">You will be able to: </span>
                  {current.lesson.objective}
                </p>
              </div>

              <div className="lesson-prose">{children}</div>

              <footer className="mt-16 border-t border-gray-400 pt-8">
                <div className="rounded-lg border border-gray-400 bg-background-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-label-14 text-gray-1000">{done ? "Lesson complete" : "Finished this lesson?"}</p>
                      <p className="text-copy-13 mt-0.5 text-gray-700" suppressHydrationWarning>
                        {hydrated && lessonActivities.length > 0
                          ? `${solved} of ${lessonActivities.length} checks attempted here were solved.`
                          : "Mark it done to track your week."}
                      </p>
                    </div>
                    {done ? (
                      <Button variant="ghost" onClick={() => uncompleteLesson(current.key)}>
                        <Check size={14} className="text-green-600" /> Done · undo
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={() => completeLesson(current.key)}>
                        <Check size={14} /> Mark complete
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-stretch justify-between gap-3">
                  {prev ? (
                    <Link href={prev.href} className="group flex-1 rounded-lg border border-gray-400 p-4 transition-colors hover:border-gray-600">
                      <p className="text-label-12 mb-1 flex items-center gap-1 text-gray-600">
                        <ArrowLeft size={12} /> Previous
                      </p>
                      <p className="text-label-14 text-gray-900 group-hover:text-gray-1000">{prev.lesson.title}</p>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}
                  {next ? (
                    <Link href={next.href} className="group flex-1 rounded-lg border border-gray-400 p-4 text-right transition-colors hover:border-gray-600">
                      <p className="text-label-12 mb-1 flex items-center justify-end gap-1 text-gray-600">
                        Next <ArrowRight size={12} />
                      </p>
                      <p className="text-label-14 text-gray-900 group-hover:text-gray-1000">{next.lesson.title}</p>
                    </Link>
                  ) : (
                    <Link href={`/learn/${course.slug}`} className="group flex-1 rounded-lg border border-gray-400 p-4 text-right transition-colors hover:border-gray-600">
                      <p className="text-label-12 mb-1 flex items-center justify-end gap-1 text-gray-600">
                        Back to course <ArrowRight size={12} />
                      </p>
                      <p className="text-label-14 text-gray-900 group-hover:text-gray-1000">That is everything built so far</p>
                    </Link>
                  )}
                </div>
              </footer>
            </article>
          </main>
        </div>
      </div>
    </LessonProvider>
  );
}

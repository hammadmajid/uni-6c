"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface LessonCtx {
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  lessonKey: string; // course/module/lesson
  href: string;
  title: string;
}

const Ctx = createContext<LessonCtx | null>(null);

export function LessonProvider({ value, children }: { value: LessonCtx; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLesson(): LessonCtx {
  const v = useContext(Ctx);
  if (!v) {
    return { courseSlug: "_", moduleSlug: "_", lessonSlug: "_", lessonKey: "_/_/_", href: "/", title: "" };
  }
  return v;
}

export function useActivityKey(id: string): string {
  const { lessonKey } = useLesson();
  return `${lessonKey}/${id}`;
}

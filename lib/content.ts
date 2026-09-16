import { readFile, readdir, stat } from "fs/promises";
import path from "path";

export interface LessonMeta {
  slug: string;
  title: string;
  minutes: number;
  objective: string;
  kind?: "lesson" | "checkpoint";
}

export interface ModuleMeta {
  slug: string;
  week: number;
  title: string;
  outline: string;
  lessons: LessonMeta[];
}

export interface CourseMeta {
  slug: string;
  code: string;
  short: string;
  title: string;
  description: string;
  textbook: string;
  modules: ModuleMeta[];
}

const ROOT = path.join(process.cwd(), "content", "courses");

export async function listCourses(): Promise<CourseMeta[]> {
  let dirs: string[] = [];
  try {
    dirs = await readdir(ROOT);
  } catch {
    return [];
  }
  const courses: CourseMeta[] = [];
  for (const dir of dirs) {
    const p = path.join(ROOT, dir, "course.json");
    try {
      const s = await stat(p);
      if (!s.isFile()) continue;
      courses.push(JSON.parse(await readFile(p, "utf-8")));
    } catch {
      /* not a course dir */
    }
  }
  return courses.sort((a, b) => a.short.localeCompare(b.short));
}

export async function getCourse(slug: string): Promise<CourseMeta | null> {
  try {
    const raw = await readFile(path.join(ROOT, slug, "course.json"), "utf-8");
    return JSON.parse(raw) as CourseMeta;
  } catch {
    return null;
  }
}

export async function getLessonSource(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Promise<string | null> {
  try {
    return await readFile(path.join(ROOT, courseSlug, moduleSlug, `${lessonSlug}.mdx`), "utf-8");
  } catch {
    return null;
  }
}

export interface FlatLesson {
  module: ModuleMeta;
  lesson: LessonMeta;
  index: number;
  href: string;
  key: string;
}

/** All lessons in course order, with links and progress keys. */
export function flattenLessons(course: CourseMeta): FlatLesson[] {
  const out: FlatLesson[] = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      out.push({
        module: mod,
        lesson,
        index: out.length,
        href: `/learn/${course.slug}/${mod.slug}/${lesson.slug}`,
        key: `${course.slug}/${mod.slug}/${lesson.slug}`,
      });
    }
  }
  return out;
}

export function findLesson(course: CourseMeta, moduleSlug: string, lessonSlug: string) {
  const all = flattenLessons(course);
  const i = all.findIndex((l) => l.module.slug === moduleSlug && l.lesson.slug === lessonSlug);
  if (i === -1) return null;
  return { current: all[i], prev: all[i - 1] ?? null, next: all[i + 1] ?? null, all };
}

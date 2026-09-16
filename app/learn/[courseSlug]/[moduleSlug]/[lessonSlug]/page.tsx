import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { LessonShell } from "@/components/learning/LessonShell";
import { findLesson, flattenLessons, getCourse, getLessonSource, listCourses } from "@/lib/content";
import { mdxComponents } from "@/lib/mdx-components";

interface Params {
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  const courses = await listCourses();
  return courses.flatMap((c) =>
    flattenLessons(c).map((l) => ({ courseSlug: c.slug, moduleSlug: l.module.slug, lessonSlug: l.lesson.slug })),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { courseSlug, moduleSlug, lessonSlug } = await params;
  const course = await getCourse(courseSlug);
  const found = course && findLesson(course, moduleSlug, lessonSlug);
  return { title: found ? `${found.current.lesson.title} · ${course.short}` : "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { courseSlug, moduleSlug, lessonSlug } = await params;
  const course = await getCourse(courseSlug);
  if (!course) notFound();
  const found = findLesson(course, moduleSlug, lessonSlug);
  if (!found) notFound();
  const source = await getLessonSource(courseSlug, moduleSlug, lessonSlug);
  if (source === null) notFound();

  return (
    <LessonShell course={course} current={found.current} prev={found.prev} next={found.next} total={found.all.length}>
      <MDXRemote source={source} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] }, blockJS: false }} />
    </LessonShell>
  );
}

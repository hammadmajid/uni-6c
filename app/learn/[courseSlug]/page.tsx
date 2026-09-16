import Link from "next/link";
import { notFound } from "next/navigation";
import { flattenLessons, getCourse, listCourses } from "@/lib/content";
import { currentWeek, MIDTERM_WEEK } from "@/lib/semester";
import { CourseOverview } from "@/components/learning/CourseOverview";

export async function generateStaticParams() {
  const courses = await listCourses();
  return courses.map((c) => ({ courseSlug: c.slug }));
}

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const course = await getCourse(courseSlug);
  if (!course) notFound();
  const lessons = flattenLessons(course);
  const week = currentWeek();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-2 flex items-center gap-2">
        <Link href="/" className="text-label-12 text-gray-700 transition-colors hover:text-gray-1000">
          6C
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-label-12-mono text-gray-700">{course.code}</span>
      </div>
      <h1 className="text-heading-32 text-gray-1000">{course.title}</h1>
      <p className="text-copy-16 mt-3 max-w-2xl text-gray-900">{course.description}</p>
      <p className="text-copy-13 mt-2 text-gray-700">Text: {course.textbook}</p>

      <CourseOverview course={course} lessons={lessons} thisWeek={week} midtermWeek={MIDTERM_WEEK} />
    </main>
  );
}

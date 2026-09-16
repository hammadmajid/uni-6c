import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, listCourses } from "@/lib/content";
import { ReviewSession } from "@/components/learning/ReviewSession";

export async function generateStaticParams() {
  const courses = await listCourses();
  return courses.map((c) => ({ courseSlug: c.slug }));
}

export default async function ReviewPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const course = await getCourse(courseSlug);
  if (!course) notFound();
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-2 flex items-center gap-2">
        <Link href="/" className="text-label-12 text-gray-700 hover:text-gray-1000">
          6C
        </Link>
        <span className="text-gray-500">/</span>
        <Link href={`/learn/${course.slug}`} className="text-label-12 text-gray-700 hover:text-gray-1000">
          {course.short}
        </Link>
      </div>
      <h1 className="text-heading-24 text-gray-1000">Review</h1>
      <p className="text-copy-14 mt-2 text-gray-900">
        Questions you answered, weighted by how confident you were. Recall the answer out loud before you reveal it.
      </p>
      <ReviewSession courseSlug={course.slug} />
    </main>
  );
}

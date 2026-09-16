import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { flattenLessons, listCourses } from "@/lib/content";
import { currentWeek, formatWeekRange, TOTAL_WEEKS } from "@/lib/semester";
import { CourseCardProgress, ReviewDueBadge } from "@/components/learning/HomeWidgets";

export default async function Home() {
  const courses = await listCourses();
  const week = currentWeek();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12">
        <p className="text-label-12 mb-3 uppercase tracking-wider text-gray-700">SZABIST · BSCS · Semester 6 · Fall 2026</p>
        <h1 className="text-heading-32 text-gray-1000">Semester lab</h1>
        <p className="text-copy-16 mt-3 max-w-xl text-gray-900">
          Every course outline, taught as something you do rather than read. Predict, check, get corrected, move on.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-label-14 rounded-full border border-blue-700/50 bg-blue-700/10 px-3 py-1 text-blue-600">
            {week === 0 ? "Semester starts 14 Sept" : week > TOTAL_WEEKS ? "Semester over" : `Week ${week} of ${TOTAL_WEEKS} · ${formatWeekRange(week)}`}
          </span>
          <ReviewDueBadge />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((c) => {
          const lessons = flattenLessons(c);
          const builtWeeks = c.modules.filter((m) => m.lessons.length > 0).map((m) => m.week);
          return (
            <Link
              key={c.slug}
              href={`/learn/${c.slug}`}
              className="group rounded-lg border border-gray-400 bg-background-200 p-5 transition-colors hover:border-gray-600"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-label-12-mono text-gray-700">{c.code}</span>
                <ArrowRight size={14} className="text-gray-600 transition-colors group-hover:text-gray-1000" />
              </div>
              <h2 className="text-heading-20 text-gray-1000">{c.short}</h2>
              <p className="text-copy-14 mt-1 text-gray-900">{c.title}</p>
              <p className="text-copy-13 mt-3 text-gray-700">
                Weeks {builtWeeks[0]}–{builtWeeks[builtWeeks.length - 1]} built · {lessons.length} lessons
              </p>
              <CourseCardProgress courseSlug={c.slug} total={lessons.length} />
            </Link>
          );
        })}
        <div className="rounded-lg border border-dashed border-gray-500 p-5">
          <h2 className="text-heading-20 text-gray-700">More courses</h2>
          <p className="text-copy-14 mt-1 text-gray-700">
            Drop a course outline into a new directory at the repo root and the next session builds it here.
          </p>
        </div>
      </div>
    </main>
  );
}

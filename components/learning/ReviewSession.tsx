"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { dueItems } from "@/lib/learning/spaced";
import { Button } from "./ui";

export function ReviewSession({ courseSlug }: { courseSlug: string }) {
  const hydrated = useProgressStore((s) => s.hydrated);
  const review = useProgressStore((s) => s.review);
  const gradeReview = useProgressStore((s) => s.gradeReview);
  const removeReview = useProgressStore((s) => s.removeReview);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ done: 0, right: 0 });

  if (!hydrated) return <p className="text-copy-14 mt-8 text-gray-600">Loading your queue…</p>;

  const mine = review.filter((r) => r.courseSlug === courseSlug);
  const due = dueItems(mine);
  const item = due[0];

  if (!item) {
    const next = mine.slice().sort((a, b) => a.nextReviewAt - b.nextReviewAt)[0];
    return (
      <div className="mt-8 rounded-lg border border-green-700/40 bg-green-700/5 p-5">
        <p className="text-label-14 text-green-600">Nothing due.</p>
        <p className="text-copy-14 mt-1 text-gray-900">
          {session.done > 0 ? `This session: ${session.right} of ${session.done} recalled. ` : ""}
          {mine.length === 0
            ? "Answer quick checks in a lesson and they will show up here."
            : next
              ? `Next item comes back ${new Date(next.nextReviewAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}. ${mine.length} in the queue.`
              : ""}
        </p>
        <Link href={`/learn/${courseSlug}`} className="text-label-14 mt-3 inline-block text-blue-600 hover:underline">
          Back to course
        </Link>
      </div>
    );
  }

  function grade(correct: boolean) {
    gradeReview(item.key, correct);
    setSession((s) => ({ done: s.done + 1, right: s.right + (correct ? 1 : 0) }));
    setRevealed(false);
  }

  return (
    <div className="mt-8">
      <p className="text-label-12 mb-3 text-gray-700">
        {due.length} due · {session.done} done this session
      </p>
      <div key={item.key} className="animate-in fade-in rounded-lg border border-gray-400 bg-background-200 p-5 duration-150">
        <p className="text-copy-16 font-medium text-gray-1000">{item.question}</p>
        {!revealed ? (
          <div className="mt-5">
            <Button variant="primary" onClick={() => setRevealed(true)}>
              Reveal answer
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-md border border-blue-700/30 bg-blue-700/5 p-4">
              <p className="text-label-12 mb-1 text-blue-600">Answer</p>
              <p className="text-copy-14 text-gray-1000">{item.answer}</p>
              {item.explanation && <p className="text-copy-13 mt-2 text-gray-900">{item.explanation}</p>}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={() => grade(false)} className="border-red-700/50 text-red-600 hover:bg-red-700/10">
                Forgot · back tomorrow
              </Button>
              <Button onClick={() => grade(true)} className="border-green-700/50 text-green-600 hover:bg-green-700/10">
                Recalled · push it out
              </Button>
              <Link href={item.lessonHref} className="text-label-12 ml-auto text-gray-700 hover:text-gray-1000">
                Open lesson
              </Link>
              <button onClick={() => removeReview(item.key)} className="text-label-12 text-gray-600 hover:text-gray-900">
                Drop
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey, useLesson } from "./LessonContext";
import { Button } from "./ui";

interface PredictProps {
  id: string;
  prompt: string;
  /** One-line model answer, used for the review card. */
  answer: string;
  /** The full reveal (MDX children). */
  children: ReactNode;
  placeholder?: string;
}

/**
 * Prediction-gap pattern: the learner commits to a prediction in writing,
 * then the reveal appears, then they self-grade. Self-grading drives review.
 */
export function Predict({ id, prompt, answer, children, placeholder }: PredictProps) {
  const key = useActivityKey(id);
  const lesson = useLesson();
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const setConfidence = useProgressStore((s) => s.setConfidence);
  const addReview = useProgressStore((s) => s.addReview);

  const [text, setText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [grade, setGrade] = useState<"hit" | "partial" | "miss" | null>(null);

  function selfGrade(g: "hit" | "partial" | "miss") {
    setGrade(g);
    const conf = g === "hit" ? "high" : g === "partial" ? "medium" : "low";
    recordAttempt(key, g !== "miss");
    setConfidence(key, conf);
    addReview({
      key,
      courseSlug: lesson.courseSlug,
      lessonHref: lesson.href,
      question: prompt,
      answer,
      confidence: conf,
    });
  }

  return (
    <div className="my-6 rounded-lg border border-amber-700/40 bg-amber-700/5 p-5">
      <p className="text-label-12 mb-2 text-amber-600">Predict before you read</p>
      <p className="text-copy-16 font-medium text-gray-1000">{prompt}</p>

      {!revealed && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder ?? "Write your best guess. Being wrong here is the point."}
            rows={3}
            className="text-copy-14 mt-4 w-full rounded-md border border-gray-500 bg-background-100 px-3.5 py-2.5 text-gray-1000 outline-none transition-colors focus:border-amber-700"
          />
          <div className="mt-3 flex items-center gap-2">
            <Button variant="primary" onClick={() => setRevealed(true)} disabled={text.trim().length < 3}>
              Lock in and reveal
            </Button>
            <Button variant="ghost" onClick={() => setRevealed(true)}>
              I have no idea, show me
            </Button>
          </div>
        </>
      )}

      {revealed && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {text.trim() && (
            <div className="mb-4 rounded-md border border-gray-400 bg-background-200 p-3">
              <p className="text-label-12 mb-1 text-gray-600">Your prediction</p>
              <p className="text-copy-14 whitespace-pre-wrap text-gray-900">{text}</p>
            </div>
          )}
          <div className="rounded-md border border-blue-700/30 bg-blue-700/5 p-4">
            <p className="text-label-12 mb-2 text-blue-600">What actually happens</p>
            <div className="lesson-prose text-copy-14">{children}</div>
          </div>

          {grade === null ? (
            <div className="mt-4">
              <p className="text-label-12 mb-2 text-gray-700">How close were you?</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => selfGrade("hit")} className="border-green-700/50 text-green-600 hover:bg-green-700/10">
                  Nailed it
                </Button>
                <Button onClick={() => selfGrade("partial")} className="border-amber-700/50 text-amber-600 hover:bg-amber-700/10">
                  Partly
                </Button>
                <Button onClick={() => selfGrade("miss")} className="border-red-700/50 text-red-600 hover:bg-red-700/10">
                  Missed it
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-label-12 mt-4 text-gray-600">
              {grade === "hit"
                ? "Logged. This comes back in a week to make sure it stuck."
                : grade === "partial"
                  ? "Logged. Back in 3 days."
                  : "Logged. This one returns tomorrow. Missing a prediction is how the correct model gets built."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

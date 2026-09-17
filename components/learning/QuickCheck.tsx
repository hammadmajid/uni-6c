"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey, useLesson } from "./LessonContext";
import { ConfidenceRating } from "./ConfidenceRating";
import { Button, Feedback } from "./ui";

type Kind = "mcq" | "true-false" | "short-answer" | "numeric";

interface QuickCheckProps {
  id: string;
  question: string;
  type?: Kind;
  options?: string[];
  /** MCQ: the correct option text. T/F: "True"|"False". Short answer: accepted strings. Numeric: the number. */
  answer: string | number | string[];
  /** Numeric: relative tolerance (default 2%). */
  tolerance?: number;
  unit?: string;
  explanation: string;
  /** Per-wrong-option feedback keyed by option text. */
  feedback?: Record<string, string>;
  /** Generic "why the tempting answer is wrong". */
  misconception?: string;
  /** Skip the review queue (default: items go to spaced review). */
  noReview?: boolean;
  children?: ReactNode;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9./ -]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(s: string): number | null {
  const m = s.replace(/,/g, "").match(/-?\d*\.?\d+(e[-+]?\d+)?/i);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

export function QuickCheck({
  id,
  question,
  type = "mcq",
  options = [],
  answer,
  tolerance = 0.02,
  unit,
  explanation,
  feedback,
  misconception,
  noReview,
  children,
}: QuickCheckProps) {
  const key = useActivityKey(id);
  const lesson = useLesson();
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const recordReveal = useProgressStore((s) => s.recordReveal);
  const setConfidence = useProgressStore((s) => s.setConfidence);
  const addReview = useProgressStore((s) => s.addReview);
  // Ready once localStorage is in and the server pull (if any) has been merged.
  const ready = useProgressStore((s) => s.hydrated && s.sync !== "checking");
  const saved = useProgressStore((s) => s.activities[key]);

  const [value, setValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [restored, setRestored] = useState(false);
  const [rated, setRated] = useState(false);
  const seeded = useRef(false);

  // Restore what the learner already did with this check, once the store (local or Neon) is in.
  useEffect(() => {
    if (!ready || seeded.current) return;
    seeded.current = true;
    if (!saved || saved.attempts === 0 && !saved.revealed) return;
    setAttempts(saved.attempts);
    if (saved.correct) {
      setValue(saved.lastAnswer ?? String(Array.isArray(answer) ? answer[0] : answer));
      setResult("correct");
      setRated(saved.confidence !== null);
    } else if (saved.revealed) {
      setRevealed(true);
      setValue(saved.lastAnswer ?? "");
    } else if (saved.lastAnswer) {
      setValue(saved.lastAnswer);
      setResult("incorrect");
    }
    setRestored(true);
  }, [ready, saved, answer]);

  const displayAnswer =
    type === "numeric"
      ? `${answer}${unit ? " " + unit : ""}`
      : Array.isArray(answer)
        ? answer[0]
        : String(answer);

  function isCorrect(v: string): boolean {
    if (type === "numeric") {
      const n = parseNumber(v);
      if (n === null) return false;
      const target = Number(answer);
      if (target === 0) return Math.abs(n) < 1e-9;
      return Math.abs(n - target) / Math.abs(target) <= tolerance;
    }
    if (type === "short-answer") {
      const accepted = (Array.isArray(answer) ? answer : [String(answer)]).map(normalize);
      return accepted.includes(normalize(v));
    }
    return v === String(answer);
  }

  function check() {
    if (!value) return;
    const ok = isCorrect(value);
    setAttempts((a) => a + 1);
    setResult(ok ? "correct" : "incorrect");
    setRestored(false);
    recordAttempt(key, ok, value);
  }

  function rate(c: "low" | "medium" | "high") {
    setRated(true);
    setConfidence(key, c);
    if (!noReview) {
      addReview({
        key,
        courseSlug: lesson.courseSlug,
        lessonHref: lesson.href,
        question,
        answer: displayAnswer,
        explanation,
        confidence: c,
      });
    }
  }

  const locked = result === "correct" || revealed;
  const wrongFeedback = result === "incorrect" ? feedback?.[value] ?? misconception : undefined;

  return (
    <div className="my-6 rounded-lg border border-gray-400 bg-background-200 p-5">
      <p className="text-label-12 mb-2 text-blue-600">Quick check</p>
      <p className="text-copy-16 font-medium text-gray-1000">{question}</p>
      {children && <div className="text-copy-14 mt-3 text-gray-900">{children}</div>}

      <div className="mt-4">
        {(type === "mcq" || type === "true-false") && (
          <div className="space-y-2">
            {(type === "true-false" ? ["True", "False"] : options).map((opt) => {
              const selected = value === opt;
              const showCorrect = locked && opt === String(answer);
              const cls = showCorrect
                ? "border-green-700 bg-green-700/10"
                : selected && result === "incorrect"
                  ? "border-red-700 bg-red-700/10"
                  : selected
                    ? "border-blue-700 bg-blue-700/10"
                    : "border-gray-500 hover:border-gray-700";
              return (
                <label
                  key={opt}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors ${cls} ${
                    locked ? "cursor-default" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={key}
                    value={opt}
                    checked={selected}
                    disabled={locked}
                    onChange={() => {
                      setValue(opt);
                      setResult(null);
                    }}
                    className="mt-1 accent-blue-700"
                  />
                  <span className="text-copy-14 text-gray-1000">{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {(type === "short-answer" || type === "numeric") && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode={type === "numeric" ? "decimal" : "text"}
              value={value}
              disabled={locked}
              placeholder={type === "numeric" ? "Enter a number" : "Type your answer"}
              onChange={(e) => {
                setValue(e.target.value);
                setResult(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && check()}
              className="text-copy-14 w-full max-w-sm rounded-md border border-gray-500 bg-background-100 px-3.5 py-2.5 text-gray-1000 outline-none transition-colors focus:border-blue-700 disabled:opacity-60"
            />
            {unit && type === "numeric" && <span className="text-label-14-mono text-gray-700">{unit}</span>}
          </div>
        )}
      </div>

      {!locked && (
        <div className="mt-4 flex items-center gap-2">
          <Button variant="primary" onClick={check} disabled={!value}>
            Check
          </Button>
          {attempts >= 2 && result === "incorrect" && (
            <Button
              variant="ghost"
              onClick={() => {
                setRevealed(true);
                setResult(null);
                recordReveal(key);
                rate("low");
              }}
            >
              Show answer
            </Button>
          )}
        </div>
      )}

      {result === "correct" && (
        <Feedback tone="correct" title={restored ? "Answered earlier. Correct." : attempts === 1 ? "Correct, first try." : `Correct, after ${attempts} attempts.`}>
          <p>{explanation}</p>
        </Feedback>
      )}
      {result === "incorrect" && (
        <Feedback tone="incorrect" title={restored ? "Your last answer was not right. Try again." : "Not quite."}>
          {wrongFeedback ? (
            <p>
              <span className="text-amber-600">Why that is tempting: </span>
              {wrongFeedback}
            </p>
          ) : (
            <p>Think about it once more, then try again.</p>
          )}
        </Feedback>
      )}
      {revealed && (
        <Feedback tone="info" title={`Answer: ${displayAnswer}`}>
          <p>{explanation}</p>
          <p className="text-gray-600">Marked for review so it comes back tomorrow.</p>
        </Feedback>
      )}

      {result === "correct" && !rated && <ConfidenceRating onRate={rate} />}
      {result === "correct" && rated && saved?.confidence && (
        <p className="text-label-12 mt-2 text-gray-600">
          Confidence: {saved.confidence === "high" ? "knew it" : saved.confidence === "medium" ? "mostly sure" : "guessed"} · in your review queue.
        </p>
      )}

      {attempts > 0 && !locked && (
        <p className="text-label-12 mt-2 text-gray-600">
          {attempts} {attempts === 1 ? "attempt" : "attempts"}
        </p>
      )}
    </div>
  );
}

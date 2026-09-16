"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Plus, Check } from "lucide-react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useLesson } from "./LessonContext";

/** Inline glossary term. Click for the definition; star it to add to spaced review. */
export function Term({ term, def, children }: { term: string; def: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const lesson = useLesson();
  const addReview = useProgressStore((s) => s.addReview);
  const inQueue = useProgressStore((s) => s.review.some((r) => r.key === `${lesson.courseSlug}/term/${term}`));

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className="relative inline" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="cursor-help border-b border-dashed border-blue-600/50 text-gray-1000 transition-colors hover:border-blue-600"
      >
        {children ?? term}
      </button>
      {open && (
        <span
          role="dialog"
          className="animate-in fade-in zoom-in-95 absolute bottom-full left-1/2 z-50 mb-2 block w-72 -translate-x-1/2 rounded-lg border border-gray-500 bg-background-200 p-3.5 text-left shadow-xl duration-150"
        >
          <span className="mb-1.5 flex items-start justify-between gap-2">
            <span className="text-label-14 text-blue-600">{term}</span>
            <button
              onClick={() =>
                addReview({
                  key: `${lesson.courseSlug}/term/${term}`,
                  courseSlug: lesson.courseSlug,
                  lessonHref: lesson.href,
                  question: `Define: ${term}`,
                  answer: def,
                  confidence: "medium",
                })
              }
              disabled={inQueue}
              aria-label={inQueue ? "In review queue" : "Add to review"}
              className="rounded p-0.5 text-gray-700 transition-colors hover:text-blue-600 disabled:text-green-600"
            >
              {inQueue ? <Check size={14} /> : <Plus size={14} />}
            </button>
          </span>
          <span className="text-copy-13 block font-normal text-gray-900">{def}</span>
        </span>
      )}
    </span>
  );
}

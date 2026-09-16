"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey } from "./LessonContext";

const labels = ["Nudge", "Closer", "Almost there", "Full hint"];

export function HintLadder({ id, hints, answer }: { id: string; hints: string[]; answer?: string }) {
  const key = useActivityKey(id);
  const recordHint = useProgressStore((s) => s.recordHint);
  const [n, setN] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="my-4 space-y-2">
      {hints.slice(0, n).map((h, i) => (
        <div key={i} className="animate-in fade-in slide-in-from-bottom-1 rounded-md border border-amber-700/30 bg-amber-700/5 px-4 py-3 duration-200">
          <p className="text-label-12 mb-0.5 text-amber-600">
            Hint {i + 1} · {labels[i] ?? ""}
          </p>
          <p className="text-copy-14 text-gray-900">{h}</p>
        </div>
      ))}
      <div className="flex items-center gap-4">
        {n < hints.length && (
          <button
            onClick={() => {
              setN(n + 1);
              recordHint(key);
            }}
            className="text-label-12 flex items-center gap-1.5 text-amber-600 transition-colors hover:text-amber-500"
          >
            <ChevronDown size={12} />
            Hint {n + 1} of {hints.length}
          </button>
        )}
        {answer && n >= hints.length && !showAnswer && (
          <button onClick={() => setShowAnswer(true)} className="text-label-12 text-gray-700 hover:text-gray-1000">
            Show answer
          </button>
        )}
      </div>
      {showAnswer && answer && (
        <div className="rounded-md border border-gray-400 bg-background-200 px-4 py-3">
          <p className="text-label-12 mb-0.5 text-gray-600">Answer</p>
          <p className="text-copy-14 text-gray-1000">{answer}</p>
        </div>
      )}
    </div>
  );
}

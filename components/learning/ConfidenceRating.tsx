"use client";

import { useState } from "react";
import type { Confidence } from "@/lib/learning/spaced";

const levels: { value: Confidence; label: string; note: string }[] = [
  { value: "low", label: "Guessed", note: "review tomorrow" },
  { value: "medium", label: "Mostly sure", note: "review in 3 days" },
  { value: "high", label: "Knew it", note: "review in 7 days" },
];

export function ConfidenceRating({ onRate }: { onRate: (c: Confidence) => void }) {
  const [picked, setPicked] = useState<Confidence | null>(null);
  return (
    <div className="mt-3 rounded-md border border-gray-400 bg-background-200 p-3">
      <p className="text-label-12 mb-2 text-gray-700">How confident were you? This schedules your review.</p>
      <div className="flex gap-2">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => {
              setPicked(l.value);
              onRate(l.value);
            }}
            disabled={picked !== null}
            className={`flex-1 rounded-md border px-2 py-2 text-center transition-colors disabled:cursor-default ${
              picked === l.value
                ? "border-blue-700 bg-blue-700/10 text-blue-600"
                : picked
                  ? "border-gray-400 text-gray-600"
                  : "border-gray-500 text-gray-900 hover:border-gray-700 hover:text-gray-1000"
            }`}
          >
            <p className="text-sm font-medium">{l.label}</p>
            <p className="mt-0.5 text-[11px] text-gray-600">{l.note}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TimelineEvent {
  label: string;
  description: string;
  detail?: string;
}

/** Scrubbable sequence of events. Use for protocol exchanges and algorithm steps. */
export function Timeline({ title, events }: { title?: string; events: TimelineEvent[] }) {
  const [i, setI] = useState(0);
  const cur = events[i];
  return (
    <div className="my-6 rounded-lg border border-gray-400 bg-background-200 p-4">
      {title && <p className="text-label-12 mb-3 text-gray-700">{title}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          aria-label="Previous"
          className="rounded-md border border-gray-500 p-1.5 text-gray-800 hover:text-gray-1000 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="flex flex-1 items-center gap-1.5">
          {events.map((e, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={e.label}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                k === i ? "bg-blue-700" : k < i ? "bg-green-700" : "bg-gray-500"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setI(Math.min(events.length - 1, i + 1))}
          disabled={i === events.length - 1}
          aria-label="Next"
          className="rounded-md border border-gray-500 p-1.5 text-gray-800 hover:text-gray-1000 disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div key={i} className="animate-in fade-in mt-4 rounded-md border border-gray-400 bg-background-100 p-4 duration-150">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-label-12-mono text-blue-600">
            {i + 1}/{events.length}
          </span>
          <h4 className="text-label-14 text-gray-1000">{cur.label}</h4>
        </div>
        <p className="text-copy-14 text-gray-900">{cur.description}</p>
        {cur.detail && <p className="text-copy-13 mt-2 text-gray-700">{cur.detail}</p>}
      </div>
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type Kind = "why" | "edge" | "formal" | "exam" | "history" | "beyond";

const labels: Record<Kind, string> = {
  why: "Why this works",
  edge: "Edge cases",
  formal: "Formal definition",
  exam: "Model exam answer",
  history: "History",
  beyond: "Beyond the outline",
};

/** Progressive disclosure. Closed by default; content is real depth, not filler. */
export function Deeper({ kind = "why", title, children }: { kind?: Kind; title?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-4 rounded-lg border border-gray-400">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-gray-100"
      >
        <ChevronRight size={14} className={`text-gray-700 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
        <span className="text-label-12 uppercase tracking-wider text-gray-700">{labels[kind]}</span>
        {title && <span className="text-label-14 text-gray-1000">{title}</span>}
      </button>
      <div className="grid transition-[grid-template-rows] duration-200 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="lesson-prose border-t border-gray-400 px-4 py-4 text-[14px] leading-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

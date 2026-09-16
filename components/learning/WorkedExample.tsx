"use client";

import { Children, isValidElement, useState, type ReactNode } from "react";
import { ChevronRight, Eye, EyeOff } from "lucide-react";

interface StepProps {
  label: string;
  /** Shown before this step is revealed: "Try computing X first." */
  tryFirst?: string;
  children: ReactNode;
}

/** Declarative step inside a WorkedExample. Rendered by the parent. */
export function Step(_props: StepProps) {
  return null;
}

export function WorkedExample({ title, children }: { title: string; children: ReactNode }) {
  const steps = Children.toArray(children).filter(
    (c): c is React.ReactElement<StepProps> => isValidElement(c) && typeof (c.props as StepProps).label === "string",
  );
  const [revealed, setRevealed] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? steps.length : revealed;

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-400 bg-background-200">
      <div className="flex items-center justify-between border-b border-gray-400 px-4 py-3">
        <h4 className="text-label-14 text-gray-1000">
          <span className="text-gray-600">Worked example · </span>
          {title}
        </h4>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-label-12 flex items-center gap-1.5 text-gray-700 transition-colors hover:text-gray-1000"
        >
          {showAll ? <EyeOff size={12} /> : <Eye size={12} />}
          {showAll ? "Step mode" : "Show all"}
        </button>
      </div>
      <div className="divide-y divide-gray-400/60">
        {steps.slice(0, visible).map((step, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-top-1 flex items-start gap-3 px-4 py-4 duration-200">
            <span className="text-label-12 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-500 bg-background-100 text-gray-700">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-label-14 mb-1.5 text-gray-1000">{step.props.label}</p>
              <div className="lesson-prose text-[14px] leading-6">{step.props.children}</div>
            </div>
          </div>
        ))}
        {visible < steps.length && (
          <div className="px-4 py-4">
            {steps[visible].props.tryFirst && (
              <p className="text-copy-14 mb-3 text-amber-600">{steps[visible].props.tryFirst}</p>
            )}
            <button
              onClick={() => setRevealed((r) => Math.min(r + 1, steps.length))}
              className="text-label-12 flex items-center gap-1.5 text-gray-700 transition-colors hover:text-gray-1000"
            >
              <ChevronRight size={12} /> Show step {visible + 1} of {steps.length}
            </button>
          </div>
        )}
        {visible === steps.length && (
          <div className="bg-green-700/5 px-4 py-2.5">
            <p className="text-label-12 text-green-600">Complete. All {steps.length} steps shown.</p>
          </div>
        )}
      </div>
    </div>
  );
}

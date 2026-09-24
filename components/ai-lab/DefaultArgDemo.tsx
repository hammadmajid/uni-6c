"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Figure, P } from "@/components/learning/Figure";
import { Button } from "@/components/learning/ui";

const FRUITS = ["apple", "mango", "guava", "peach", "lychee"];
const W = 640;

/**
 * Side by side: `basket=[]` (one list, created when `def` runs) versus `basket=None` (a new list per call).
 * Each click is one more call; the SVG draws which list object each call's `basket` name points at.
 */
export function DefaultArgDemo() {
  const [calls, setCalls] = useState(0);
  const made = FRUITS.slice(0, calls);
  const rowH = 30;
  // The shared list box grows 14px per item; call rows start below it.
  const listBottom = 64 + Math.max(0, calls - 1) * 14;
  const rowsTop = listBottom + 28;
  const H = Math.max(150, rowsTop + calls * rowH);
  const half = W / 2;

  return (
    <Figure
      title="One default list, or one list per call"
      caption={
        <>
          The default value is evaluated once, when <code>def</code> runs, and stored on the function object. Every call that omits <code>basket</code> binds the name to that same list, so
          it keeps growing (left). With <code>None</code> as the sentinel, the list is created inside the body, so each call gets a fresh one (right).
        </>
      }
      controls={
        <div className="flex items-center gap-2">
          <Button onClick={() => setCalls((c) => Math.min(c + 1, FRUITS.length))} disabled={calls >= FRUITS.length}>
            call with &quot;{FRUITS[Math.min(calls, FRUITS.length - 1)]}&quot;
          </Button>
          <button onClick={() => setCalls(0)} aria-label="Reset" className="rounded-md p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-1000">
            <RotateCcw size={14} />
          </button>
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Default argument list objects">
        <text x={12} y={16} fill={P.redSoft} fontSize={11} fontFamily={P.mono}>
          def add_item(item, basket=[])
        </text>
        <text x={half + 12} y={16} fill={P.greenSoft} fontSize={11} fontFamily={P.mono}>
          def add_item(item, basket=None)
        </text>
        <line x1={half} x2={half} y1={4} y2={H - 4} stroke={P.line} />

        {/* Left: the single shared list lives on the function object. */}
        <rect x={12} y={30} width={half - 150} height={34} rx={4} fill={P.panel} stroke={P.lineStrong} />
        <text x={20} y={51} fill={P.text} fontSize={10} fontFamily={P.mono}>
          add_item.__defaults__
        </text>
        <rect x={half - 128} y={30} width={116} height={34 + Math.max(0, made.length - 1) * 14} rx={4} fill="rgba(229,72,77,0.08)" stroke={P.red} />
        <text x={half - 120} y={44} fill={P.redSoft} fontSize={9} fontFamily={P.mono}>
          list @ 0x7f..a0
        </text>
        {made.length === 0 ? (
          <text x={half - 120} y={58} fill={P.muted} fontSize={10} fontFamily={P.mono}>
            []
          </text>
        ) : (
          made.map((f, i) => (
            <text key={f} x={half - 120} y={58 + i * 14} fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
              {i === 0 ? "[" : " "}&quot;{f}&quot;{i === made.length - 1 ? "]" : ","}
            </text>
          ))
        )}
        <line x1={half - 150} x2={half - 130} y1={47} y2={47} stroke={P.lineStrong} markerEnd="url(#da-arrow)" />

        {made.map((f, i) => {
          const y = rowsTop + i * rowH;
          return (
            <g key={f}>
              <text x={12} y={y} fill={P.text} fontSize={10} fontFamily={P.mono}>
                call {i + 1}: basket →
              </text>
              <path d={`M 132 ${y - 4} C 200 ${y - 4}, ${half - 90} ${y - 20}, ${half - 70} ${listBottom}`} fill="none" stroke={P.red} strokeWidth={1} opacity={0.7} />
              <text x={12} y={y + 12} fill={P.muted} fontSize={9} fontFamily={P.mono}>
                returned it holding {i + 1} item{i ? "s" : ""}
              </text>
            </g>
          );
        })}

        {/* Right: one fresh list per call. */}
        {made.map((f, i) => {
          const y = 34 + i * rowH;
          return (
            <g key={f}>
              <text x={half + 12} y={y + 15} fill={P.text} fontSize={10} fontFamily={P.mono}>
                call {i + 1}: basket →
              </text>
              <rect x={half + 132} y={y} width={130} height={22} rx={4} fill="rgba(70,167,88,0.08)" stroke={P.green} />
              <text x={half + 140} y={y + 15} fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
                [&quot;{f}&quot;]
              </text>
            </g>
          );
        })}
        {calls === 0 && (
          <>
            <text x={12} y={100} fill={P.muted} fontSize={10} fontFamily={P.mono}>
              no calls yet: the list already exists
            </text>
            <text x={half + 12} y={50} fill={P.muted} fontSize={10} fontFamily={P.mono}>
              no calls yet: no list exists
            </text>
          </>
        )}
        <defs>
          <marker id="da-arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={P.lineStrong} />
          </marker>
        </defs>
      </svg>
    </Figure>
  );
}

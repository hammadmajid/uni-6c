"use client";

import { Lab, Presets, SliderRow, Stat, useExplorationState } from "@/components/learning/Controls";
import { P } from "@/components/learning/Figure";

// Prefixed keys: they live in the URL next to any other lab on the page.
const defaults = { rgStart: 2, rgStop: 10, rgStep: 3 };
type S = typeof defaults;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "range(5)", values: { rgStart: 0, rgStop: 5, rgStep: 1 } },
  { label: "range(2, 10, 3)", values: { rgStart: 2, rgStop: 10, rgStep: 3 } },
  { label: "range(10, 0, -3)", values: { rgStart: 10, rgStop: 0, rgStep: -3 } },
  { label: "range(5, 2)", values: { rgStart: 5, rgStop: 2, rgStep: 1 } },
];

const MIN = -5;
const MAX = 15;
const W = 640;
const H = 120;
const X0 = 24;
const X1 = W - 24;
const xAt = (n: number) => X0 + ((n - MIN) / (MAX - MIN)) * (X1 - X0);

function pyRange(start: number, stop: number, step: number): number[] {
  const out: number[] = [];
  if (step > 0) for (let i = start; i < stop; i += step) out.push(i);
  else for (let i = start; i > stop; i += step) out.push(i);
  return out;
}

/** Number line for range(start, stop, step): included values in blue, the excluded stop in amber. */
export function PyRangeLab() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const bad = v.rgStep === 0;
  const xs = bad ? [] : pyRange(v.rgStart, v.rgStop, v.rgStep);
  const call = v.rgStep === 1 ? (v.rgStart === 0 ? `range(${v.rgStop})` : `range(${v.rgStart}, ${v.rgStop})`) : `range(${v.rgStart}, ${v.rgStop}, ${v.rgStep})`;

  return (
    <Lab
      title="range() on a number line"
      subtitle="Half-open: start is in, stop is never in. Drag until the output surprises you."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <SliderRow label="start" value={v.rgStart} min={MIN} max={MAX} onChange={(x) => set("rgStart", x)} />
          <SliderRow label="stop" value={v.rgStop} min={MIN} max={MAX} onChange={(x) => set("rgStop", x)} />
          <SliderRow label="step" value={v.rgStep} min={-5} max={5} onChange={(x) => set("rgStep", x)} />
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Number line for ${call}`}>
        <line x1={X0} x2={X1} y1={60} y2={60} stroke={P.lineStrong} />
        {Array.from({ length: MAX - MIN + 1 }, (_, k) => {
          const n = MIN + k;
          const inside = xs.includes(n);
          const isStart = n === v.rgStart;
          const isStop = n === v.rgStop;
          return (
            <g key={n}>
              <line x1={xAt(n)} x2={xAt(n)} y1={55} y2={65} stroke={P.line} />
              <text x={xAt(n)} y={86} textAnchor="middle" fill={inside ? P.textStrong : P.muted} fontSize={10} fontFamily={P.mono}>
                {n}
              </text>
              {inside && <circle cx={xAt(n)} cy={60} r={7} fill={P.blue} />}
              {isStop && !bad && <circle cx={xAt(n)} cy={60} r={7} fill="none" stroke={P.amber} strokeWidth={2} />}
              {isStart && (
                <text x={xAt(n)} y={36} textAnchor="middle" fill={P.blueSoft} fontSize={10} fontFamily={P.mono}>
                  start
                </text>
              )}
              {isStop && (
                <text x={xAt(n)} y={isStart ? 24 : 36} textAnchor="middle" fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
                  stop (out)
                </text>
              )}
            </g>
          );
        })}
        {/* Arrows showing the direction of travel. */}
        {!bad &&
          xs.slice(0, -1).map((n, i) => {
            const a = xAt(n);
            const b = xAt(xs[i + 1]);
            const mid = (a + b) / 2;
            return <path key={n} d={`M ${a} 50 Q ${mid} ${34 - Math.min(Math.abs(b - a) / 6, 10)} ${b} 50`} fill="none" stroke={P.blue} strokeWidth={1} opacity={0.6} />;
          })}
        <text x={X0} y={H - 6} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          blue = produced · amber ring = stop, never produced
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Stat label={`list(${call})`} value={bad ? "ValueError" : `[${xs.join(", ")}]`} tone={bad ? "red" : xs.length === 0 ? "amber" : "blue"} note={bad ? "range() arg 3 must not be zero" : xs.length === 0 ? "Empty, and no error. The loop body never runs." : undefined} />
        <Stat label={`len(${call})`} value={bad ? "n/a" : String(xs.length)} note={v.rgStep === 1 && !bad ? "max(0, stop − start) when step is 1: the point of half-open" : undefined} />
      </div>
    </Lab>
  );
}

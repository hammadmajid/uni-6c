"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { Figure, P } from "@/components/learning/Figure";
import { SliderRow } from "@/components/learning/Controls";

const CAP = 10; // 1 Mbps ÷ 100 kbps
const PROB = 0.1;
const TICK_MS = 600;

/** P(Binomial(n, p) > k) */
function tailAbove(n: number, p: number, k: number): number {
  let cum = 0;
  let term = Math.pow(1 - p, n); // P(X = 0)
  for (let i = 0; i <= k; i++) {
    cum += term;
    term = (term * (n - i) * p) / ((i + 1) * (1 - p));
  }
  return Math.max(0, 1 - cum);
}

const W = 640;

function draw(n: number): boolean[] {
  return Array.from({ length: n }, () => Math.random() < PROB);
}

/** Animated statistical multiplexing: 35 bursty users share a link that can carry 10 at once. */
export function StatMuxStrip() {
  const [N, setN] = useState(35);
  const [active, setActive] = useState<boolean[]>(() => Array(35).fill(false));
  const [ticks, setTicks] = useState(0);
  const [over, setOver] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<number | null>(null);

  const step = () => {
    const a = draw(N);
    setActive(a);
    setTicks((t) => t + 1);
    if (a.filter(Boolean).length > CAP) setOver((o) => o + 1);
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (!playing || reduced) return;
    timer.current = window.setInterval(step, TICK_MS);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, reduced, N]);

  const cell = W / N;
  const theory = tailAbove(N, PROB, CAP) * 100;
  const count = active.filter(Boolean).length;
  const overloaded = count > CAP;
  const pct = ticks ? (over / ticks) * 100 : 0;

  const btn = "inline-flex items-center gap-1 rounded-md border border-gray-500 px-2 py-1 text-[12px] text-gray-1000 hover:border-gray-700 hover:bg-gray-100";

  // Layout
  const y1 = 22; // packet-switched users row
  const rowH = 26;
  const y2 = y1 + rowH + 34; // capacity bar
  const barH = 18;
  const y3 = y2 + barH + 46; // circuit row
  const H = y3 + rowH + 34;
  const circuitCell = W / CAP;

  return (
    <Figure
      title="Statistical multiplexing, live"
      controls={
        <div className="flex items-center gap-1.5">
          {!reduced && (
            <button className={btn} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? "pause" : "play"}
            </button>
          )}
          <button className={btn} onClick={step} aria-label="Step one tick">
            <StepForward size={12} /> step
          </button>
          <button
            className={btn}
            onClick={() => {
              setPlaying(false);
              setActive(Array(N).fill(false));
              setTicks(0);
              setOver(0);
            }}
            aria-label="Reset"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      }
      caption={
        <>
          Top row: {N} users, each active 10% of the time. The bar counts how many are talking right now against the 10 the 1 Mbps link can carry at
          100 kbps each. Overload (amber) happens, but rarely: let it run and compare your measured rate with what the binomial predicts. Then drag the slider past 50 users and watch amber become the normal state: that is the point where statistical multiplexing stops being free. Bottom
          row: circuit switching serves only 10 users, and most of their reserved slices sit idle (gray) at any moment. Same link, 3.5× the users.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Users flipping active, link capacity, and circuit-switched reservation">
        <text x={0} y={14} fill={P.text} fontSize={10} fontFamily={P.mono}>
          packet switching · {N} users · active now: {count}
        </text>
        {active.map((a, i) => (
          <rect key={i} x={i * cell + 1} y={y1} width={cell - 2} height={rowH} rx={2} fill={a ? P.blue : P.line} style={{ transition: "fill 150ms ease-out" }} />
        ))}

        <text x={0} y={y2 - 6} fill={P.text} fontSize={10} fontFamily={P.mono}>
          link: 1 Mbps = 10 × 100 kbps
        </text>
        <rect x={0} y={y2} width={W} height={barH} rx={3} fill={P.panel} stroke={P.lineStrong} />
        {Array.from({ length: CAP }, (_, i) => (
          <line key={i} x1={(i * W) / CAP} x2={(i * W) / CAP} y1={y2} y2={y2 + barH} stroke={P.line} />
        ))}
        <rect x={0} y={y2} width={(Math.min(count, CAP) * W) / CAP} height={barH} rx={3} fill={overloaded ? P.amber : P.blue} opacity={0.85} style={{ transition: "width 150ms ease-out" }} />
        {overloaded && (
          <text x={W} y={y2 + barH + 14} textAnchor="end" fill={P.amber} fontSize={10} fontFamily={P.mono}>
            {count - CAP} queued this tick
          </text>
        )}
        <text x={0} y={y2 + barH + 14} fill={overloaded ? P.amber : P.muted} fontSize={10} fontFamily={P.mono}>
          overloaded {over} of {ticks} ticks = {pct.toFixed(2)}% · theory {theory < 0.01 ? theory.toFixed(3) : theory.toFixed(1)}%
        </text>

        <text x={0} y={y3 - 6} fill={P.text} fontSize={10} fontFamily={P.mono}>
          circuit switching · 10 users · reserved whether active or not
        </text>
        {Array.from({ length: CAP }, (_, i) => {
          const a = active[i];
          return (
            <g key={i}>
              <rect x={i * circuitCell + 1} y={y3} width={circuitCell - 2} height={rowH} rx={2} fill={a ? P.green : P.lineStrong} opacity={a ? 0.9 : 0.6} style={{ transition: "fill 150ms ease-out" }} />
              <text x={i * circuitCell + circuitCell / 2} y={y3 + rowH / 2 + 4} textAnchor="middle" fill={a ? "#000" : P.muted} fontSize={9} fontFamily={P.mono}>
                {a ? "100k" : "idle"}
              </text>
            </g>
          );
        })}
        <text x={0} y={y3 + rowH + 16} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          users 11 to {N}: busy signal
        </text>
      </svg>
      <div className="mt-3">
        <SliderRow
          label="Users sharing the link (each active 10% of the time)"
          value={N}
          min={10}
          max={80}
          onChange={(n) => {
            setN(n);
            setActive(Array(n).fill(false));
            setTicks(0);
            setOver(0);
          }}
        />
      </div>
    </Figure>
  );
}

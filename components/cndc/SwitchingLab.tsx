"use client";

import { Lab, Presets, SliderRow, Stat, fmtRate, useExplorationState } from "@/components/learning/Controls";

const defaults = { R: 1000, r: 100, p: 10, N: 35, tol: 3 }; // R kbps, r kbps, p %, N users, tol = 10^-tol
type S = typeof defaults;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "Kurose 1.3", values: { R: 1000, r: 100, p: 10, N: 35, tol: 3 } },
  { label: "Chatty users", values: { R: 1000, r: 100, p: 50, N: 35, tol: 3 } },
  { label: "Big pipe", values: { R: 10000, r: 100, p: 10, N: 500, tol: 3 } },
];

function logFact(n: number): number {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
}

/** P(X > k) for X ~ Binomial(N, p). */
function tailAbove(N: number, p: number, k: number): number {
  if (k >= N) return 0;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  let sum = 0;
  const lp = Math.log(p);
  const lq = Math.log(1 - p);
  const lN = logFact(N);
  for (let i = k + 1; i <= N; i++) {
    sum += Math.exp(lN - logFact(i) - logFact(N - i) + i * lp + (N - i) * lq);
  }
  return Math.min(sum, 1);
}

export function SwitchingLab() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const p = v.p / 100;
  const k = Math.floor(v.R / v.r); // simultaneous users the link can carry
  const pOver = tailAbove(v.N, p, k);
  const threshold = Math.pow(10, -v.tol);

  // Largest N that keeps P(overload) below threshold.
  let nMax = k;
  for (let n = k; n <= 2000; n++) {
    if (tailAbove(n, p, k) > threshold) break;
    nMax = n;
  }

  const expectedActive = v.N * p;
  const W = 560;
  const H = 120;
  const barW = (W - 40) / Math.max(v.N, 1);

  return (
    <Lab
      title="Circuit vs packet switching: how many users fit?"
      subtitle="Same link, same users. Circuit switching reserves; packet switching gambles on statistics."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <SliderRow label="Link rate R" value={v.R} min={100} max={10000} step={100} onChange={(x) => set("R", x)} format={(x) => fmtRate(x * 1e3)} />
          <SliderRow label="Per-user rate when active r" value={v.r} min={10} max={1000} step={10} onChange={(x) => set("r", x)} format={(x) => fmtRate(x * 1e3)} />
          <SliderRow label="Fraction of time active p" value={v.p} min={1} max={100} onChange={(x) => set("p", x)} format={(x) => `${x}%`} />
          <SliderRow label="Users on the link N" value={v.N} min={1} max={600} onChange={(x) => set("N", x)} />
          <SliderRow label="Tolerated overload probability" value={v.tol} min={1} max={6} onChange={(x) => set("tol", x)} format={(x) => `10⁻${x}`} />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Circuit switching supports" value={`${k} users`} tone="blue" note={`⌊R / r⌋ = ⌊${v.R} / ${v.r}⌋. Hard limit, zero waiting.`} />
        <Stat label={`P(more than ${k} of ${v.N} active)`} value={pOver < 1e-6 ? "< 10⁻⁶" : pOver.toExponential(2)} tone={pOver > threshold ? "red" : "green"} note={pOver > threshold ? "over your tolerance: queues and loss" : "within tolerance"} />
        <Stat label={`Packet switching supports (≤ 10⁻${v.tol})`} value={`${nMax} users`} tone="green" note={`${(nMax / Math.max(k, 1)).toFixed(1)}× the circuit-switched count`} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label="Users on the link">
        {Array.from({ length: v.N }, (_, i) => {
          const active = i < Math.round(expectedActive);
          return <rect key={i} x={20 + i * barW} y={active ? 20 : 50} width={Math.max(barW - 1, 1)} height={active ? 60 : 30} fill={active ? (i < k ? "#0070f3" : "#e5484d") : "#2e2e2e"} rx={1} />;
        })}
        <line x1={20 + k * barW} x2={20 + k * barW} y1={10} y2={90} stroke="#ffb224" strokeDasharray="3 3" />
        <text x={Math.min(20 + k * barW + 4, W - 120)} y={14} fill="#ffb224" fontSize={10} fontFamily="var(--font-mono)">
          circuit limit = {k}
        </text>
        <text x={20} y={H - 6} fill="#6b6b6b" fontSize={10} fontFamily="var(--font-mono)">
          expected active at once: {expectedActive.toFixed(1)} of {v.N}
        </text>
      </svg>
      <p className="text-copy-13 mt-1 text-gray-600">
        Tall bars are users active in a typical moment. Blue ones fit in the link; red ones would be queued. Gray ones are idle and, under circuit switching, would still be holding a reserved slice that nobody can use.
      </p>
    </Lab>
  );
}

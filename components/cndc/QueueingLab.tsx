"use client";

import { Lab, Presets, SliderRow, Stat, fmtRate, fmtTime, useExplorationState } from "@/components/learning/Controls";

const defaults = { R: 10, L: 1500, a: 400, burst: 1 }; // R Mbps, L bytes, a pkts/s, burst = packets arriving together
type S = typeof defaults;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "Light load", values: { R: 10, L: 1500, a: 200, burst: 1 } },
  { label: "Near the cliff", values: { R: 10, L: 1500, a: 780, burst: 1 } },
  { label: "Over the cliff", values: { R: 10, L: 1500, a: 1000, burst: 1 } },
  { label: "Bursty, low average", values: { R: 10, L: 1500, a: 200, burst: 20 } },
];

export function QueueingLab() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const R = v.R * 1e6;
  const Lbits = v.L * 8;
  const rho = (Lbits * v.a) / R;
  const dTrans = Lbits / R;
  // M/M/1-style shape: average wait ≈ ρ / (1 − ρ) transmission times. Good enough to show the cliff.
  const avgWait = rho < 1 ? (rho / (1 - rho)) * dTrans : Infinity;

  const W = 560;
  const H = 220;
  const padL = 44;
  const padB = 28;
  const padT = 12;
  const maxY = 10; // in units of dTrans
  const xs = Array.from({ length: 200 }, (_, i) => i / 200);
  const path = xs
    .map((x, i) => {
      const y = Math.min(x / (1 - x), maxY);
      const px = padL + x * (W - padL - 12);
      const py = H - padB - (y / maxY) * (H - padB - padT);
      return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");
  const markX = padL + Math.min(rho, 1) * (W - padL - 12);
  const markY = H - padB - (Math.min(rho < 1 ? rho / (1 - rho) : maxY, maxY) / maxY) * (H - padB - padT);

  const burstDelays = Array.from({ length: Math.min(v.burst, 8) }, (_, k) => k * dTrans);

  return (
    <Lab
      title="Queueing delay and traffic intensity"
      subtitle="ρ = L·a / R. Push it toward 1 and watch what happens to the wait."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <SliderRow label="Link rate R (Mbps)" value={v.R} min={1} max={100} onChange={(x) => set("R", x)} format={(x) => fmtRate(x * 1e6)} />
          <SliderRow label="Packet size L (bytes)" value={v.L} min={64} max={9000} step={8} onChange={(x) => set("L", x)} />
          <SliderRow label="Average arrival rate a (packets/s)" value={v.a} min={1} max={2000} onChange={(x) => set("a", x)} />
          <SliderRow label="Packets arriving in one burst" value={v.burst} min={1} max={50} onChange={(x) => set("burst", x)} />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Traffic intensity ρ = L·a/R" value={rho.toFixed(3)} tone={rho >= 1 ? "red" : rho > 0.7 ? "amber" : "green"} note={`${Lbits.toLocaleString()} bits × ${v.a}/s ÷ ${fmtRate(R)}`} />
        <Stat label="One transmission time L/R" value={fmtTime(dTrans)} />
        <Stat
          label="Average queueing wait"
          value={rho >= 1 ? "unbounded" : fmtTime(avgWait)}
          tone={rho >= 1 ? "red" : "default"}
          note={rho >= 1 ? "arrivals exceed capacity: queue grows, then drops" : `≈ ${(rho / (1 - rho)).toFixed(2)} packets ahead of you`}
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label="Queueing delay versus traffic intensity">
        <line x1={padL} x2={W - 12} y1={H - padB} y2={H - padB} stroke="#2e2e2e" />
        <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="#2e2e2e" />
        <path d={path} fill="none" stroke="#6b6b6b" strokeWidth={1.5} />
        <line x1={padL + 1 * (W - padL - 12)} x2={padL + 1 * (W - padL - 12)} y1={padT} y2={H - padB} stroke="#e5484d" strokeDasharray="3 3" opacity={0.6} />
        <circle cx={markX} cy={markY} r={6} fill={rho >= 1 ? "#e5484d" : rho > 0.7 ? "#ffb224" : "#46a758"} style={{ transition: "cx 120ms ease-out, cy 120ms ease-out" }} />
        <text x={padL} y={H - 8} fill="#6b6b6b" fontSize={10} fontFamily="var(--font-mono)">
          ρ = 0
        </text>
        <text x={W - 12} y={H - 8} textAnchor="end" fill="#e5484d" fontSize={10} fontFamily="var(--font-mono)">
          ρ = 1
        </text>
        <text x={padL - 6} y={padT + 8} textAnchor="end" fill="#6b6b6b" fontSize={10} fontFamily="var(--font-mono)">
          wait
        </text>
      </svg>

      <div className="mt-4 rounded-md border border-gray-400 bg-background-100 p-3">
        <p className="text-label-12 text-gray-700">
          Even at ρ = {rho.toFixed(2)}: if {v.burst} packets arrive at the same instant, the k-th one waits (k−1)·L/R
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {burstDelays.map((d, k) => (
            <span key={k} className="text-label-12-mono rounded border border-gray-400 px-2 py-1 text-gray-900">
              #{k + 1}: {fmtTime(d)}
            </span>
          ))}
          {v.burst > 8 && <span className="text-label-12-mono self-center text-gray-600">… #{v.burst}: {fmtTime((v.burst - 1) * dTrans)}</span>}
        </div>
        <p className="text-copy-13 mt-2 text-gray-600">Average intensity below 1 does not save you from bursts. That is why routers need buffers, and why buffers still overflow.</p>
      </div>
    </Lab>
  );
}

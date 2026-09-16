"use client";

import { Lab, Presets, SegmentRow, SliderRow, Stat, fmtRate, fmtTime, useExplorationState } from "@/components/learning/Controls";

const RATES = [56e3, 1e6, 10e6, 100e6, 1e9, 10e9, 100e9];

const defaults = {
  L: 1500, // bytes
  r: 2, // index into RATES
  d: 1000, // km
  s: 2.0, // ×10^8 m/s
  N: 3, // links
  proc: 0, // µs
  queue: 0, // ms
  unit: "bytes" as "bytes" | "bits",
};

type S = typeof defaults;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "LAN", values: { L: 1500, r: 4, d: 0.1, N: 1, proc: 0, queue: 0 } },
  { label: "Kurose 1.4", values: { L: 1000, r: 1, d: 1, N: 1, proc: 0, queue: 0 } },
  { label: "Cross-country", values: { L: 1500, r: 3, d: 3000, N: 4, proc: 0, queue: 0 } },
  { label: "Satellite", values: { L: 1500, r: 2, d: 36000, N: 1, proc: 0, queue: 0 } },
  { label: "Congested", values: { L: 1500, r: 2, d: 500, N: 3, proc: 10, queue: 20 } },
];

export function DelayLab() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const bits = v.unit === "bytes" ? v.L * 8 : v.L;
  const R = RATES[v.r];
  const dTrans = bits / R;
  const dProp = (v.d * 1000) / (v.s * 1e8);
  const dProc = v.proc * 1e-6;
  const dQueue = v.queue * 1e-3;
  const perHop = dProc + dQueue + dTrans + dProp;
  const total = v.N * perHop;

  const dominant =
    dQueue > Math.max(dTrans, dProp, dProc)
      ? "queueing"
      : dTrans >= dProp && dTrans >= dProc
        ? "transmission"
        : dProp >= dProc
          ? "propagation"
          : "processing";

  // Space-time diagram: rows = nodes, x = time.
  const W = 640;
  const H = 40 + v.N * 56;
  const padL = 64;
  const padR = 16;
  const tScale = (W - padL - padR) / Math.max(total, 1e-12);
  const rowY = (i: number) => 28 + i * 56;

  const hops = Array.from({ length: v.N }, (_, i) => {
    const t0 = i * perHop + dProc + dQueue; // first bit leaves node i
    return {
      i,
      wait: i * perHop,
      t0,
      firstArrive: t0 + dProp,
      lastLeave: t0 + dTrans,
      lastArrive: t0 + dTrans + dProp,
    };
  });

  return (
    <Lab
      title="Nodal delay across N store-and-forward links"
      subtitle="Every slider changes one term of d_nodal = d_proc + d_queue + d_trans + d_prop. Watch which term wins."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <SegmentRow
            label="Packet size unit"
            value={v.unit}
            options={[
              { value: "bytes", label: "bytes" },
              { value: "bits", label: "bits" },
            ]}
            onChange={(u) => set("unit", u)}
          />
          <SliderRow label={`Packet size L (${v.unit})`} value={v.L} min={64} max={12000} step={8} onChange={(x) => set("L", x)} format={(x) => x.toLocaleString()} />
          <SliderRow label="Link rate R" value={v.r} min={0} max={RATES.length - 1} onChange={(x) => set("r", x)} format={(x) => fmtRate(RATES[x])} />
          <SliderRow label="Link length d (km)" value={v.d} min={0.1} max={40000} step={0.1} onChange={(x) => set("d", x)} format={(x) => (x < 1 ? `${(x * 1000).toFixed(0)} m` : `${x.toLocaleString()} km`)} />
          <SliderRow label="Propagation speed s" value={v.s} min={1.5} max={3} step={0.1} onChange={(x) => set("s", x)} format={(x) => `${x.toFixed(1)}×10⁸ m/s`} />
          <SliderRow label="Links in path N" value={v.N} min={1} max={6} onChange={(x) => set("N", x)} />
          <SliderRow label="Processing per node (µs)" value={v.proc} min={0} max={200} onChange={(x) => set("proc", x)} />
          <SliderRow label="Queueing per node (ms)" value={v.queue} min={0} max={100} onChange={(x) => set("queue", x)} />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="d_trans = L / R" value={fmtTime(dTrans)} tone={dominant === "transmission" ? "blue" : "default"} note={`${bits.toLocaleString()} bits ÷ ${fmtRate(R)}`} />
        <Stat label="d_prop = d / s" value={fmtTime(dProp)} tone={dominant === "propagation" ? "blue" : "default"} note={`${v.d} km ÷ ${v.s}×10⁸ m/s`} />
        <Stat label="d_proc + d_queue" value={fmtTime(dProc + dQueue)} tone={dominant === "queueing" ? "amber" : "default"} />
        <Stat label={`End-to-end (N = ${v.N})`} value={fmtTime(total)} tone="green" note={`${v.N} × ${fmtTime(perHop)}`} />
      </div>

      <p className="text-copy-13 mt-3 text-gray-700">
        Dominant term right now: <span className="text-gray-1000">{dominant}</span>.{" "}
        {dominant === "transmission"
          ? "The link is slow relative to distance. Faster link or smaller packet helps; shorter cable does not."
          : dominant === "propagation"
            ? "Distance rules. No amount of bandwidth fixes this. Only moving the endpoints closer does."
            : dominant === "queueing"
              ? "The router is the bottleneck, not the wire. This is what congestion looks like."
              : "Header lookups dominate. Only happens on tiny packets over fast short links."}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label="Space-time diagram of a packet crossing links">
        {Array.from({ length: v.N + 1 }, (_, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={rowY(i)} y2={rowY(i)} stroke="#2e2e2e" strokeWidth={1} />
            <text x={padL - 8} y={rowY(i) + 4} textAnchor="end" fill="#8f8f8f" fontSize={11} fontFamily="var(--font-mono)">
              {i === 0 ? "src" : i === v.N ? "dst" : `R${i}`}
            </text>
          </g>
        ))}
        {hops.map((h) => {
          const x = (t: number) => padL + t * tScale;
          const y0 = rowY(h.i);
          const y1 = rowY(h.i + 1);
          return (
            <g key={h.i}>
              {h.wait > 0 && (
                <rect x={x(h.i * perHop)} y={y0 - 4} width={Math.max(x(h.t0) - x(h.i * perHop), 0)} height={8} fill="#ffb224" opacity={0.6} rx={1} />
              )}
              <polygon
                points={`${x(h.t0)},${y0} ${x(h.lastLeave)},${y0} ${x(h.lastArrive)},${y1} ${x(h.firstArrive)},${y1}`}
                fill="#0070f3"
                opacity={0.55}
                style={{ transition: "all 150ms ease-out" }}
              />
              <rect x={x(h.t0)} y={y0 - 4} width={Math.max(x(h.lastLeave) - x(h.t0), 1)} height={8} fill="#0070f3" rx={1} />
            </g>
          );
        })}
        <text x={padL} y={H - 6} fill="#6b6b6b" fontSize={10} fontFamily="var(--font-mono)">
          t = 0
        </text>
        <text x={W - padR} y={H - 6} textAnchor="end" fill="#6b6b6b" fontSize={10} fontFamily="var(--font-mono)">
          t = {fmtTime(total)}
        </text>
      </svg>
      <p className="text-copy-13 mt-1 text-gray-600">
        Thick bar: node pushing bits out (transmission). Slanted band: bits in flight (propagation). Amber: waiting at the node
        (processing + queueing). Each router must receive the whole packet before it forwards: store-and-forward.
      </p>
    </Lab>
  );
}

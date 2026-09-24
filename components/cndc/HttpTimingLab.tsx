"use client";

import { Lab, Presets, SegmentRow, SliderRow, Stat, useExplorationState } from "@/components/learning/Controls";
import { P } from "@/components/learning/Figure";

type Mode = "np-serial" | "np-parallel" | "p-nopipe" | "p-pipe";

const defaults = { mode: "np-serial" as Mode, rtt: 100, M: 10, tx: 0, N: 5 };
type S = typeof defaults;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "Slide example: 1 HTML + 10 JPEGs", values: { mode: "np-serial", rtt: 100, M: 10, tx: 0, N: 5 } },
  { label: "Browser default: 6 parallel", values: { mode: "np-parallel", N: 6 } },
  { label: "Big images", values: { tx: 40 } },
  { label: "VPS in Frankfurt from Islamabad", values: { rtt: 150 } },
];

type Kind = "hs" | "req" | "tx";
interface Seg {
  start: number;
  dur: number;
  kind: Kind;
}
interface Row {
  label: string;
  segs: Seg[];
}

/** Lay out every TCP connection's handshake, request/response and transmission segments, in ms. */
function schedule(mode: Mode, rtt: number, M: number, tx: number, N: number): { rows: Row[]; total: number } {
  const rows: Row[] = [];
  let t = 0;

  if (mode === "np-serial") {
    for (let i = 0; i <= M; i++) {
      rows.push({
        label: i === 0 ? "html" : `obj ${i}`,
        segs: [
          { start: t, dur: rtt, kind: "hs" },
          { start: t + rtt, dur: rtt, kind: "req" },
          { start: t + 2 * rtt, dur: tx, kind: "tx" },
        ],
      });
      t += 2 * rtt + tx;
    }
    return { rows, total: t };
  }

  if (mode === "np-parallel") {
    rows.push({
      label: "html",
      segs: [
        { start: 0, dur: rtt, kind: "hs" },
        { start: rtt, dur: rtt, kind: "req" },
        { start: 2 * rtt, dur: tx, kind: "tx" },
      ],
    });
    t = 2 * rtt + tx;
    let done = 0;
    while (done < M) {
      const k = Math.min(N, M - done);
      for (let j = 0; j < k; j++) {
        rows.push({
          label: `obj ${done + j + 1}`,
          segs: [
            { start: t, dur: rtt, kind: "hs" },
            { start: t + rtt, dur: rtt, kind: "req" },
            // The parallel connections share one access link, so their bits go out one after another.
            { start: t + 2 * rtt + j * tx, dur: tx, kind: "tx" },
          ],
        });
      }
      t += 2 * rtt + k * tx;
      done += k;
    }
    return { rows, total: t };
  }

  const segs: Seg[] = [
    { start: 0, dur: rtt, kind: "hs" },
    { start: rtt, dur: rtt, kind: "req" },
    { start: 2 * rtt, dur: tx, kind: "tx" },
  ];
  t = 2 * rtt + tx;
  if (mode === "p-nopipe") {
    for (let i = 0; i < M; i++) {
      segs.push({ start: t, dur: rtt, kind: "req" }, { start: t + rtt, dur: tx, kind: "tx" });
      t += rtt + tx;
    }
  } else {
    segs.push({ start: t, dur: rtt, kind: "req" }, { start: t + rtt, dur: M * tx, kind: "tx" });
    t += rtt + M * tx;
  }
  return { rows: [{ label: "one conn", segs }], total: t };
}

function formula(mode: Mode, M: number, N: number): string {
  switch (mode) {
    case "np-serial":
      return `(M + 1) × (2·RTT + t) = ${M + 1} × (2·RTT + t)`;
    case "np-parallel":
      return `2·RTT + t + ⌈M/N⌉ × 2·RTT + M·t = 2·RTT + t + ${Math.ceil(M / N)} × 2·RTT + ${M}·t`;
    case "p-nopipe":
      return `2·RTT + t + M × (RTT + t) = 2·RTT + t + ${M} × (RTT + t)`;
    case "p-pipe":
      return `2·RTT + t + RTT + M·t = 3·RTT + ${M + 1}·t`;
  }
}

const COLOR: Record<Kind, string> = { hs: P.amber, req: P.blue, tx: P.green };

export function HttpTimingLab() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const { rows, total } = schedule(v.mode, v.rtt, v.M, v.tx, v.N);
  const worst = schedule("np-serial", v.rtt, v.M, v.tx, v.N).total;

  const W = 640;
  const labelW = 58;
  const rowH = 15;
  const top = 8;
  const plotW = W - labelW - 12;
  const H = top + rows.length * rowH + 38;
  const x = (ms: number) => labelW + (ms / Math.max(worst, 1)) * plotW;

  return (
    <Lab
      title="HTTP response time: count the RTTs"
      subtitle="One base HTML file that references M objects. Pick a connection strategy and watch the timeline. The axis is fixed to non-persistent serial, so faster strategies visibly shrink."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <div className="full">
            <SegmentRow
              label="Connection strategy"
              value={v.mode}
              onChange={(m) => set("mode", m)}
              options={[
                { value: "np-serial", label: "Non-persistent" },
                { value: "np-parallel", label: "Non-persistent, N parallel" },
                { value: "p-nopipe", label: "Persistent" },
                { value: "p-pipe", label: "Persistent + pipelining" },
              ]}
            />
          </div>
          <SliderRow label="RTT" value={v.rtt} min={10} max={300} step={10} onChange={(x) => set("rtt", x)} format={(x) => `${x} ms`} />
          <SliderRow label="Referenced objects M" value={v.M} min={1} max={12} onChange={(x) => set("M", x)} />
          <SliderRow label="Transmission time per object t" value={v.tx} min={0} max={100} step={5} onChange={(x) => set("tx", x)} format={(x) => `${x} ms`} />
          <SliderRow label="Parallel connections N" value={v.N} min={2} max={10} onChange={(x) => set("N", x)} />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Page load time" value={`${total} ms`} tone="blue" note={`${(total / v.rtt).toFixed(1)} RTTs`} />
        <Stat label="vs non-persistent serial" value={total === worst ? "baseline" : `${(worst / total).toFixed(1)}× faster`} tone={total === worst ? "default" : "green"} note={`baseline ${worst} ms`} />
        <Stat label="TCP connections opened" value={String(rows.length)} tone={rows.length > 1 ? "amber" : "green"} note={rows.length > 1 ? "each costs a handshake RTT and kernel buffers" : "one handshake, reused"} />
      </div>
      <p className="text-label-12-mono mt-3 text-gray-800">{formula(v.mode, v.M, v.N)}</p>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label="Timeline of TCP connections">
        {rows.map((r, i) => {
          const y = top + i * rowH;
          return (
            <g key={i}>
              <text x={labelW - 6} y={y + rowH / 2 + 3} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {r.label}
              </text>
              <line x1={labelW} x2={W - 12} y1={y + rowH / 2} y2={y + rowH / 2} stroke={P.line} />
              {r.segs
                .filter((s) => s.dur > 0)
                .map((s, k) => (
                  <rect key={k} x={x(s.start)} y={y + 2} width={Math.max(x(s.start + s.dur) - x(s.start) - 0.5, 1)} height={rowH - 4} rx={2} fill={COLOR[s.kind]} opacity={0.9} />
                ))}
            </g>
          );
        })}
        {(() => {
          const y = top + rows.length * rowH + 6;
          return (
            <g>
              <line x1={labelW} x2={W - 12} y1={y} y2={y} stroke={P.lineStrong} />
              <text x={labelW} y={y + 14} fill={P.muted} fontSize={9} fontFamily={P.mono}>
                0
              </text>
              <line x1={x(total)} x2={x(total)} y1={top} y2={y + 4} stroke={P.blueSoft} strokeDasharray="3 3" />
              <text x={Math.min(x(total), W - 12)} y={y + 14} textAnchor={x(total) > W - 80 ? "end" : "middle"} fill={P.blueSoft} fontSize={10} fontFamily={P.mono}>
                {total} ms
              </text>
              <g transform={`translate(${labelW}, ${y + 28})`}>
                {(
                  [
                    ["hs", "TCP handshake (1 RTT)"],
                    ["req", "HTTP request → first bytes back (1 RTT)"],
                    ["tx", "transmission"],
                  ] as [Kind, string][]
                ).map(([k, l], i) => (
                  <g key={k} transform={`translate(${[0, 150, 400][i]}, 0)`}>
                    <rect x={0} y={-8} width={10} height={8} rx={1} fill={COLOR[k]} />
                    <text x={14} y={-1} fill={P.text} fontSize={9} fontFamily={P.mono}>
                      {l}
                    </text>
                  </g>
                ))}
              </g>
            </g>
          );
        })()}
      </svg>
      <p className="text-copy-13 mt-1 text-gray-600">
        Parallel connections overlap their handshakes but still share one access link, so their green bars queue one after another. Pipelining is the only
        strategy where the per-object RTT disappears entirely.
      </p>
    </Lab>
  );
}

"use client";

import { Lab, Presets, SliderRow, Stat, fmtRate, fmtTime, useExplorationState } from "@/components/learning/Controls";

const defaults = { Rs: 1000, Rcore: 100, k: 10, Rc: 50, F: 100 }; // Mbps, k flows sharing core, F in MB
type S = typeof defaults;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "Access is bottleneck", values: { Rs: 1000, Rcore: 10000, k: 10, Rc: 50 } },
  { label: "Shared core bites", values: { Rs: 1000, Rcore: 100, k: 40, Rc: 1000 } },
  { label: "Server is slow", values: { Rs: 20, Rcore: 10000, k: 5, Rc: 1000 } },
];

export function ThroughputLab() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const share = v.Rcore / v.k;
  const links = [
    { name: "Server access Rs", rate: v.Rs },
    { name: `Core link ÷ ${v.k} flows`, rate: share },
    { name: "Client access Rc", rate: v.Rc },
  ];
  const min = Math.min(...links.map((l) => l.rate));
  const bottleneck = links.find((l) => l.rate === min)!;
  const seconds = (v.F * 8e6) / (min * 1e6);
  const maxRate = Math.max(...links.map((l) => l.rate));

  return (
    <Lab
      title="End-to-end throughput"
      subtitle="Three links in series. Throughput is the minimum. Everything else is wasted capacity."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <SliderRow label="Server access link Rs" value={v.Rs} min={10} max={10000} step={10} onChange={(x) => set("Rs", x)} format={(x) => fmtRate(x * 1e6)} />
          <SliderRow label="Core link rate" value={v.Rcore} min={10} max={10000} step={10} onChange={(x) => set("Rcore", x)} format={(x) => fmtRate(x * 1e6)} />
          <SliderRow label="Flows sharing the core link" value={v.k} min={1} max={100} onChange={(x) => set("k", x)} />
          <SliderRow label="Client access link Rc" value={v.Rc} min={1} max={10000} step={1} onChange={(x) => set("Rc", x)} format={(x) => fmtRate(x * 1e6)} />
          <SliderRow label="File size F (MB)" value={v.F} min={1} max={5000} onChange={(x) => set("F", x)} format={(x) => `${x} MB`} />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Throughput = min(Rs, Rcore/k, Rc)" value={fmtRate(min * 1e6)} tone="blue" note={`bottleneck: ${bottleneck.name}`} />
        <Stat label={`Time to move ${v.F} MB`} value={fmtTime(seconds)} note={`${v.F} × 8 Mbit ÷ ${fmtRate(min * 1e6)}`} />
      </div>
      <div className="mt-4 space-y-2">
        {links.map((l) => {
          const isMin = l.rate === min;
          return (
            <div key={l.name} className="flex items-center gap-3">
              <span className="text-label-12 w-40 shrink-0 text-gray-800">{l.name}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-sm bg-gray-300">
                <div
                  className={`h-full ${isMin ? "bg-red-700" : "bg-gray-600"}`}
                  style={{ width: `${Math.max((l.rate / maxRate) * 100, 1)}%`, transition: "width 120ms ease-out" }}
                />
              </div>
              <span className={`text-label-12-mono w-20 text-right ${isMin ? "text-red-600" : "text-gray-900"}`}>{fmtRate(l.rate * 1e6)}</span>
            </div>
          );
        })}
      </div>
      <p className="text-copy-13 mt-3 text-gray-600">
        Bar length is capacity available to your flow. The red one is the pipe everything squeezes through. Note the core is usually huge, but it is shared: divide before you compare.
      </p>
    </Lab>
  );
}

"use client";

import { Lab, SegmentRow, SliderRow, Stat, fmtRate, useExplorationState } from "@/components/learning/Controls";

type Tech = "cable" | "dsl" | "pon";
const defaults = { tech: "cable" as Tech, N: 8, active: 3 };

const TECH: Record<Tech, { name: string; medium: string; shared: boolean; rate: number; note: string; upstream: string }> = {
  cable: { name: "Cable (HFC)", medium: "coax from the neighbourhood node", shared: true, rate: 1000, note: "Every home on the segment hears every downstream frame. Active neighbours split the channel.", upstream: "CMTS at the cable head end" },
  dsl: { name: "DSL", medium: "your own copper phone line", shared: false, rate: 50, note: "The line to the DSLAM is yours alone, but it is slow and gets slower with distance from the central office.", upstream: "DSLAM at the telco central office" },
  pon: { name: "Fiber (PON)", medium: "one fiber split optically to ~32 homes", shared: true, rate: 2500, note: "One OLT port feeds a passive splitter. Downstream is broadcast; each ONT keeps only its own frames.", upstream: "OLT at the central office" },
};

export function SharedMediumLab() {
  const { values: v, set, reset } = useExplorationState(defaults);
  const t = TECH[v.tech];
  const active = Math.min(v.active, v.N);
  const perUser = t.shared ? t.rate / Math.max(active, 1) : t.rate;

  return (
    <Lab
      title="Does your neighbour slow you down?"
      subtitle="Same question, three access technologies. The answer depends on whether the last mile is shared."
      onReset={reset}
      controls={
        <>
          <SegmentRow
            label="Access technology"
            value={v.tech}
            options={[
              { value: "cable", label: "Cable" },
              { value: "dsl", label: "DSL" },
              { value: "pon", label: "PON" },
            ]}
            onChange={(x) => set("tech", x)}
          />
          <SliderRow label="Homes on the segment" value={v.N} min={1} max={32} onChange={(x) => set("N", x)} />
          <SliderRow label="Homes streaming right now" value={v.active} min={1} max={32} onChange={(x) => set("active", x)} />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <Stat label={`${t.name} downstream capacity`} value={fmtRate(t.rate * 1e6)} note={t.medium} />
        <Stat
          label="Your share while others stream"
          value={fmtRate(perUser * 1e6)}
          tone={t.shared && active > 1 ? "amber" : "green"}
          note={t.shared ? `${fmtRate(t.rate * 1e6)} ÷ ${active} active` : "dedicated line: neighbours do not matter here"}
        />
      </div>
      <div className="mt-4 grid grid-cols-8 gap-1.5">
        {Array.from({ length: v.N }, (_, i) => {
          const isActive = i < active;
          const h = t.shared ? (isActive ? Math.max(perUser / t.rate, 0.06) : 0.06) : isActive ? 1 : 0.06;
          return (
            <div key={i} className="flex h-16 flex-col justify-end rounded-sm bg-gray-300" title={isActive ? "streaming" : "idle"}>
              <div className={`w-full rounded-sm ${isActive ? "bg-blue-700" : "bg-gray-500"}`} style={{ height: `${h * 100}%`, transition: "height 120ms ease-out" }} />
            </div>
          );
        })}
      </div>
      <p className="text-copy-13 mt-3 text-gray-600">
        {t.note} Upstream of the {t.upstream}, everyone shares the ISP backbone regardless of technology, so the last mile is only the first place contention can appear.
      </p>
    </Lab>
  );
}

"use client";

import { useMemo } from "react";
import { Lab, Presets, SegmentRow, SliderRow, Stat, ToggleRow, useExplorationState } from "@/components/learning/Controls";
import { P } from "@/components/learning/Figure";

type Medium = "utp" | "coax" | "fibre";
const defaults = { medium: "utp" as Medium, d: 1, distort: 3, noise: 2, amp: false, rep: false };
type S = typeof defaults;

/** Schematic loss per km at the signal's frequency. Order of magnitude is right; exact values depend on cable grade and frequency. */
const ALPHA: Record<Medium, number> = { utp: 12, coax: 5, fibre: 0.3 };
const BITS = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1];
const SPB = 24; // samples per bit
const N = BITS.length * SPB;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "Short UTP run", values: { medium: "utp", d: 0.5, distort: 2, noise: 2, amp: false, rep: false } },
  { label: "UTP too long", values: { medium: "utp", d: 1.8, distort: 4, noise: 4, amp: false, rep: false } },
  { label: "Just amplify it", values: { medium: "utp", d: 1.8, distort: 4, noise: 4, amp: true, rep: false } },
  { label: "Add a repeater", values: { medium: "utp", d: 1.8, distort: 4, noise: 4, amp: true, rep: true } },
  { label: "Fibre, 10 km", values: { medium: "fibre", d: 10, distort: 2, noise: 4, amp: false, rep: false } },
];

function gaussians(seed: number, n: number): number[] {
  let a = seed >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: n }, () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd()));
}

const NOISE_A = gaussians(7, N);
const NOISE_B = gaussians(11, N);

/** One hop of cable: attenuate, smear (delay distortion), add noise, then decide each bit at the receiver. */
function hop(bits: number[], medium: Medium, km: number, distort: number, sigma: number, noise: number[]) {
  const A = Math.pow(10, (-ALPHA[medium] * km) / 20);
  const k = 1 / (1 + distort * Math.min(km, 10) * 0.9);
  const wave: number[] = [];
  let y = bits[0] ? 1 : -1;
  for (let i = 0; i < N; i++) {
    const x = bits[Math.floor(i / SPB)] ? 1 : -1;
    y += k * (x - y);
    wave.push(A * y + sigma * noise[i]);
  }
  const decoded = bits.map((_, b) => (wave[b * SPB + Math.floor(SPB * 0.8)] >= 0 ? 1 : 0));
  return { wave, decoded, A };
}

export function ImpairmentLab() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const sigma = v.noise * 0.03;

  const res = useMemo(() => {
    if (!v.rep) return { ...hop(BITS, v.medium, v.d, v.distort, sigma, NOISE_A), hops: 1 };
    const first = hop(BITS, v.medium, v.d / 2, v.distort, sigma, NOISE_A);
    const second = hop(first.decoded, v.medium, v.d / 2, v.distort, sigma, NOISE_B);
    return { ...second, hops: 2 };
  }, [v.medium, v.d, v.distort, sigma, v.rep]);

  const lossDb = ALPHA[v.medium] * (v.rep ? v.d / 2 : v.d);
  const errors = res.decoded.filter((b, i) => b !== BITS[i]).length;
  const snrDb = sigma > 0 ? 10 * Math.log10((res.A * res.A) / (sigma * sigma)) : Infinity;
  const gain = v.amp ? 1 / res.A : 1;

  const W = 640;
  const panelH = 92;
  const H = panelH * 2 + 34;
  const x = (i: number) => 20 + (i / N) * (W - 40);
  const yScale = 32;
  const path = (vals: number[], mid: number) => vals.map((val, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${(mid - Math.max(-1.35, Math.min(1.35, val)) * yScale).toFixed(1)}`).join(" ");
  const tx = BITS.flatMap((b) => Array(SPB).fill(b ? 1 : -1));
  const midTx = 50;
  const midRx = panelH + 72;

  return (
    <Lab
      title="Attenuation, distortion, noise"
      subtitle="Send 12 bits down a cable and watch what arrives. The receiver samples each bit (dots) and decides 1 or 0."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <SegmentRow
            label="Medium"
            value={v.medium}
            options={[
              { value: "utp", label: "UTP" },
              { value: "coax", label: "Coax" },
              { value: "fibre", label: "Fibre" },
            ]}
            onChange={(x) => set("medium", x)}
          />
          <SliderRow label="Distance" value={v.d} min={0} max={10} step={0.1} onChange={(x) => set("d", x)} format={(x) => `${x.toFixed(1)} km`} />
          <SliderRow label="Delay distortion (per km)" value={v.distort} min={0} max={10} onChange={(x) => set("distort", x)} />
          <SliderRow label="Noise picked up" value={v.noise} min={0} max={10} onChange={(x) => set("noise", x)} />
          <ToggleRow label="Amplify at the receiver" value={v.amp} onChange={(x) => set("amp", x)} />
          <ToggleRow label="Regenerating repeater halfway" value={v.rep} onChange={(x) => set("rep", x)} />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={v.rep ? "Loss per hop" : "Attenuation"} value={`${lossDb.toFixed(1)} dB`} note={`${ALPHA[v.medium]} dB/km × ${(v.rep ? v.d / 2 : v.d).toFixed(1)} km`} />
        <Stat label="Power that arrives" value={`${(res.A * res.A * 100).toPrecision(2)}%`} note="10^(−dB/10) of what was sent" />
        <Stat label="SNR at the receiver" value={Number.isFinite(snrDb) ? `${snrDb.toFixed(1)} dB` : "∞"} tone={snrDb > 12 ? "green" : snrDb > 4 ? "amber" : "red"} note="amplifying does not change this" />
        <Stat label="Bit errors" value={`${errors} / ${BITS.length}`} tone={errors === 0 ? "green" : "red"} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label="Transmitted and received waveforms">
        <text x={20} y={12} fill={P.text} fontSize={10} fontFamily={P.mono}>
          sent
        </text>
        <line x1={20} x2={W - 20} y1={midTx} y2={midTx} stroke={P.line} strokeDasharray="2 4" />
        <path d={path(tx, midTx)} fill="none" stroke={P.blueSoft} strokeWidth={1.5} />
        {BITS.map((b, i) => (
          <text key={i} x={x(i * SPB + SPB / 2)} y={midTx + 50} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
            {b}
          </text>
        ))}

        <text x={20} y={panelH + 28} fill={P.text} fontSize={10} fontFamily={P.mono}>
          received{v.amp ? " (after amplifier)" : ""}
          {res.hops === 2 ? " · second hop, after the repeater" : ""} · dashed = decision threshold
        </text>
        <line x1={20} x2={W - 20} y1={midRx} y2={midRx} stroke={P.amber} strokeDasharray="3 3" strokeOpacity={0.6} />
        <path d={path(res.wave.map((w) => w * gain), midRx)} fill="none" stroke={P.textStrong} strokeWidth={1.2} />
        {res.decoded.map((b, i) => {
          const s = i * SPB + Math.floor(SPB * 0.8);
          const ok = b === BITS[i];
          const val = Math.max(-1.35, Math.min(1.35, res.wave[s] * gain));
          return (
            <g key={i}>
              <circle cx={x(s)} cy={midRx - val * yScale} r={3} fill={ok ? P.green : P.red} />
              <text x={x(i * SPB + SPB / 2)} y={H - 4} textAnchor="middle" fill={ok ? P.greenSoft : P.redSoft} fontSize={10} fontFamily={P.mono}>
                {b}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-copy-13 mt-1 text-gray-600">
        Attenuation shrinks the wave, distortion rounds its edges until bits bleed into each other, and noise is added on top. An amplifier scales signal
        and noise together, so the picture gets bigger but the errors stay. A repeater decides the bits halfway and sends a clean new signal, so each
        hop starts fresh.
      </p>
    </Lab>
  );
}

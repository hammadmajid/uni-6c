"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";

/**
 * Exploration state mirrored into the URL (?k=v) with history.replaceState,
 * so a configuration can be shared without re-rendering through the router.
 */
export function useExplorationState<T extends Record<string, number | boolean | string>>(defaults: T) {
  const [values, setValues] = useState<T>(defaults);
  const [loaded, setLoaded] = useState(false);

  // Read the shared configuration from the URL once, after mount.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const next = { ...defaults };
    let touched = false;
    for (const k of Object.keys(defaults)) {
      const raw = sp.get(k);
      if (raw === null) continue;
      touched = true;
      const d = defaults[k];
      (next as Record<string, unknown>)[k] = typeof d === "number" ? Number(raw) : typeof d === "boolean" ? raw === "true" : raw;
    }
    if (touched) setValues(next);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirror state into the URL outside of render, so Next's router patch is not triggered mid-update.
  useEffect(() => {
    if (!loaded) return;
    const sp = new URLSearchParams(window.location.search);
    for (const key of Object.keys(values)) {
      if (values[key] === defaults[key]) sp.delete(key);
      else sp.set(key, String(values[key]));
    }
    const q = sp.toString();
    const next = q ? `?${q}` : window.location.pathname;
    if (window.location.search !== (q ? `?${q}` : "")) window.history.replaceState(null, "", next);
  }, [values, loaded, defaults]);

  const set = useCallback(<K extends keyof T>(k: K, v: T[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
  }, []);

  const reset = useCallback(() => setValues(defaults), [defaults]);

  const apply = useCallback(
    (patch: Partial<T>) => {
      for (const [k, v] of Object.entries(patch)) set(k as keyof T, v as T[keyof T]);
    },
    [set],
  );

  return { values, set, reset, apply };
}

export function Lab({
  title,
  subtitle,
  onReset,
  controls,
  children,
}: {
  title: string;
  subtitle?: string;
  onReset?: () => void;
  controls: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-400 bg-background-200">
      <div className="flex items-center justify-between border-b border-gray-400 px-4 py-3">
        <div>
          <p className="text-label-14 text-gray-1000">
            <span className="text-gray-600">Lab · </span>
            {title}
          </p>
          {subtitle && <p className="text-copy-13 mt-0.5 text-gray-700">{subtitle}</p>}
        </div>
        {onReset && (
          <button onClick={onReset} aria-label="Reset" className="rounded-md p-1.5 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-1000">
            <RotateCcw size={14} />
          </button>
        )}
      </div>
      <div className="border-b border-gray-400 p-4 [&>*]:mb-3 [&>*:last-child]:mb-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3 sm:[&>*]:mb-0 [&>.presets]:col-span-2 [&>.full]:col-span-2">{controls}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const id = `s-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-label-12 text-gray-800">
          {label}
        </label>
        <span className="text-label-12-mono text-gray-1000">{format ? format(value) : value}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-1.5 w-full" />
    </div>
  );
}

export function SegmentRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-label-12 text-gray-800">{label}</p>
      <div className="flex overflow-hidden rounded-md border border-gray-500">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`text-label-12 flex-1 px-2 py-1.5 transition-colors ${
              o.value === value ? "bg-gray-1000 text-black" : "text-gray-800 hover:bg-gray-100 hover:text-gray-1000"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-label-12 text-gray-800">{label}</span>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-blue-700" : "bg-gray-500"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export function Presets<T extends object>({ presets, onPick }: { presets: { label: string; values: Partial<T> }[]; onPick: (v: Partial<T>) => void }) {
  return (
    <div className="presets flex flex-wrap gap-1.5">
      <span className="text-label-12 self-center text-gray-600">Try:</span>
      {presets.map((p) => (
        <button
          key={p.label}
          onClick={() => onPick(p.values)}
          className="text-label-12 rounded-full border border-gray-500 px-2.5 py-0.5 text-gray-800 transition-colors hover:border-gray-700 hover:text-gray-1000"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, tone = "default", note }: { label: string; value: string; tone?: "default" | "blue" | "green" | "red" | "amber"; note?: string }) {
  const c = { default: "text-gray-1000", blue: "text-blue-600", green: "text-green-600", red: "text-red-600", amber: "text-amber-600" }[tone];
  return (
    <div className="rounded-md border border-gray-400 bg-background-100 px-3 py-2.5">
      <p className="text-label-12 text-gray-700">{label}</p>
      <p className={`mt-0.5 font-mono text-[15px] ${c}`}>{value}</p>
      {note && <p className="text-copy-13 mt-0.5 text-gray-600">{note}</p>}
    </div>
  );
}

export function fmtTime(seconds: number): string {
  if (seconds === 0) return "0";
  const abs = Math.abs(seconds);
  if (abs >= 1) return `${seconds.toFixed(abs >= 10 ? 1 : 2)} s`;
  if (abs >= 1e-3) return `${(seconds * 1e3).toFixed(abs >= 1e-2 ? 1 : 2)} ms`;
  if (abs >= 1e-6) return `${(seconds * 1e6).toFixed(1)} µs`;
  return `${(seconds * 1e9).toFixed(0)} ns`;
}

export function fmtRate(bps: number): string {
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(bps % 1e9 === 0 ? 0 : 1)} Gbps`;
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(bps % 1e6 === 0 ? 0 : 1)} Mbps`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)} kbps`;
  return `${bps} bps`;
}

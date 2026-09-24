"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, StepForward, FastForward } from "lucide-react";
import { Lab, Presets, SliderRow, Stat, ToggleRow, useExplorationState } from "@/components/learning/Controls";
import { P } from "@/components/learning/Figure";

type Sq = "A" | "B";
type Action = "Suck" | "Right" | "Left" | "NoOp";

interface Lane {
  loc: Sq;
  dirt: Record<Sq, boolean>;
  /** Model-based memory: when each square was last seen clean. */
  seenClean: Record<Sq, number | null>;
  score: number;
  moves: number;
  log: string[];
}

const defaults = { dirtA: true, dirtB: true, rate: 0, recheck: 21, penalty: false, seed: 1 };
type S = typeof defaults;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "Slides: both dirty", values: { dirtA: true, dirtB: true, rate: 0, recheck: 21, penalty: false } },
  { label: "Moves cost a point", values: { dirtA: true, dirtB: true, rate: 0, recheck: 21, penalty: true } },
  { label: "Dirt returns, moves free", values: { dirtA: true, dirtB: true, rate: 10, recheck: 21, penalty: false } },
  { label: "Dirt returns, moves cost", values: { dirtA: true, dirtB: true, rate: 10, recheck: 6, penalty: true } },
];

const NEVER = 21;
const TICK_MS = 500;

/** Deterministic "weather": both lanes see the same dirt reappear at the same step. */
function rnd(seed: number, t: number, s: Sq): number {
  let h = (seed * 374761393 + t * 668265263 + (s === "A" ? 1 : 2) * 2246822519) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

function fresh(v: S): Lane {
  return { loc: "A", dirt: { A: v.dirtA, B: v.dirtB }, seenClean: { A: null, B: null }, score: 0, moves: 0, log: [] };
}

const other = (s: Sq): Sq => (s === "A" ? "B" : "A");

function reflex(loc: Sq, dirty: boolean): Action {
  if (dirty) return "Suck";
  return loc === "A" ? "Right" : "Left";
}

function modelBased(lane: Lane, dirty: boolean, t: number, recheck: number): Action {
  if (dirty) return "Suck";
  const o = other(lane.loc);
  const seen = lane.seenClean[o];
  const trusted = seen !== null && (recheck >= NEVER || t - seen < recheck);
  if (trusted) return "NoOp";
  return lane.loc === "A" ? "Right" : "Left";
}

function advance(lane: Lane, t: number, v: S, kind: "reflex" | "model"): Lane {
  const dirty = lane.dirt[lane.loc];
  const seenClean = { ...lane.seenClean };
  if (!dirty) seenClean[lane.loc] = t;
  else seenClean[lane.loc] = null;
  const cur = { ...lane, seenClean };
  const a = kind === "reflex" ? reflex(lane.loc, dirty) : modelBased(cur, dirty, t, v.recheck);

  const dirt = { ...lane.dirt };
  let loc = lane.loc;
  let moves = lane.moves;
  if (a === "Suck") {
    dirt[loc] = false;
    seenClean[loc] = t;
  } else if (a === "Right") {
    loc = "B";
    moves++;
  } else if (a === "Left") {
    loc = "A";
    moves++;
  }
  const clean = (dirt.A ? 0 : 1) + (dirt.B ? 0 : 1);
  const moved = a === "Right" || a === "Left";
  const score = lane.score + clean - (v.penalty && moved ? 1 : 0);

  // The world evolves: a clean square may get dirty again.
  (["A", "B"] as Sq[]).forEach((s) => {
    if (!dirt[s] && rnd(v.seed, t, s) < v.rate / 100) dirt[s] = true;
  });

  const entry = `t${String(t).padStart(2, "0")} [${lane.loc}, ${dirty ? "Dirty" : "Clean"}] → ${a}`;
  return { loc, dirt, seenClean, score, moves, log: [entry, ...lane.log].slice(0, 5) };
}

function LaneView({ title, note, lane, tone }: { title: string; note: string; lane: Lane; tone: string }) {
  const W = 640;
  const H = 118;
  const sq = (s: Sq) => (s === "A" ? 16 : 132);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${title}: agent in square ${lane.loc}`}>
      <text x={16} y={14} fill={tone} fontSize={12}>
        {title}
      </text>
      <text x={16} y={28} fill={P.muted} fontSize={9} fontFamily={P.mono}>
        {note}
      </text>
      {(["A", "B"] as Sq[]).map((s) => (
        <g key={s}>
          <rect
            x={sq(s)}
            y={36}
            width={108}
            height={72}
            rx={6}
            fill={lane.dirt[s] ? "rgba(255,178,36,0.10)" : P.panel}
            stroke={lane.dirt[s] ? P.amber : P.lineStrong}
          />
          <text x={sq(s) + 8} y={50} fill={P.muted} fontSize={10} fontFamily={P.mono}>
            {s}
          </text>
          {lane.dirt[s] &&
            [
              [14, 100],
              [26, 94],
              [84, 99],
              [94, 93],
              [72, 101],
            ].map(([dx, dy], i) => <circle key={i} cx={sq(s) + dx} cy={dy} r={3} fill={P.amber} />)}
          {!lane.dirt[s] && (
            <text x={sq(s) + 100} y={50} textAnchor="end" fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
              clean
            </text>
          )}
        </g>
      ))}
      {/* the agent */}
      <g style={{ transition: "transform 300ms ease" }} transform={`translate(${sq(lane.loc) + 54}, 68)`}>
        <circle r={14} fill={P.bg} stroke={tone} strokeWidth={2} />
        <rect x={-8} y={10} width={16} height={4} rx={1} fill={tone} />
      </g>

      {/* log */}
      <text x={262} y={50} fill={P.text} fontSize={10} fontFamily={P.mono}>
        percept → action (newest first)
      </text>
      {lane.log.map((l, i) => (
        <text key={i} x={262} y={66 + i * 11} fill={i === 0 ? P.textStrong : P.muted} fontSize={10} fontFamily={P.mono}>
          {l}
        </text>
      ))}
      <text x={W - 16} y={14} textAnchor="end" fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
        score {lane.score}
      </text>
      <text x={W - 16} y={28} textAnchor="end" fill={P.muted} fontSize={10} fontFamily={P.mono}>
        moves {lane.moves}
      </text>
    </svg>
  );
}

/**
 * Two-square vacuum world (R&N fig. 2.2). A simple reflex agent and a model-based agent run side by side on identical
 * "weather", so the difference in score is only the agent program.
 */
export function VacuumWorld() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const [run, setRun] = useState(() => ({ t: 0, reflex: fresh(defaults), model: fresh(defaults) }));
  const { t } = run;
  const lanes = run;
  const [playing, setPlaying] = useState(false);
  const vRef = useRef(v);
  vRef.current = v;

  // Any change to the world or the agents restarts the run.
  const cfg = `${v.dirtA}${v.dirtB}${v.rate}${v.recheck}${v.penalty}${v.seed}`;
  useEffect(() => {
    setRun({ t: 0, reflex: fresh(vRef.current), model: fresh(vRef.current) });
    setPlaying(false);
  }, [cfg]);

  const stepN = (n: number) => {
    const cur = vRef.current;
    setRun((s) => {
      let r = s.reflex;
      let m = s.model;
      for (let k = 1; k <= n; k++) {
        r = advance(r, s.t + k, cur, "reflex");
        m = advance(m, s.t + k, cur, "model");
      }
      return { t: s.t + n, reflex: r, model: m };
    });
  };

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => stepN(1), TICK_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const restart = () => {
    setRun({ t: 0, reflex: fresh(v), model: fresh(v) });
    setPlaying(false);
  };

  const max = t * 2;
  const pct = (s: number) => (t === 0 ? "—" : `${Math.round((100 * s) / max)}%`);
  const diff = lanes.model.score - lanes.reflex.score;

  const btn = "text-label-12 flex items-center gap-1 rounded-md border border-gray-500 px-2.5 py-1 text-gray-900 hover:text-gray-1000";

  return (
    <Lab
      title="Vacuum world: reflex vs model-based"
      subtitle="Same two squares, same dirt, two agent programs. Performance: +1 per clean square per step, optionally −1 per move."
      onReset={() => {
        reset();
        restart();
      }}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <ToggleRow label="Square A starts dirty" value={v.dirtA} onChange={(x) => set("dirtA", x)} />
          <ToggleRow label="Square B starts dirty" value={v.dirtB} onChange={(x) => set("dirtB", x)} />
          <ToggleRow label="Each move costs 1 point" value={v.penalty} onChange={(x) => set("penalty", x)} />
          <SliderRow label="Chance a clean square gets dirty, per step" value={v.rate} min={0} max={30} onChange={(x) => set("rate", x)} format={(x) => `${x}%`} />
          <SliderRow
            label="Model-based: re-check other square after"
            value={v.recheck}
            min={1}
            max={NEVER}
            onChange={(x) => set("recheck", x)}
            format={(x) => (x >= NEVER ? "never" : `${x} steps`)}
          />
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button className={btn} onClick={() => stepN(1)}>
          <StepForward size={12} /> step
        </button>
        <button className={btn} onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? "pause" : "play"}
        </button>
        <button className={btn} onClick={() => stepN(50)}>
          <FastForward size={12} /> run 50 steps
        </button>
        <button className={btn} onClick={restart}>
          restart
        </button>
        {v.rate > 0 && (
          <button className={btn} onClick={() => set("seed", v.seed + 1)}>
            new weather
          </button>
        )}
        <span className="text-label-12-mono ml-auto text-gray-700">t = {t}</span>
      </div>

      <div className="space-y-2 rounded-md border border-gray-400 bg-background-100 p-2">
        <LaneView title="Simple reflex agent" note="rules only: Dirty → Suck, A → Right, B → Left" lane={lanes.reflex} tone={P.amber} />
        <div className="border-t border-gray-400" />
        <LaneView
          title="Model-based reflex agent"
          note={`remembers when it last saw each square clean${v.recheck >= NEVER ? "" : `, trusts it for ${v.recheck} steps`}`}
          lane={lanes.model}
          tone={P.blueSoft}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Stat label="Reflex: score (of max)" value={`${lanes.reflex.score} (${pct(lanes.reflex.score)})`} tone="amber" note={`${lanes.reflex.moves} moves`} />
        <Stat label="Model-based: score (of max)" value={`${lanes.model.score} (${pct(lanes.model.score)})`} tone="blue" note={`${lanes.model.moves} moves`} />
        <Stat
          label="Difference"
          value={t === 0 ? "—" : diff === 0 ? "tie" : `${diff > 0 ? "+" : ""}${diff} to model-based`}
          tone={diff > 0 ? "green" : diff < 0 ? "red" : "default"}
          note={t === 0 ? "press step or run" : "same world, different program"}
        />
      </div>
    </Lab>
  );
}

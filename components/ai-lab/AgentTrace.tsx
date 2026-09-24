"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Lab, SegmentRow, Stat, ToggleRow, useExplorationState } from "@/components/learning/Controls";
import { P } from "@/components/learning/Figure";

type Sq = "A" | "B";
type Status = "Clean" | "Dirty";
type Belief = Status | "Unknown";
type Action = "Suck" | "Right" | "Left" | "NoOp";
type AgentKind = "reflex" | "goal";

const STEPS = 8;

// URL-mirrored config; keys prefixed so they cannot collide with another lab on the page.
type TraceState = { vcAgent: string; vcA: boolean; vcB: boolean; vcStart: string; vcCost: boolean };

const REFLEX_CODE = [
  "def reflex_vacuum_agent(percept):",
  "    location, status = percept",
  '    if status == "Dirty":',
  '        return "Suck"',
  '    elif location == "A":',
  '        return "Right"',
  '    elif location == "B":',
  '        return "Left"',
];

const GOAL_CODE = [
  "def __call__(self, percept):",
  "    location, status = percept",
  "    self.model[location] = status",
  '    if status == "Dirty":',
  '        self.model[location] = "Clean"',
  '        return "Suck"',
  "    if self.goal_reached():",
  '        return "NoOp"',
  '    if location == "A":',
  '        return "Right"',
  '    return "Left"',
];

/** Lines executed for each action, last one is the return. */
const REFLEX_PATH: Record<Action, number[]> = { Suck: [1, 2, 3], Right: [1, 2, 4, 5], Left: [1, 2, 4, 6, 7], NoOp: [] };
const GOAL_PATH: Record<Action, number[]> = { Suck: [1, 2, 3, 4, 5], NoOp: [1, 2, 3, 6, 7], Right: [1, 2, 3, 6, 8, 9], Left: [1, 2, 3, 6, 8, 10] };

interface Row {
  t: number;
  percept: [Sq, Status];
  action: Action;
  model: Record<Sq, Belief>;
  world: Record<Sq, Status>;
  loc: Sq;
  score: number;
}

/** Mirrors run() from the lesson: percept, act, execute, score. Same numbers as the Python. */
function simulate(kind: AgentKind, start: Record<Sq, Status>, loc0: Sq, moveCost: number): Row[] {
  const world = { ...start };
  let loc = loc0;
  const model: Record<Sq, Belief> = { A: "Unknown", B: "Unknown" };
  let score = 0;
  const rows: Row[] = [];
  for (let t = 1; t <= STEPS; t++) {
    const percept: [Sq, Status] = [loc, world[loc]];
    let action: Action;
    if (kind === "reflex") {
      action = percept[1] === "Dirty" ? "Suck" : loc === "A" ? "Right" : "Left";
    } else {
      model[loc] = percept[1];
      if (percept[1] === "Dirty") {
        model[loc] = "Clean";
        action = "Suck";
      } else if (model.A === "Clean" && model.B === "Clean") action = "NoOp";
      else action = loc === "A" ? "Right" : "Left";
    }
    if (action === "Suck") world[loc] = "Clean";
    else if (action === "Right") loc = "B";
    else if (action === "Left") loc = "A";
    score += (world.A === "Clean" ? 1 : 0) + (world.B === "Clean" ? 1 : 0);
    if (action === "Left" || action === "Right") score -= moveCost;
    rows.push({ t, percept, action, model: { ...model }, world: { ...world }, loc, score });
  }
  return rows;
}

const W = 300;
const H = 150;

function World({ world, loc, action }: { world: Record<Sq, Status>; loc: Sq; action: Action | null }) {
  const cells: Sq[] = ["A", "B"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Vacuum world, agent in ${loc}`}>
      {cells.map((c, i) => {
        const x = 16 + i * 138;
        const dirty = world[c] === "Dirty";
        return (
          <g key={c}>
            <rect x={x} y={20} width={130} height={100} rx={6} fill={dirty ? "rgba(255,178,36,0.08)" : P.panel} stroke={dirty ? P.amber : P.lineStrong} />
            <text x={x + 10} y={38} fill={P.text} fontSize={12} fontFamily={P.mono}>
              {c}
            </text>
            <text x={x + 120} y={38} textAnchor="end" fill={dirty ? P.amberSoft : P.greenSoft} fontSize={10} fontFamily={P.mono}>
              {world[c].toLowerCase()}
            </text>
            {dirty &&
              [
                [30, 95],
                [52, 104],
                [44, 86],
                [92, 100],
                [104, 90],
              ].map(([dx, dy], k) => <circle key={k} cx={x + dx} cy={20 + dy - 10} r={3} fill={P.amber} opacity={0.8} />)}
            {loc === c && (
              <g>
                <circle cx={x + 65} cy={72} r={20} fill="rgba(0,112,243,0.18)" stroke={P.blue} strokeWidth={1.5} />
                <text x={x + 65} y={76} textAnchor="middle" fill={P.blueSoft} fontSize={10} fontFamily={P.mono}>
                  agent
                </text>
              </g>
            )}
          </g>
        );
      })}
      <text x={16} y={140} fill={P.muted} fontSize={10} fontFamily={P.mono}>
        {action ? `last action: ${action}` : "t = 0: nothing has happened yet"}
      </text>
    </svg>
  );
}

/**
 * Step through run(world, agent) one tick at a time. Left: the world after the tick. Right: the lines of the
 * agent function that executed, the return in blue. Below: the trace the Python prints.
 */
export function AgentTrace({ defaultAgent = "reflex" }: { defaultAgent?: AgentKind }) {
  const defaults = useMemo<TraceState>(() => ({ vcAgent: defaultAgent, vcA: true, vcB: true, vcStart: "A", vcCost: false }), [defaultAgent]);
  const { values: v, set, reset } = useExplorationState(defaults);
  const [t, setT] = useState(0);
  const kind = (v.vcAgent === "goal" ? "goal" : "reflex") as AgentKind;
  const start: Record<Sq, Status> = { A: v.vcA ? "Dirty" : "Clean", B: v.vcB ? "Dirty" : "Clean" };
  const loc0 = (v.vcStart === "B" ? "B" : "A") as Sq;
  const rows = simulate(kind, start, loc0, v.vcCost ? 1 : 0);
  const cur = t > 0 ? rows[t - 1] : null;
  const code = kind === "reflex" ? REFLEX_CODE : GOAL_CODE;
  const path = cur ? (kind === "reflex" ? REFLEX_PATH : GOAL_PATH)[cur.action] : [];
  const ret = path[path.length - 1];
  const moves = rows.slice(0, t).filter((r) => r.action === "Left" || r.action === "Right").length;

  function change(fn: () => void) {
    fn();
    setT(0);
  }

  return (
    <Lab
      title="Run the agent one tick at a time"
      subtitle="Each tick: percept from the sensors, action from the agent function, execute, score."
      onReset={() => {
        reset();
        setT(0);
      }}
      controls={
        <>
          <SegmentRow
            label="Agent"
            value={kind}
            options={[
              { value: "reflex", label: "simple reflex" },
              { value: "goal", label: "goal-based" },
            ]}
            onChange={(x) => change(() => set("vcAgent", x))}
          />
          <SegmentRow
            label="Starts in"
            value={loc0}
            options={[
              { value: "A", label: "A" },
              { value: "B", label: "B" },
            ]}
            onChange={(x) => change(() => set("vcStart", x))}
          />
          <ToggleRow label="A starts dirty" value={v.vcA} onChange={(x) => change(() => set("vcA", x))} />
          <ToggleRow label="B starts dirty" value={v.vcB} onChange={(x) => change(() => set("vcB", x))} />
          <div className="full">
            <ToggleRow label="Performance measure charges 1 point per move" value={v.vcCost} onChange={(x) => change(() => set("vcCost", x))} />
          </div>
        </>
      }
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => setT(Math.max(0, t - 1))}
          disabled={t === 0}
          aria-label="Previous tick"
          className="rounded-md border border-gray-500 p-1.5 text-gray-800 hover:text-gray-1000 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => setT(Math.min(STEPS, t + 1))}
          disabled={t === STEPS}
          className="text-label-12 flex items-center gap-1 rounded-md border border-gray-500 px-2.5 py-1.5 text-gray-1000 hover:bg-gray-100 disabled:opacity-30"
        >
          tick <ChevronRight size={14} />
        </button>
        <span className="text-label-12-mono text-gray-700">
          t = {t} / {STEPS}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-gray-400 bg-background-100 p-2">
          <World world={cur ? cur.world : start} loc={cur ? cur.loc : loc0} action={cur?.action ?? null} />
        </div>
        <pre className="!my-0 overflow-x-auto rounded-md border border-gray-400 bg-background-100 !p-2 font-mono text-[11px] leading-[1.55]">
          {code.map((line, i) => {
            const hit = path.includes(i);
            const isRet = i === ret;
            return (
              <div key={i} className={`whitespace-pre px-1 ${isRet ? "bg-blue-700/25 text-blue-600" : hit ? "bg-gray-100 text-gray-1000" : "text-gray-700"}`}>
                {line}
              </div>
            );
          })}
        </pre>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="score so far" value={cur ? String(cur.score) : "0"} tone="blue" />
        <Stat label="moves so far" value={String(moves)} tone={moves > 2 ? "amber" : "default"} />
        <Stat label="world all clean?" value={(cur ? cur.world : start).A === "Clean" && (cur ? cur.world : start).B === "Clean" ? "yes" : "no"} tone={(cur ? cur.world : start).A === "Clean" && (cur ? cur.world : start).B === "Clean" ? "green" : "default"} />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="!my-0 w-full font-mono text-[12px]">
          <thead>
            <tr className="text-left text-gray-700">
              <th className="py-1 pr-3 font-normal normal-case tracking-normal">t</th>
              <th className="py-1 pr-3 font-normal normal-case tracking-normal">percept</th>
              <th className="py-1 pr-3 font-normal normal-case tracking-normal">action</th>
              {kind === "goal" && <th className="py-1 pr-3 font-normal normal-case tracking-normal">model after</th>}
              <th className="py-1 font-normal normal-case tracking-normal">score</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, t).map((r) => (
              <tr key={r.t} className={r.t === t ? "text-gray-1000" : "text-gray-800"}>
                <td className="py-0.5 pr-3">{r.t}</td>
                <td className="py-0.5 pr-3">
                  (&apos;{r.percept[0]}&apos;, &apos;{r.percept[1]}&apos;)
                </td>
                <td className={`py-0.5 pr-3 ${r.action === "NoOp" ? "text-green-600" : r.action === "Suck" ? "text-amber-600" : ""}`}>{r.action}</td>
                {kind === "goal" && (
                  <td className="py-0.5 pr-3">
                    A:{r.model.A[0]} B:{r.model.B[0]}
                  </td>
                )}
                <td className="py-0.5">{r.score}</td>
              </tr>
            ))}
            {t === 0 && (
              <tr>
                <td colSpan={5} className="py-1 text-gray-600">
                  press tick
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {kind === "goal" && <p className="text-copy-13 mt-2 text-gray-600">Model letters: C = believes clean, D = dirty, U = unknown (never seen).</p>}
    </Lab>
  );
}

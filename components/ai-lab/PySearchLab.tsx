"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { Lab, SegmentRow, Stat, ToggleRow, useExplorationState } from "@/components/learning/Controls";
import { Figure, P } from "@/components/learning/Figure";
import { GRAPHS, STRATEGIES, pathCost, type SearchGraph, type SearchStep } from "./search";

const W = 640;
const R = 15;

/** Draws a search graph; colours come from a step if one is given. Shared by the lab and the static figure. */
function GraphSvg({ g, step, start, goal }: { g: SearchGraph; step?: SearchStep; start: string; goal: string }) {
  const explored = new Set(step?.explored ?? []);
  const frontier = new Set(step?.frontier ?? []);
  const path = step?.path ?? [];
  const onPath = (a: string, b: string) => path.some((n, i) => i > 0 && ((path[i - 1] === a && n === b) || (path[i - 1] === b && n === a)));
  const treeEdge = (a: string, b: string) => step && (step.parent[b] === a || step.parent[a] === b) && (explored.has(a) || explored.has(b));

  return (
    <svg viewBox={`0 0 ${W} ${g.height}`} className="h-auto w-full" role="img" aria-label={`${g.label} search graph`}>
      {g.edges.map(([a, b, c]) => {
        const p = g.nodes[a];
        const q = g.nodes[b];
        const hot = onPath(a, b);
        const tree = !hot && treeEdge(a, b);
        return (
          <g key={`${a}-${b}`}>
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={hot ? P.blue : tree ? P.muted : P.line} strokeWidth={hot ? 3 : 1.5} />
            {g.showCosts && (
              <text x={(p.x + q.x) / 2 + 4} y={(p.y + q.y) / 2 - 4} fill={hot ? P.blueSoft : P.muted} fontSize={9} fontFamily={P.mono}>
                {c}
              </text>
            )}
          </g>
        );
      })}
      {Object.entries(g.nodes).map(([id, n]) => {
        const isCur = step?.current === id;
        const inPath = path.includes(id);
        const isExp = explored.has(id);
        const isFr = frontier.has(id);
        const fill = inPath ? "rgba(0,112,243,0.25)" : isExp ? "rgba(70,167,88,0.18)" : isFr ? "rgba(255,178,36,0.15)" : P.panel;
        const stroke = inPath ? P.blue : isExp ? P.green : isFr ? P.amber : P.lineStrong;
        const labelBelow = n.name && n.y < g.height - 30;
        return (
          <g key={id}>
            {isCur && <circle cx={n.x} cy={n.y} r={R + 5} fill="none" stroke={P.blue} strokeWidth={2} />}
            <circle cx={n.x} cy={n.y} r={R} fill={P.bg} />
            <circle cx={n.x} cy={n.y} r={R} fill={fill} stroke={stroke} strokeWidth={1.5} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
              {id}
            </text>
            {(id === start || id === goal) && (
              <text x={n.x} y={n.y - R - 6} textAnchor="middle" fill={id === goal ? P.greenSoft : P.blueSoft} fontSize={9} fontFamily={P.mono}>
                {id === start ? "start" : "goal"}
              </text>
            )}
            {n.name &&
              (n.label === "left" ? (
                <text x={n.x - R - 4} y={n.y + 4} textAnchor="end" fill={P.text} fontSize={9}>
                  {n.name}
                </text>
              ) : n.label === "above" ? (
                <text x={n.x} y={n.y - R - 5} textAnchor="middle" fill={P.text} fontSize={9}>
                  {n.name}
                </text>
              ) : (
                <text x={n.x + R + 4} y={labelBelow ? n.y + R + 2 : n.y + 4} fill={P.text} fontSize={9}>
                  {n.name}
                </text>
              ))}
          </g>
        );
      })}
    </svg>
  );
}

function NodeSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-label-12 text-gray-800">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="text-label-12-mono rounded-md border border-gray-500 bg-background-100 px-2 py-1 text-gray-1000">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

type LabState = { sgGraph: string; sgStrat: string; sgStart: string; sgGoal: string; sgEarly: boolean };

/**
 * Step through BFS or DFS on a graph. Frontier chips read left to right in the order they will come out.
 * New strategies (greedy, A*) appear automatically once they are added to STRATEGIES in search.ts.
 */
export function PySearchLab({ graph = "lab", strategy = "bfs" }: { graph?: string; strategy?: string }) {
  const defaults = useMemo<LabState>(() => {
    const g = GRAPHS[graph] ?? GRAPHS.lab;
    return { sgGraph: g.id, sgStrat: strategy, sgStart: g.start, sgGoal: g.goal, sgEarly: false };
  }, [graph, strategy]);
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const [i, setI] = useState(0);

  const g = GRAPHS[v.sgGraph] ?? GRAPHS.lab;
  const ids = Object.keys(g.nodes).sort();
  const start = ids.includes(v.sgStart) ? v.sgStart : g.start;
  const goal = ids.includes(v.sgGoal) ? v.sgGoal : g.goal;
  const strat = STRATEGIES[v.sgStrat] ?? STRATEGIES.bfs;
  const steps = strat.run(g, start, goal, { earlyGoalTest: v.sgEarly });
  const idx = Math.min(i, steps.length - 1);
  const step = steps[idx];
  const done = idx === steps.length - 1;

  function change(fn: () => void) {
    fn();
    setI(0);
  }

  return (
    <Lab
      title="Graph search, one frontier operation at a time"
      subtitle="Amber = on the frontier, green = expanded, blue ring = being expanded now, blue path = the answer."
      onReset={() => {
        reset();
        setI(0);
      }}
      controls={
        <>
          <SegmentRow
            label="Graph"
            value={g.id}
            options={Object.values(GRAPHS)
              .filter((x) => !x.hidden)
              .map((x) => ({ value: x.id, label: x.label }))}
            onChange={(x) => change(() => apply({ sgGraph: x, sgStart: GRAPHS[x].start, sgGoal: GRAPHS[x].goal }))}
          />
          <SegmentRow label="Strategy" value={strat.id} options={Object.values(STRATEGIES).map((s) => ({ value: s.id, label: s.label }))} onChange={(x) => change(() => set("sgStrat", x))} />
          <NodeSelect label="Start" value={start} options={ids} onChange={(x) => change(() => set("sgStart", x))} />
          <NodeSelect label="Goal" value={goal} options={ids} onChange={(x) => change(() => set("sgGoal", x))} />
          {strat.id === "bfs" && (
            <div className="full">
              <ToggleRow label="Goal test when a node is generated, not when it is expanded (AIMA 4e BFS)" value={v.sgEarly} onChange={(x) => change(() => set("sgEarly", x))} />
            </div>
          )}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setI(Math.max(0, idx - 1))} disabled={idx === 0} aria-label="Previous step" className="rounded-md border border-gray-500 p-1.5 text-gray-800 hover:text-gray-1000 disabled:opacity-30">
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => setI(idx + 1)} disabled={done} className="text-label-12 flex items-center gap-1 rounded-md border border-gray-500 px-2.5 py-1.5 text-gray-1000 hover:bg-gray-100 disabled:opacity-30">
          step <ChevronRight size={14} />
        </button>
        <button onClick={() => setI(steps.length - 1)} disabled={done} className="text-label-12 flex items-center gap-1 rounded-md border border-gray-500 px-2.5 py-1.5 text-gray-1000 hover:bg-gray-100 disabled:opacity-30">
          to the end <ChevronsRight size={14} />
        </button>
        <span className="text-label-12-mono text-gray-700">
          step {idx} / {steps.length - 1}
        </span>
      </div>

      <div className="mt-3 rounded-md border border-gray-400 bg-background-100 p-2">
        <GraphSvg g={g} step={step} start={start} goal={goal} />
      </div>

      <p className={`mt-3 font-mono text-[12px] ${step.path ? "text-blue-600" : step.failed ? "text-red-600" : "text-gray-1000"}`}>{step.note}</p>

      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-label-12 w-full text-gray-700 sm:w-40">{strat.frontierName}, next out first</span>
          {step.frontier.length === 0 && <span className="text-label-12-mono text-gray-600">empty</span>}
          {step.frontier.map((n, k) => (
            <span key={`${n}-${k}`} className={`rounded border px-2 py-0.5 font-mono text-[12px] ${k === 0 ? "border-amber-700 bg-amber-700/15 text-amber-600" : "border-gray-500 text-gray-900"}`}>
              {n}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-label-12 w-full text-gray-700 sm:w-40">expanded, in order</span>
          {step.explored.length === 0 && <span className="text-label-12-mono text-gray-600">none yet</span>}
          {step.explored.map((n, k) => (
            <span key={`${n}-${k}`} className="rounded border border-green-700/50 px-2 py-0.5 font-mono text-[12px] text-green-600">
              {n}
            </span>
          ))}
        </div>
      </div>

      {step.path && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="path returned" value={step.path.join(" → ")} tone="blue" note={`${step.path.length - 1} edge${step.path.length === 2 ? "" : "s"}`} />
          <Stat label={g.showCosts ? "path cost (km)" : "nodes expanded"} value={g.showCosts ? String(pathCost(g, step.path)) : String(step.explored.length)} note={g.showCosts ? "BFS and DFS ignore these numbers" : undefined} />
        </div>
      )}
    </Lab>
  );
}

/** Static drawing of a graph for questions: no colours, start and goal marked. */
export function SearchGraphFigure({ graph = "quiz", title, caption }: { graph?: string; title?: string; caption?: string }) {
  const g = GRAPHS[graph] ?? GRAPHS.quiz;
  return (
    <Figure title={title ?? g.label} caption={caption}>
      <GraphSvg g={g} start={g.start} goal={g.goal} />
    </Figure>
  );
}

"use client";

import { useState } from "react";
import { Figure, P } from "@/components/learning/Figure";

/** The six task-environment dimensions from lecture 3 (R&N ch. 2.3), one row each.
 * `pos` is 0 = left pole, 1 = right pole, 0.5 = in between / "semi". */
type Axis = { key: string; left: string; right: string };

const AXES: Axis[] = [
  { key: "obs", left: "Fully observable", right: "Partially observable" },
  { key: "det", left: "Deterministic", right: "Stochastic" },
  { key: "epi", left: "Episodic", right: "Sequential" },
  { key: "sta", left: "Static", right: "Dynamic" },
  { key: "dis", left: "Discrete", right: "Continuous" },
  { key: "kno", left: "Known", right: "Unknown" },
];

type Scenario = {
  label: string;
  pos: Record<string, number>;
  why: Record<string, string>;
};

const SCENARIOS: Scenario[] = [
  {
    label: "Chess (with a clock)",
    pos: { obs: 0, det: 0, epi: 1, sta: 0.5, dis: 0, kno: 0 },
    why: {
      obs: "the whole board is on the table",
      det: "a move has one fixed result (the opponent is strategic, not random)",
      epi: "each move changes every move that can follow — NOT episodic",
      sta: "the position waits, but the clock ticks: semi-dynamic",
      dis: "finite squares, pieces and moves",
      kno: "the rules are given up front",
    },
  },
  {
    label: "Poker / card game",
    pos: { obs: 1, det: 1, epi: 1, sta: 0, dis: 0, kno: 0 },
    why: {
      obs: "you cannot see the opponent's hand or the deck",
      det: "the shuffle and the next card are random",
      epi: "this hand's bets shape the whole game",
      sta: "the table waits while you decide",
      dis: "finite cards, chips and bets",
      kno: "the rules of the game are known",
    },
  },
  {
    label: "Automated taxi",
    pos: { obs: 1, det: 1, epi: 1, sta: 1, dis: 1, kno: 0 },
    why: {
      obs: "sensors miss what is around the corner or behind a truck",
      det: "traffic, weather and other drivers are unpredictable",
      epi: "where you are now depends on every turn you took",
      sta: "the world keeps moving while you decide",
      dis: "speed, steering angle and position are continuous",
      kno: "physics and traffic rules are known — it is the STATE that is hidden, not the rules",
    },
  },
  {
    label: "Part-picking robot",
    pos: { obs: 1, det: 1, epi: 0, sta: 1, dis: 1, kno: 0 },
    why: {
      obs: "the camera sees only the part in front of it now",
      det: "parts arrive in random orientations",
      epi: "each part is judged on its own — this is the textbook episodic case",
      sta: "the conveyor belt moves the parts along",
      dis: "positions and joint angles are continuous",
      kno: "the task and the parts are known in advance",
    },
  },
  {
    label: "Crossword solver",
    pos: { obs: 0, det: 0, epi: 1, sta: 0, dis: 0, kno: 0 },
    why: {
      obs: "the whole grid and all clues are visible",
      det: "a letter you write stays written",
      epi: "each answer constrains the letters left for the rest",
      sta: "the puzzle never changes on its own",
      dis: "finite squares and letters",
      kno: "the rules are fixed and known",
    },
  },
];

const W = 640;
const ROW = 46;
const TOP = 12;
const TRACK_X0 = 168;
const TRACK_X1 = 470;

export function EnvironmentTypes({ initial = 0 }: { initial?: number }) {
  const [s, setS] = useState(initial);
  const sc = SCENARIOS[s];
  const H = TOP + AXES.length * ROW + 8;

  const controls = (
    <div className="flex flex-wrap gap-1">
      {SCENARIOS.map((o, i) => (
        <button
          key={o.label}
          onClick={() => setS(i)}
          className={`text-label-12 rounded-md border px-2 py-1 transition-colors ${i === s ? "border-gray-1000 bg-gray-1000 text-black" : "border-gray-500 text-gray-800 hover:text-gray-1000"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <Figure
      title="Where does this environment sit on each axis?"
      controls={controls}
      caption="Six independent dials, not one. The blue dot is where this task lands on each; the note under each track is why. Notice the taxi is partially observable yet its rules are perfectly known — observability and known/unknown are different questions."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Task-environment classification of ${sc.label}`}>
        {AXES.map((ax, i) => {
          const y = TOP + i * ROW + 14;
          const pos = sc.pos[ax.key];
          const cx = TRACK_X0 + pos * (TRACK_X1 - TRACK_X0);
          const semi = pos === 0.5;
          return (
            <g key={ax.key}>
              {/* left pole label */}
              <text x={TRACK_X0 - 8} y={y + 3} textAnchor="end" fill={pos < 0.5 ? P.textStrong : P.muted} fontSize={11}>
                {ax.left}
              </text>
              {/* right pole label */}
              <text x={TRACK_X1 + 8} y={y + 3} textAnchor="start" fill={pos > 0.5 ? P.textStrong : P.muted} fontSize={11}>
                {ax.right}
              </text>
              {/* track */}
              <line x1={TRACK_X0} y1={y} x2={TRACK_X1} y2={y} stroke={P.lineStrong} strokeWidth={1.5} />
              <circle cx={TRACK_X0} cy={y} r={2.5} fill={P.line} />
              <circle cx={TRACK_X1} cy={y} r={2.5} fill={P.line} />
              {/* marker */}
              <circle cx={cx} cy={y} r={6} fill={semi ? P.amber : P.blue} stroke={P.bg} strokeWidth={1.5} />
              {/* reason */}
              <text x={TRACK_X0} y={y + 18} fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {sc.why[ax.key]}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

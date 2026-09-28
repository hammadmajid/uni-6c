"use client";

import { useState } from "react";
import { P } from "@/components/learning/Figure";
import { Lab, SegmentRow, ToggleRow } from "@/components/learning/Controls";

type Ratio = "1:1" | "1:N" | "M:N";
type PairId = "passport" | "teaches" | "enrolls";

interface Pair {
  id: PairId;
  left: string;
  right: string;
  rel: string;
  verb: string; // left → right
  passive: string; // right → left
  lp: string; // instance label prefix, left
  rp: string;
  real: { ratio: Ratio; leftTotal: boolean; rightTotal: boolean; why: string };
}

const PAIRS: Pair[] = [
  {
    id: "passport",
    left: "PERSON",
    right: "PASSPORT",
    rel: "HOLDS",
    verb: "holds",
    passive: "is held by",
    lp: "p",
    rp: "pp",
    real: {
      ratio: "1:1",
      leftTotal: false,
      rightTotal: true,
      why: "One valid passport per person, and a passport always belongs to someone. Plenty of people have no passport, so PERSON is partial.",
    },
  },
  {
    id: "teaches",
    left: "TEACHER",
    right: "SECTION",
    rel: "TEACHES",
    verb: "teaches",
    passive: "is taught by",
    lp: "t",
    rp: "s",
    real: {
      ratio: "1:N",
      leftTotal: false,
      rightTotal: true,
      why: "A teacher takes several sections; a section has one teacher. A teacher on leave teaches none (partial), but a section cannot run without one (total).",
    },
  },
  {
    id: "enrolls",
    left: "STUDENT",
    right: "COURSE",
    rel: "ENROLLS_IN",
    verb: "enrolls in",
    passive: "is taken by",
    lp: "st",
    rp: "c",
    real: {
      ratio: "M:N",
      leftTotal: true,
      rightTotal: false,
      why: "Many students per course and many courses per student. Every current student takes at least one course (total); an elective nobody picked this term has no students (partial).",
    },
  },
];

/** Instance-level edges that obey the chosen ratio and participation. Left has 4 entities; right grows as needed. */
function buildInstances(ratio: Ratio, leftTotal: boolean, rightTotal: boolean) {
  const edges: [number, number][] = [];
  let right = 0;
  if (ratio === "1:1") {
    for (let i = 0; i < 3; i++) edges.push([i, right++]);
    if (leftTotal) edges.push([3, right++]);
  } else if (ratio === "1:N") {
    // left 0 → three rights, left 1 → one, left 2 → two
    [3, 1, 2].forEach((n, i) => {
      for (let k = 0; k < n; k++) edges.push([i, right++]);
    });
    if (leftTotal) edges.push([3, right++]);
  } else {
    right = 4;
    edges.push([0, 0], [0, 1], [1, 1], [1, 2], [2, 0], [2, 3]);
    if (leftTotal) edges.push([3, 2]);
  }
  const unmatchedRight = rightTotal ? -1 : right++;
  return { edges, leftCount: 4, rightCount: right, unmatchedRight };
}

function phrase(min: number, many: boolean) {
  if (!many) return min === 1 ? "exactly one" : "at most one";
  return min === 1 ? "one or more" : "zero or more";
}

const W = 640;

export function ErCardinalityExplorer() {
  const [pairId, setPairId] = useState<PairId>("teaches");
  const pair = PAIRS.find((p) => p.id === pairId)!;
  const [ratio, setRatio] = useState<Ratio>(pair.real.ratio);
  const [leftTotal, setLeftTotal] = useState(pair.real.leftTotal);
  const [rightTotal, setRightTotal] = useState(pair.real.rightTotal);

  function pickPair(id: PairId) {
    const p = PAIRS.find((x) => x.id === id)!;
    setPairId(id);
    setRatio(p.real.ratio);
    setLeftTotal(p.real.leftTotal);
    setRightTotal(p.real.rightTotal);
  }

  const leftLabel = ratio === "M:N" ? "M" : "1";
  const rightLabel = ratio === "1:1" ? "1" : "N";
  const leftMany = ratio !== "1:1"; // how many rights one left can relate to
  const rightMany = ratio === "M:N"; // how many lefts one right can relate to
  const inst = buildInstances(ratio, leftTotal, rightTotal);
  const matches =
    ratio === pair.real.ratio && leftTotal === pair.real.leftTotal && rightTotal === pair.real.rightTotal;

  // Chen diagram geometry
  const ey = 28;
  const eh = 44;
  const lx = 40;
  const rx = 460;
  const ew = 140;
  const dcx = W / 2;
  const dcy = ey + eh / 2;
  const dw = 150;
  const dh = 56;

  function connector(x1: number, x2: number, total: boolean, key: string) {
    if (!total) return <line key={key} x1={x1} y1={dcy} x2={x2} y2={dcy} stroke={P.textStrong} strokeWidth={1.4} />;
    return (
      <g key={key}>
        <line x1={x1} y1={dcy - 3} x2={x2} y2={dcy - 3} stroke={P.blue} strokeWidth={1.4} />
        <line x1={x1} y1={dcy + 3} x2={x2} y2={dcy + 3} stroke={P.blue} strokeWidth={1.4} />
      </g>
    );
  }

  // Instance geometry
  const iy = 150;
  const gap = 24;
  const maxDots = Math.max(inst.leftCount, inst.rightCount);
  const setH = maxDots * gap + 24;
  const H = iy + setH + 30;
  const lcx = 190;
  const rcx = 450;
  const dotY = (i: number, n: number) => iy + setH / 2 - ((n - 1) * gap) / 2 + i * gap;
  const leftMatched = new Set(inst.edges.map((e) => e[0]));
  const rightMatched = new Set(inst.edges.map((e) => e[1]));

  return (
    <Lab
      title="Cardinality ratio and participation"
      subtitle="The Chen labels on top, and a set of real instances below that obeys them."
      onReset={() => pickPair(pairId)}
      controls={
        <>
          <div className="full">
            <SegmentRow<PairId>
              label="Relationship"
              value={pairId}
              options={PAIRS.map((p) => ({ value: p.id, label: `${p.left} · ${p.right}` }))}
              onChange={pickPair}
            />
          </div>
          <SegmentRow<Ratio>
            label="Cardinality ratio"
            value={ratio}
            options={[
              { value: "1:1", label: "1:1" },
              { value: "1:N", label: "1:N" },
              { value: "M:N", label: "M:N" },
            ]}
            onChange={setRatio}
          />
          <div className="space-y-2">
            <ToggleRow label={`${pair.left} total (double line)`} value={leftTotal} onChange={setLeftTotal} />
            <ToggleRow label={`${pair.right} total (double line)`} value={rightTotal} onChange={setRightTotal} />
          </div>
          <div className="presets flex flex-wrap gap-1.5">
            <button
              onClick={() => pickPair(pairId)}
              className="text-label-12 rounded-full border border-gray-500 px-2.5 py-0.5 text-gray-800 transition-colors hover:border-gray-700 hover:text-gray-1000"
            >
              Back to the real-world rule
            </button>
          </div>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${pair.left} ${pair.rel} ${pair.right}, ${ratio}`}>
        {/* Chen diagram */}
        <text x={16} y={16} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          schema (Chen)
        </text>
        {connector(lx + ew, dcx - dw / 2, leftTotal, "cl")}
        {connector(dcx + dw / 2, rx, rightTotal, "cr")}
        <rect x={lx} y={ey} width={ew} height={eh} fill={P.panel} stroke={P.textStrong} />
        <text x={lx + ew / 2} y={dcy + 4} textAnchor="middle" fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
          {pair.left}
        </text>
        <rect x={rx} y={ey} width={ew} height={eh} fill={P.panel} stroke={P.textStrong} />
        <text x={rx + ew / 2} y={dcy + 4} textAnchor="middle" fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
          {pair.right}
        </text>
        <polygon
          points={`${dcx - dw / 2},${dcy} ${dcx},${dcy - dh / 2} ${dcx + dw / 2},${dcy} ${dcx},${dcy + dh / 2}`}
          fill={P.panel}
          stroke={P.textStrong}
        />
        <text x={dcx} y={dcy + 4} textAnchor="middle" fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
          {pair.rel}
        </text>
        <text x={lx + ew + 12} y={dcy - 9} fill={P.amber} fontSize={13} fontFamily={P.mono} fontWeight={600}>
          {leftLabel}
        </text>
        <text x={rx - 12} y={dcy - 9} textAnchor="end" fill={P.amber} fontSize={13} fontFamily={P.mono} fontWeight={600}>
          {rightLabel}
        </text>

        {/* Instances */}
        <text x={16} y={iy - 12} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          one possible state (instances)
        </text>
        <ellipse cx={lcx} cy={iy + setH / 2} rx={70} ry={setH / 2} fill="none" stroke={P.lineStrong} />
        <ellipse cx={rcx} cy={iy + setH / 2} rx={70} ry={setH / 2} fill="none" stroke={P.lineStrong} />
        <text x={lcx} y={iy + setH + 18} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
          {pair.left} set
        </text>
        <text x={rcx} y={iy + setH + 18} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
          {pair.right} set
        </text>
        {inst.edges.map(([a, b], i) => (
          <line
            key={i}
            x1={lcx + 14}
            y1={dotY(a, inst.leftCount)}
            x2={rcx - 14}
            y2={dotY(b, inst.rightCount)}
            stroke={P.blueSoft}
            strokeWidth={1.3}
            opacity={0.85}
          />
        ))}
        {Array.from({ length: inst.leftCount }, (_, i) => {
          const y = dotY(i, inst.leftCount);
          const alone = !leftMatched.has(i);
          return (
            <g key={`l${i}`}>
              <circle cx={lcx + 14} cy={y} r={4.5} fill={alone ? P.amber : P.textStrong} />
              <text x={lcx + 2} y={y + 4} textAnchor="end" fill={alone ? P.amberSoft : P.text} fontSize={10} fontFamily={P.mono}>
                {pair.lp}
                {i + 1}
              </text>
            </g>
          );
        })}
        {Array.from({ length: inst.rightCount }, (_, i) => {
          const y = dotY(i, inst.rightCount);
          const alone = !rightMatched.has(i);
          return (
            <g key={`r${i}`}>
              <circle cx={rcx - 14} cy={y} r={4.5} fill={alone ? P.amber : P.textStrong} />
              <text x={rcx - 2} y={y + 4} fill={alone ? P.amberSoft : P.text} fontSize={10} fontFamily={P.mono}>
                {pair.rp}
                {i + 1}
              </text>
            </g>
          );
        })}
        <text x={W - 16} y={iy - 12} textAnchor="end" fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
          amber = takes part in no {pair.rel}
        </text>
      </svg>

      <div className="text-copy-14 mt-3 space-y-1 text-gray-900">
        <p>
          Each <span className="font-mono text-gray-1000">{pair.left}</span> {pair.verb}{" "}
          <span className="text-blue-600">{phrase(leftTotal ? 1 : 0, leftMany)}</span> <span className="font-mono text-gray-1000">{pair.right}</span>
          {leftMany ? "s" : ""}.
        </p>
        <p>
          Each <span className="font-mono text-gray-1000">{pair.right}</span> {pair.passive}{" "}
          <span className="text-blue-600">{phrase(rightTotal ? 1 : 0, rightMany)}</span> <span className="font-mono text-gray-1000">{pair.left}</span>
          {rightMany ? "s" : ""}.
        </p>
        <p className="text-label-12-mono text-gray-600">
          (min,max) notation: {pair.left} ({leftTotal ? 1 : 0},{leftMany ? "N" : 1}) · {pair.right} ({rightTotal ? 1 : 0},{rightMany ? "N" : 1})
        </p>
        <p className={`text-copy-13 ${matches ? "text-green-600" : "text-gray-700"}`}>
          {matches ? "This is the real-world rule. " : "Real-world rule: "}
          {!matches && `${pair.real.ratio}, ${pair.left} ${pair.real.leftTotal ? "total" : "partial"}, ${pair.right} ${pair.real.rightTotal ? "total" : "partial"}. `}
          {pair.real.why}
        </p>
      </div>
    </Lab>
  );
}

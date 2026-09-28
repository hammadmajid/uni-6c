"use client";

import { useState } from "react";
import { Figure, P } from "@/components/learning/Figure";
import { SegmentRow } from "@/components/learning/Controls";

type Who = "dba" | "casual" | "prog" | "param";

interface Node {
  x: number;
  y: number;
  label: string;
  w?: number;
  kind?: "user" | "store" | "core";
}

/** Node centres. Top half: user-side tools. Bottom half: DBMS internals. After Elmasri Fig. 2.3 (lecture 2, slide 21). */
const N: Record<string, Node> = {
  uDba: { x: 100, y: 22, label: "DBA staff", kind: "user" },
  uCas: { x: 280, y: 22, label: "Casual users", kind: "user" },
  uProg: { x: 412, y: 22, label: "App programmers", kind: "user" },
  uPar: { x: 568, y: 22, label: "Parametric users", kind: "user" },

  ddl: { x: 52, y: 70, label: "DDL statements", w: 92 },
  priv: { x: 150, y: 70, label: "Privileged cmds", w: 96 },
  iq: { x: 280, y: 70, label: "Interactive query" },
  ap: { x: 412, y: 70, label: "Application program" },

  ddlc: { x: 52, y: 128, label: "DDL compiler", w: 92 },
  qc: { x: 280, y: 128, label: "Query compiler" },
  pre: { x: 412, y: 128, label: "Precompiler" },
  host: { x: 548, y: 128, label: "Host lang. compiler", w: 118 },

  qo: { x: 280, y: 186, label: "Query optimizer" },
  dmlc: { x: 412, y: 186, label: "DML compiler" },
  ct: { x: 568, y: 186, label: "Compiled transactions", w: 132 },

  cat: { x: 64, y: 290, label: "System catalog", w: 110, kind: "store" },
  rdp: { x: 250, y: 272, label: "Runtime DB processor", w: 144, kind: "core" },
  ccr: { x: 250, y: 330, label: "Concurrency · backup · recovery", w: 196, kind: "core" },
  sdm: { x: 540, y: 272, label: "Stored data manager", w: 132, kind: "core" },
  sdb: { x: 540, y: 342, label: "Stored database", w: 120, kind: "store" },
};

const H_BOX = 26;
const wOf = (n: Node) => n.w ?? 112;

/** Edges: [from, to, users whose path it is]. */
const E: [string, string, Who[]][] = [
  ["uDba", "ddl", ["dba"]],
  ["uDba", "priv", ["dba"]],
  ["ddl", "ddlc", ["dba"]],
  ["ddlc", "cat", ["dba"]],
  ["priv", "rdp", ["dba"]],
  ["uCas", "iq", ["casual"]],
  ["iq", "qc", ["casual"]],
  ["qc", "qo", ["casual"]],
  ["qo", "rdp", ["casual"]],
  ["uProg", "ap", ["prog"]],
  ["ap", "pre", ["prog"]],
  ["pre", "dmlc", ["prog"]],
  ["pre", "host", ["prog"]],
  ["dmlc", "ct", ["prog"]],
  ["host", "ct", ["prog"]],
  ["uPar", "ct", ["param"]],
  ["ct", "rdp", ["prog", "param"]],
  ["rdp", "sdm", ["dba", "casual", "prog", "param"]],
  ["sdm", "sdb", ["dba", "casual", "prog", "param"]],
  ["rdp", "ccr", ["dba", "casual", "prog", "param"]],
];

/** Dashed catalog reads (metadata lookups), shown for everyone. */
const CATALOG_READS = ["qc", "qo", "dmlc", "rdp"];

/** The point where the segment from→to crosses the border of to's box, so lines and arrowheads meet the edge. */
function clip(from: Node, to: Node): [number, number] {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const hw = wOf(to) / 2 + 2;
  const hh = H_BOX / 2 + 2;
  const s = Math.min(dx === 0 ? Infinity : hw / Math.abs(dx), dy === 0 ? Infinity : hh / Math.abs(dy));
  return [to.x + dx * s, to.y + dy * s];
}

const NOTES: Record<Who | "all", string> = {
  all: "Top half: the tools each kind of user works through. Bottom half: the DBMS internals that execute everything against the stored data. Dashed lines are catalog look-ups.",
  dba: "The DBA defines and changes the schema with DDL, which the DDL compiler turns into catalog entries, and runs privileged commands (grants, tuning) straight against the runtime processor.",
  casual: "A casual user's ad-hoc query is parsed by the query compiler, then the query optimizer picks the cheapest execution plan, using statistics in the catalog, before it runs.",
  prog: "The precompiler pulls the DML out of a host-language program: DML goes to the DML compiler, the rest to the host-language compiler, and the two are linked into a canned transaction.",
  param: "Parametric (naive) users only run compiled canned transactions, supplying parameters such as an account number and an amount. They never see a query.",
};

const W = 640;
const H = 372;

/** Toggle figure: simplified DBMS component modules (Elmasri Fig. 2.3) with one user group's path highlighted. */
export function DbModulesDiagram() {
  const [who, setWho] = useState<Who | "all">("all");
  const on = (users: Who[]) => who === "all" || users.includes(who as Who);
  const hotNodes = new Set<string>();
  E.forEach(([a, b, u]) => {
    if (who !== "all" && u.includes(who)) {
      hotNodes.add(a);
      hotNodes.add(b);
    }
  });

  return (
    <Figure
      title="DBMS component modules, one user at a time"
      caption={NOTES[who]}
      controls={
        <SegmentRow
          label="Follow"
          value={who}
          options={[
            { value: "all", label: "All" },
            { value: "dba", label: "DBA" },
            { value: "casual", label: "Casual" },
            { value: "prog", label: "Programmer" },
            { value: "param", label: "Parametric" },
          ]}
          onChange={setWho}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="DBMS component modules">
        <defs>
          <marker id="mod-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={P.lineStrong} />
          </marker>
          <marker id="mod-arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={P.blueSoft} />
          </marker>
        </defs>

        {/* Halves */}
        <rect x={2} y={44} width={W - 4} height={170} rx={8} fill="none" stroke={P.line} strokeDasharray="3 4" />
        <text x={8} y={208} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          users&apos; tools
        </text>
        <rect x={2} y={232} width={W - 4} height={136} rx={8} fill="rgba(70,167,88,0.04)" stroke={P.line} />
        <text x={8} y={362} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          internals of the DBMS
        </text>

        {/* Catalog reads */}
        {CATALOG_READS.map((k) => {
          const [x1, y1] = clip(N[k], N.cat);
          const [x2, y2] = clip(N.cat, N[k]);
          return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.line} strokeDasharray="3 3" />;
        })}

        {/* Edges */}
        {E.map(([a, b, u]) => {
          const hot = who !== "all" && u.includes(who as Who);
          const [x1, y1] = clip(N[b], N[a]);
          const [x2, y2] = clip(N[a], N[b]);
          return (
            <line
              key={`${a}-${b}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={hot ? P.blueSoft : P.lineStrong}
              strokeWidth={hot ? 1.6 : 1}
              opacity={on(u) ? 1 : 0.25}
              markerEnd={`url(#${hot ? "mod-arrow-hot" : "mod-arrow"})`}
            />
          );
        })}

        {/* Nodes */}
        {Object.entries(N).map(([k, n]) => {
          const w = wOf(n);
          const hot = hotNodes.has(k);
          const dim = who !== "all" && !hot && n.kind !== "core" && n.kind !== "store";
          if (n.kind === "user") {
            return (
              <text key={k} x={n.x} y={n.y} textAnchor="middle" fill={hot ? P.blueSoft : P.textStrong} fontSize={11} opacity={dim ? 0.35 : 1}>
                {n.label}
              </text>
            );
          }
          const stroke = hot ? P.blue : n.kind === "store" || n.kind === "core" ? P.green : P.lineStrong;
          return (
            <g key={k} opacity={dim ? 0.35 : 1}>
              <rect
                x={n.x - w / 2}
                y={n.y - H_BOX / 2}
                width={w}
                height={H_BOX}
                rx={n.kind === "store" ? 12 : 5}
                fill={hot ? "rgba(0,112,243,0.14)" : P.panel}
                stroke={stroke}
              />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fill={P.textStrong} fontSize={9.5} fontFamily={P.mono}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

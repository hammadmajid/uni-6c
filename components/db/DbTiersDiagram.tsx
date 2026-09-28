"use client";

import { useState } from "react";
import { Figure, P } from "@/components/learning/Figure";
import { SegmentRow } from "@/components/learning/Controls";

type Mode = "central" | "two" | "three";

type Layer = "ui" | "app" | "dbms" | "data";

interface Machine {
  name: string;
  sub: string;
  layers: Layer[];
  count?: number;
}

const LAYER: Record<Layer, { label: string; color: string; fill: string }> = {
  ui: { label: "user interface", color: P.blue, fill: "rgba(0,112,243,0.12)" },
  app: { label: "application logic", color: P.amber, fill: "rgba(255,178,36,0.12)" },
  dbms: { label: "DBMS", color: P.green, fill: "rgba(70,167,88,0.12)" },
  data: { label: "stored database", color: P.green, fill: "rgba(70,167,88,0.22)" },
};

const MODES: Record<Mode, { machines: Machine[]; caption: string; links: string[] }> = {
  central: {
    machines: [
      { name: "Terminals", sub: "display only", layers: [], count: 3 },
      { name: "Mainframe", sub: "does everything", layers: ["ui", "app", "dbms", "data"] },
    ],
    links: ["screens and keystrokes"],
    caption: "Centralized: user-interface processing, application programs and the DBMS all run on one machine. Terminals only display.",
  },
  two: {
    machines: [
      { name: "Client PCs", sub: "fat client", layers: ["ui", "app"], count: 3 },
      { name: "DB server", sub: "query server", layers: ["dbms", "data"] },
    ],
    links: ["SQL over ODBC / JDBC"],
    caption: "Two-tier: the client runs the interface and the application programs, and sends SQL straight to the database server through ODBC or JDBC.",
  },
  three: {
    machines: [
      { name: "Clients", sub: "browser", layers: ["ui"], count: 3 },
      { name: "App / web server", sub: "middle tier", layers: ["app"] },
      { name: "DB server", sub: "database services", layers: ["dbms", "data"] },
    ],
    links: ["HTTP", "SQL over JDBC"],
    caption: "Three-tier: a middle tier holds the business rules and is the only thing allowed to talk to the database. Clients cannot reach the DB server directly.",
  },
};

const W = 640;
const H = 250;

/** Toggle figure: centralized, two-tier and three-tier DBMS architectures, showing which machine runs the interface, the application logic and the DBMS. */
export function DbTiersDiagram() {
  const [mode, setMode] = useState<Mode>("three");
  const m = MODES[mode];
  const n = m.machines.length;
  const mw = 150;
  const gap = n === 3 ? (W - 40 - 3 * mw) / 2 : 180;
  const x0 = n === 3 ? 20 : (W - (2 * mw + gap)) / 2;
  const top = 40;

  return (
    <Figure title="Where each layer runs" caption={m.caption}>
      <div className="mb-3 max-w-sm">
        <SegmentRow
          label="Architecture"
          value={mode}
          options={[
            { value: "central", label: "Centralized" },
            { value: "two", label: "Two-tier" },
            { value: "three", label: "Three-tier" },
          ]}
          onChange={setMode}
        />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={m.caption}>
        <defs>
          <marker id="tier-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={P.lineStrong} />
          </marker>
        </defs>

        {m.machines.map((mc, k) => {
          const x = x0 + k * (mw + gap);
          const stack = mc.count ?? 1;
          const h = 44 + Math.max(mc.layers.length, 1) * 30;
          return (
            <g key={mc.name}>
              {/* stacked copies for many clients */}
              {Array.from({ length: stack - 1 }).map((_, s) => (
                <rect key={s} x={x + (stack - 1 - s) * 6} y={top - (stack - 1 - s) * 6} width={mw} height={h} rx={6} fill={P.panel} stroke={P.line} />
              ))}
              <rect x={x} y={top} width={mw} height={h} rx={6} fill={P.panel} stroke={P.lineStrong} />
              <text x={x + 10} y={top + 18} fill={P.textStrong} fontSize={11}>
                {mc.name}
              </text>
              <text x={x + 10} y={top + 32} fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {mc.sub}
              </text>
              {mc.layers.length === 0 && (
                <text x={x + 10} y={top + 60} fill={P.muted} fontSize={10} fontFamily={P.mono}>
                  (no processing)
                </text>
              )}
              {mc.layers.map((l, li) => (
                <g key={l}>
                  <rect x={x + 10} y={top + 42 + li * 30} width={mw - 20} height={24} rx={4} fill={LAYER[l].fill} stroke={LAYER[l].color} />
                  <text x={x + mw / 2} y={top + 58 + li * 30} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
                    {LAYER[l].label}
                  </text>
                </g>
              ))}
            </g>
          );
        })}

        {/* Links between neighbouring machines */}
        {m.links.map((label, k) => {
          const xa = x0 + k * (mw + gap) + mw + 4;
          const xb = x0 + (k + 1) * (mw + gap) - 4;
          const y = top + 70;
          return (
            <g key={label}>
              <line x1={xa} y1={y} x2={xb} y2={y} stroke={P.lineStrong} markerStart="url(#tier-arrow)" markerEnd="url(#tier-arrow)" />
              <text x={(xa + xb) / 2} y={y - 8} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
                {label}
              </text>
            </g>
          );
        })}

        {/* Three-tier: blocked direct path */}
        {mode === "three" && (
          <g>
            <path
              d={`M ${x0 + mw / 2} ${top + 76} V ${H - 26} H ${x0 + 2 * (mw + gap) + mw / 2} V ${top + 106}`}
              fill="none"
              stroke={P.red}
              strokeDasharray="5 4"
            />
            <text x={W / 2} y={H - 32} textAnchor="middle" fill={P.redSoft} fontSize={10} fontFamily={P.mono}>
              ✕ client → DB server directly: not allowed
            </text>
          </g>
        )}
        {mode === "two" && (
          <text x={W / 2} y={H - 22} textAnchor="middle" fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
            every client holds DB credentials and talks to the DBMS itself
          </text>
        )}
        {mode === "central" && (
          <text x={W / 2} y={H - 22} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
            all DBMS functionality, programs and UI processing on one machine
          </text>
        )}
      </svg>
    </Figure>
  );
}

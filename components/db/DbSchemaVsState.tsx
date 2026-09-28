"use client";

import { useState } from "react";
import { Figure, P } from "@/components/learning/Figure";
import { Button } from "@/components/learning/ui";

type Row = { name: string; stdNo: string; level: string; field: string; email?: string };

interface Step {
  op: string;
  sql: string;
  note: string;
  rows: Row[];
  cols: string[];
  /** Which part changed: the state (rows), the schema, or nothing (rejected). */
  changed: "state" | "schema" | "rejected" | "none";
  label: string;
  highlight?: string;
}

const BASE = ["Name", "StdNo", "Level", "Field"];
const SAMAN: Row = { name: "Saman", stdNo: "040342", level: "3", field: "CSE" };
const DINESH: Row = { name: "Dinesh", stdNo: "030231", level: "4", field: "ENT" };
const AYESHA: Row = { name: "Ayesha", stdNo: "050117", level: "1", field: "CSE" };

const STEPS: Step[] = [
  {
    op: "Define the schema",
    sql: "CREATE TABLE student (…)",
    note: "The schema is given to the DBMS. No data yet: this is the empty state.",
    rows: [],
    cols: BASE,
    changed: "schema",
    label: "empty",
  },
  {
    op: "Load initial data",
    sql: "INSERT … Saman, Dinesh",
    note: "The database is populated for the first time: the initial state.",
    rows: [SAMAN, DINESH],
    cols: BASE,
    changed: "state",
    label: "initial",
    highlight: "all",
  },
  {
    op: "Insert a record",
    sql: "INSERT … Ayesha",
    note: "Every insert produces a new database state. The schema is untouched.",
    rows: [SAMAN, DINESH, AYESHA],
    cols: BASE,
    changed: "state",
    label: "S2",
    highlight: "050117",
  },
  {
    op: "Delete a record",
    sql: "DELETE … StdNo = 030231",
    note: "Another new state. Deleting changes the extension, never the intension.",
    rows: [SAMAN, AYESHA],
    cols: BASE,
    changed: "state",
    label: "S3",
  },
  {
    op: "Update a value",
    sql: "UPDATE … Level = 4 WHERE StdNo = 040342",
    note: "Updates change the state too. The current state is whatever the data is right now.",
    rows: [{ ...SAMAN, level: "4" }, AYESHA],
    cols: BASE,
    changed: "state",
    label: "S4",
    highlight: "040342",
  },
  {
    op: "Try an invalid insert",
    sql: "INSERT … StdNo = 050117 (duplicate)",
    note: "StdNo is the key. The DBMS rejects the write, so the state stays valid: it never enters a state that breaks the schema's constraints.",
    rows: [{ ...SAMAN, level: "4" }, AYESHA],
    cols: BASE,
    changed: "rejected",
    label: "S4",
  },
  {
    op: "Requirements change",
    sql: "ALTER TABLE student ADD Email",
    note: "Now the schema itself changes: schema evolution. Rare, and planned. Existing rows get NULL for the new column.",
    rows: [
      { ...SAMAN, level: "4", email: "NULL" },
      { ...AYESHA, email: "NULL" },
    ],
    cols: [...BASE, "Email"],
    changed: "schema",
    label: "S5",
  },
];

const W = 640;
const H = 310;

/** Stepper: one STUDENT schema (the lecture's slide 10 example) and the sequence of database states that operations produce, ending in a schema evolution. */
export function DbSchemaVsState() {
  const [i, setI] = useState(0);
  const s = STEPS[i];
  const schemaHot = s.changed === "schema";
  const stateHot = s.changed === "state";

  const colW = 96;
  const tx = 40;
  const tableW = colW * s.cols.length;
  const vals = (r: Row) => [r.name, r.stdNo, r.level, r.field, ...(s.cols.length > 4 ? [r.email ?? ""] : [])];

  return (
    <Figure
      title="One schema, many states"
      caption={
        <>
          Step through the operations. The <span className="text-blue-600">schema</span> (intension) is the description; each operation produces a new{" "}
          <span className="text-green-600">database state</span> (extension, instance). Only the last step changes the schema.
        </>
      }
      controls={
        <div className="flex items-center gap-2">
          <Button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}>
            Back
          </Button>
          <Button variant="primary" onClick={() => setI((n) => Math.min(STEPS.length - 1, n + 1))} disabled={i === STEPS.length - 1}>
            Next
          </Button>
          <span className="text-label-12-mono text-gray-600">
            {i + 1}/{STEPS.length}
          </span>
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${s.op}: ${s.note}`}>
        {/* Operation */}
        <text x={tx} y={20} fill={P.textStrong} fontSize={12}>
          {i + 1}. {s.op}
        </text>
        <text x={tx} y={38} fill={s.changed === "rejected" ? P.redSoft : P.text} fontSize={10} fontFamily={P.mono}>
          {s.sql}
          {s.changed === "rejected" ? "   → rejected" : ""}
        </text>

        {/* Schema */}
        <text x={tx} y={66} fill={P.blueSoft} fontSize={10} fontFamily={P.mono}>
          schema (intension){schemaHot ? "  ← changed" : ""}
        </text>
        <rect x={tx} y={74} width={62} height={26} fill={schemaHot ? "rgba(0,112,243,0.18)" : "rgba(0,112,243,0.06)"} stroke={P.blue} />
        <text x={tx + 31} y={91} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
          STUDENT
        </text>
        {s.cols.map((c, k) => (
          <g key={c}>
            <rect
              x={tx + 62 + k * 70}
              y={74}
              width={70}
              height={26}
              fill={c === "Email" ? "rgba(0,112,243,0.25)" : "none"}
              stroke={schemaHot ? P.blue : P.lineStrong}
            />
            <text x={tx + 97 + k * 70} y={91} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
              {c}
            </text>
          </g>
        ))}

        {/* State */}
        <text x={tx} y={128} fill={P.greenSoft} fontSize={10} fontFamily={P.mono}>
          database state (extension){stateHot ? "  ← changed" : ""}
        </text>
        {s.cols.map((c, k) => (
          <text key={c} x={tx + 8 + k * colW} y={150} fill={P.muted} fontSize={9} fontFamily={P.mono}>
            {c}
          </text>
        ))}
        <line x1={tx} y1={156} x2={tx + tableW} y2={156} stroke={P.lineStrong} />
        {s.rows.length === 0 && (
          <text x={tx + 8} y={176} fill={P.muted} fontSize={10} fontFamily={P.mono}>
            (no rows: the empty state)
          </text>
        )}
        {s.rows.map((r, ri) => {
          const hot = stateHot && (s.highlight === "all" || s.highlight === r.stdNo);
          return (
            <g key={r.stdNo}>
              {hot && <rect x={tx} y={160 + ri * 24} width={tableW} height={22} fill="rgba(70,167,88,0.14)" />}
              {vals(r).map((v, k) => (
                <text key={k} x={tx + 8 + k * colW} y={175 + ri * 24} fill={v === "NULL" ? P.muted : P.textStrong} fontSize={10} fontFamily={P.mono}>
                  {v}
                </text>
              ))}
            </g>
          );
        })}

        {/* Note */}
        <text x={tx} y={246} fill={P.text} fontSize={10}>
          {s.note.length > 96 ? s.note.slice(0, s.note.lastIndexOf(" ", 96)) : s.note}
        </text>
        {s.note.length > 96 && (
          <text x={tx} y={260} fill={P.text} fontSize={10}>
            {s.note.slice(s.note.lastIndexOf(" ", 96) + 1)}
          </text>
        )}

        {/* Timeline of states */}
        {STEPS.map((st, k) => {
          const x = tx + 14 + k * 82;
          const past = k <= i;
          const color = st.changed === "schema" ? P.blue : st.changed === "rejected" ? P.red : P.green;
          return (
            <g key={k} opacity={past ? 1 : 0.35}>
              {k > 0 && <line x1={x - 74} y1={280} x2={x - 8} y2={280} stroke={P.lineStrong} />}
              <circle cx={x} cy={280} r={k === i ? 7 : 5} fill={k === i ? color : P.panel} stroke={color} />
              <text x={x} y={302} textAnchor="middle" fill={k === i ? P.textStrong : P.muted} fontSize={9} fontFamily={P.mono}>
                {st.changed === "rejected" ? "✕" : st.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

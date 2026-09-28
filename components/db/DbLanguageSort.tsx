"use client";

import { useEffect, useRef, useState } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey } from "@/components/learning/LessonContext";
import { Button, Feedback } from "@/components/learning/ui";

type Lang = "DDL" | "DML";

interface Stmt {
  id: string;
  sql: string;
  lang: Lang;
  why: string;
  trap?: string;
}

const STMTS: Stmt[] = [
  {
    id: "create",
    sql: "CREATE TABLE course (code char(5) PRIMARY KEY, name text, credits int)",
    lang: "DDL",
    why: "Defines a new part of the schema: the textbook's first example of DDL.",
  },
  {
    id: "insert",
    sql: "INSERT INTO student VALUES ('Ayesha', '050117', 1, 'CSE')",
    lang: "DML",
    why: "Adds a row. The schema is unchanged; only the database state changes.",
  },
  {
    id: "alter",
    sql: "ALTER TABLE student ADD COLUMN email text",
    lang: "DDL",
    why: "Changes the schema itself (schema evolution), so it is definition, not manipulation.",
    trap: "ALTER changes the table's structure, not its rows. Anything that changes the schema is DDL.",
  },
  {
    id: "update",
    sql: "UPDATE student SET level = 4 WHERE std_no = '040342'",
    lang: "DML",
    why: "Modifies a value in an existing row: one of the four DML operations (retrieve, insert, delete, modify).",
    trap: "UPDATE changes data, not structure. It is modification, one of the four DML jobs.",
  },
  {
    id: "drop",
    sql: "DROP TABLE prerequisite",
    lang: "DDL",
    why: "Removes a schema construct (the whole table definition, and its data with it).",
    trap: "DROP removes the table's definition from the schema. Removing rows while keeping the table is DELETE, which is DML.",
  },
  {
    id: "delete",
    sql: "DELETE FROM student WHERE std_no = '030231'",
    lang: "DML",
    why: "Removes rows; the table and its definition stay.",
    trap: "DELETE removes rows, the table stays. That is manipulation of the state, so DML.",
  },
  {
    id: "select",
    sql: "SELECT name, grade FROM grade_report JOIN student USING (std_no)",
    lang: "DML",
    why: "Retrieval is DML in Elmasri's sense: DML is used to retrieve, insert, delete and modify.",
    trap: "The lecture's definition of DML starts with “retrieve”. Some vendors call SELECT a separate DQL, but in this course it is DML.",
  },
  {
    id: "view",
    sql: "CREATE VIEW fee_status AS SELECT reg_no, name FROM student",
    lang: "DDL",
    why: "Defines an external schema (a view). Elmasri calls this a view definition language; in SQL it is part of DDL.",
    trap: "It contains a SELECT, but the statement defines a view, which is part of the schema. Defining is DDL.",
  },
];

export function DbLanguageSort({ id = "ddl-dml-sort" }: { id?: string }) {
  const key = useActivityKey(id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const ready = useProgressStore((s) => s.hydrated && s.sync !== "checking");
  const saved = useProgressStore((s) => s.activities[key]);

  const [picked, setPicked] = useState<Record<string, Lang>>({});
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const seeded = useRef(false);

  useEffect(() => {
    if (!ready || seeded.current) return;
    seeded.current = true;
    if (!saved || saved.attempts === 0 || !saved.lastAnswer) return;
    try {
      setPicked(JSON.parse(saved.lastAnswer) as Record<string, Lang>);
      setAttempts(saved.attempts);
      setChecked(true);
    } catch {
      /* ignore */
    }
  }, [ready, saved]);

  const allPicked = STMTS.every((s) => picked[s.id]);
  const wrong = STMTS.filter((s) => picked[s.id] && picked[s.id] !== s.lang);
  const allCorrect = checked && allPicked && wrong.length === 0;

  function choose(sid: string, lang: Lang) {
    if (allCorrect) return;
    setPicked((m) => ({ ...m, [sid]: lang }));
    setChecked(false);
  }
  function check() {
    setChecked(true);
    setAttempts((a) => a + 1);
    recordAttempt(key, allPicked && wrong.length === 0, JSON.stringify(picked));
  }

  return (
    <div className="my-6 rounded-lg border border-gray-400 bg-background-200 p-5">
      <p className="text-label-12 mb-2 text-blue-600">Sort · definition or manipulation?</p>
      <p className="text-copy-16 font-medium text-gray-1000">Mark each statement DDL or DML.</p>
      <p className="text-copy-13 mt-1 text-gray-700">Ask one question: does it change the schema, or the data in it?</p>

      <ul className="mt-4 list-none space-y-2 pl-0">
        {STMTS.map((s) => {
          const p = picked[s.id];
          const verdict = checked && p ? (p === s.lang ? "ok" : "bad") : null;
          return (
            <li
              key={s.id}
              className={`mt-0 flex flex-col gap-2 rounded-md border p-2.5 sm:flex-row sm:items-center ${
                verdict === "ok" ? "border-green-700/60 bg-green-700/10" : verdict === "bad" ? "border-red-700/60 bg-red-700/10" : "border-gray-400"
              }`}
            >
              <code className="text-label-12-mono min-w-0 flex-1 break-words text-gray-1000">{s.sql}</code>
              <div className="flex shrink-0 overflow-hidden rounded-md border border-gray-500">
                {(["DDL", "DML"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => choose(s.id, l)}
                    className={`text-label-12 px-3 py-1 transition-colors ${p === l ? "bg-gray-1000 text-black" : "text-gray-800 hover:bg-gray-100"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      {!allCorrect && (
        <div className="mt-4 flex items-center gap-3">
          <Button variant="primary" onClick={check} disabled={!allPicked}>
            Check
          </Button>
          {!allPicked && <span className="text-label-12 text-gray-600">{STMTS.filter((s) => !picked[s.id]).length} left</span>}
          {attempts > 0 && <span className="text-label-12 text-gray-600">{attempts} {attempts === 1 ? "attempt" : "attempts"}</span>}
        </div>
      )}

      {checked && wrong.length > 0 && (
        <Feedback tone="incorrect" title={`${STMTS.length - wrong.length} of ${STMTS.length} correct.`}>
          <ul className="list-none space-y-1 pl-0">
            {wrong.map((s) => (
              <li key={s.id} className="mt-0">
                <code className="text-gray-1000">{s.sql.split(" ").slice(0, 2).join(" ")}</code>: {s.trap ?? s.why}
              </li>
            ))}
          </ul>
        </Feedback>
      )}

      {allCorrect && (
        <Feedback tone="correct" title={`All ${STMTS.length} correct${attempts > 1 ? ` in ${attempts} attempts` : ""}.`}>
          <ul className="list-none space-y-1 pl-0">
            {STMTS.map((s) => (
              <li key={s.id} className="mt-0">
                <code className="text-gray-1000">{s.sql.split(" ").slice(0, 2).join(" ")}</code> ({s.lang}): {s.why}
              </li>
            ))}
          </ul>
        </Feedback>
      )}
    </div>
  );
}

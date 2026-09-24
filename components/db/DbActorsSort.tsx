"use client";

import { useEffect, useRef, useState } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey } from "@/components/learning/LessonContext";
import { Button, Feedback } from "@/components/learning/ui";

type Role = "DBA" | "Designer" | "Casual" | "Naive" | "Sophisticated" | "Standalone" | "Programmer" | "Behind";

const ROLES: { id: Role; name: string; group: string }[] = [
  { id: "DBA", name: "Database administrator", group: "actor" },
  { id: "Designer", name: "Database designer", group: "actor" },
  { id: "Casual", name: "Casual end user", group: "end user" },
  { id: "Naive", name: "Naive / parametric end user", group: "end user" },
  { id: "Sophisticated", name: "Sophisticated end user", group: "end user" },
  { id: "Standalone", name: "Standalone end user", group: "end user" },
  { id: "Programmer", name: "System analyst / application programmer", group: "actor" },
  { id: "Behind", name: "Worker behind the scene", group: "not an actor" },
];

interface Person {
  id: string;
  who: string;
  role: Role;
  why: string;
  trap?: string;
}

const PEOPLE: Person[] = [
  {
    id: "grant",
    who: "Grants Finance read-only access, schedules the nightly backup, tunes a slow query",
    role: "DBA",
    why: "Authorising access, monitoring use, backup and tuning are the DBA's job list in Elmasri.",
  },
  {
    id: "erd",
    who: "Interviews the registrar, draws the ER diagram, decides which tables and keys exist",
    role: "Designer",
    why: "Designers identify the data to be stored and choose structures, before any data exists.",
    trap: "The DBA runs the database once it exists. Deciding its structure from users' requirements is the designer's job.",
  },
  {
    id: "teller",
    who: "Bank teller who runs the same deposit and withdrawal screens all day",
    role: "Naive",
    why: "Canned transactions, written by someone else, used over and over: the textbook's definition of a parametric user.",
    trap: "A teller never writes a query. Using the same ready-made screens all day makes them a naive (parametric) user.",
  },
  {
    id: "pia",
    who: "Airline reservation agent booking and cancelling seats",
    role: "Naive",
    why: "Reservation agents are Elmasri's own example of naive or parametric users.",
  },
  {
    id: "dean",
    who: "Dean who asks for a different enrollment report once a month through a query tool",
    role: "Casual",
    why: "Occasional access, different information each time: casual. Elmasri says these are typically middle or high-level managers.",
    trap: "Occasional use and a different question every time is the definition of casual, even if the person is senior.",
  },
  {
    id: "analyst",
    who: "Business analyst writing multi-join SQL for a BI dashboard",
    role: "Sophisticated",
    why: "Elmasri lists business analysts with engineers and scientists as sophisticated users. Heads-up: the lecture slide files “a business analyst running a sales report” under casual users.",
    trap: "Elmasri puts business analysts with the sophisticated users; the slide puts them under casual. What decides it is complex queries written by the analyst themselves.",
  },
  {
    id: "ds",
    who: "Data scientist modelling student drop-out from five years of records",
    role: "Sophisticated",
    why: "Knows the DBMS's facilities well and writes complex requests directly.",
  },
  {
    id: "shop",
    who: "Shopkeeper keeping stock in a ready-made accounting package on one laptop",
    role: "Standalone",
    why: "Maintains a personal database with an off-the-shelf package. The lecture slides skip this category; Elmasri has it.",
    trap: "A personal database run through a ready-made package, with nobody else using it, is a standalone user, the category the slides leave out.",
  },
  {
    id: "you",
    who: "You, writing a JDBC servlet that inserts enrollments",
    role: "Programmer",
    why: "Application programmers implement the canned transactions that naive users run.",
  },
  {
    id: "spec",
    who: "Analyst who writes the spec for the screens tellers will use",
    role: "Programmer",
    why: "Elmasri pairs system analysts (who specify canned transactions) with application programmers (who build them).",
    trap: "Specifying the canned transactions is the system analyst's job, grouped with application programmers. The designer designs the database, not the screens.",
  },
  {
    id: "pg",
    who: "Engineer who contributes to the PostgreSQL query planner",
    role: "Behind",
    why: "DBMS system designers and implementers build the DBMS itself. They never touch your university's data.",
    trap: "Building the DBMS software is not using a database. Elmasri calls these workers behind the scene.",
  },
];

export function DbActorsSort({ id = "actors-sort" }: { id?: string }) {
  const key = useActivityKey(id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const ready = useProgressStore((s) => s.hydrated && s.sync !== "checking");
  const saved = useProgressStore((s) => s.activities[key]);

  const [placed, setPlaced] = useState<Record<string, Role>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const seeded = useRef(false);

  useEffect(() => {
    if (!ready || seeded.current) return;
    seeded.current = true;
    if (!saved || saved.attempts === 0 || !saved.lastAnswer) return;
    try {
      setPlaced(JSON.parse(saved.lastAnswer) as Record<string, Role>);
      setAttempts(saved.attempts);
      setChecked(true);
    } catch {
      /* ignore */
    }
  }, [ready, saved]);

  const unplaced = PEOPLE.filter((p) => !placed[p.id]);
  const allPlaced = unplaced.length === 0;
  const wrong = PEOPLE.filter((p) => placed[p.id] && placed[p.id] !== p.role);
  const allCorrect = checked && allPlaced && wrong.length === 0;

  function place(role: Role) {
    if (!picked) return;
    setPlaced((m) => ({ ...m, [picked]: role }));
    setPicked(null);
    setChecked(false);
  }
  function unplace(pid: string) {
    if (allCorrect) return;
    setPlaced((m) => {
      const n = { ...m };
      delete n[pid];
      return n;
    });
    setChecked(false);
  }
  function check() {
    setChecked(true);
    setAttempts((a) => a + 1);
    recordAttempt(key, allPlaced && wrong.length === 0, JSON.stringify(placed));
  }

  const chipCls = (p: Person) => {
    if (checked && placed[p.id]) return placed[p.id] === p.role ? "border-green-700/60 bg-green-700/10 text-green-600" : "border-red-700/60 bg-red-700/10 text-red-600";
    return picked === p.id ? "border-blue-700 bg-blue-700/15 text-blue-600" : "border-gray-500 text-gray-1000 hover:border-gray-700";
  };

  return (
    <div className="my-6 rounded-lg border border-gray-400 bg-background-200 p-5">
      <p className="text-label-12 mb-2 text-blue-600">Sort · who is this, in Elmasri&apos;s terms?</p>
      <p className="text-copy-16 font-medium text-gray-1000">Eleven people touch a database. Put each one in the category the exam expects.</p>
      <p className="text-copy-13 mt-1 text-gray-700">Tap a person, then tap a category. Tap a placed person to send them back.</p>

      <div className="mt-4 rounded-md border border-dashed border-gray-500 p-3">
        <p className="text-label-12 mb-2 text-gray-600">Unsorted · {unplaced.length}</p>
        <div className="flex flex-col gap-1.5">
          {unplaced.map((p) => (
            <button key={p.id} onClick={() => setPicked(picked === p.id ? null : p.id)} className={`text-copy-13 rounded-md border px-2.5 py-1.5 text-left transition-colors ${chipCls(p)}`}>
              {p.who}
            </button>
          ))}
          {unplaced.length === 0 && <span className="text-copy-13 text-gray-600">All placed.</span>}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => place(r.id)}
            disabled={!picked}
            className={`flex min-h-[64px] flex-col justify-start rounded-md border p-3 text-left transition-colors ${picked ? "cursor-pointer border-blue-700/60 hover:bg-blue-700/10" : "border-gray-400"} disabled:cursor-default`}
          >
            <span className="text-label-12 flex w-full items-center gap-2 text-gray-1000">
              {r.name}
              <span className="text-label-12-mono ml-auto text-gray-600">{r.group}</span>
            </span>
            <span className="mt-2 flex flex-col gap-1">
              {PEOPLE.filter((p) => placed[p.id] === r.id).map((p) => (
                <span
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    unplace(p.id);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && unplace(p.id)}
                  className={`text-copy-13 rounded-md border px-2 py-1 ${chipCls(p)}`}
                >
                  {p.who}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>

      {!allCorrect && (
        <div className="mt-4 flex items-center gap-3">
          <Button variant="primary" onClick={check} disabled={!allPlaced}>
            Check
          </Button>
          {!allPlaced && <span className="text-label-12 text-gray-600">{unplaced.length} left to place</span>}
          {attempts > 0 && <span className="text-label-12 text-gray-600">{attempts} {attempts === 1 ? "attempt" : "attempts"}</span>}
        </div>
      )}

      {checked && wrong.length > 0 && (
        <Feedback tone="incorrect" title={`${PEOPLE.length - wrong.length} of ${PEOPLE.length} placed correctly.`}>
          <ul className="list-none space-y-1 pl-0">
            {wrong.map((p) => (
              <li key={p.id} className="mt-0">
                <span className="text-gray-1000">{p.who}:</span> {p.trap ?? p.why}
              </li>
            ))}
          </ul>
        </Feedback>
      )}

      {allCorrect && (
        <Feedback tone="correct" title={`All ${PEOPLE.length} placed${attempts > 1 ? ` in ${attempts} attempts` : ""}.`}>
          <ul className="list-none space-y-1 pl-0">
            {PEOPLE.map((p) => (
              <li key={p.id} className="mt-0">
                <span className="text-gray-1000">{ROLES.find((r) => r.id === p.role)!.name}:</span> {p.why}
              </li>
            ))}
          </ul>
        </Feedback>
      )}
    </div>
  );
}

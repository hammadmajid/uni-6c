"use client";

import { useEffect, useRef, useState } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey } from "@/components/learning/LessonContext";
import { Feedback } from "@/components/learning/ui";

type Col = "reg_no" | "cnic" | "email" | "name" | "section";
const COLS: Col[] = ["reg_no", "cnic", "email", "name", "section"];

/** Attributes the business rules guarantee unique on their own. Any set containing one is a super key. */
const UNIQUE_BY_RULE: Col[] = ["reg_no", "cnic", "email"];
const CANDIDATES = UNIQUE_BY_RULE.map((c) => c);

const RULES: { col: Col | "both"; text: string }[] = [
  { col: "reg_no", text: "The university assigns every student a registration number and never reuses one." },
  { col: "cnic", text: "Every student has a CNIC (or B-form) number, and NADRA never issues the same number twice." },
  { col: "email", text: "Each student gets exactly one university email address, never reassigned." },
  { col: "both", text: "Two students can share a name, even in the same section. A section holds up to 50 students." },
];

const ROWS: Record<Col, string>[] = [
  { reg_no: "2312101", cnic: "61101-4821937-1", email: "2312101@szabist-isb.pk", name: "Ali Khan", section: "BSCS-6C" },
  { reg_no: "2312145", cnic: "37405-1198342-8", email: "2312145@szabist-isb.pk", name: "Sara Ahmed", section: "BSCS-6C" },
  { reg_no: "2312167", cnic: "61101-7730215-5", email: "2312167@szabist-isb.pk", name: "Ali Khan", section: "BSCS-6A" },
  { reg_no: "2312190", cnic: "35202-5561094-2", email: "2312190@szabist-isb.pk", name: "Hina Raza", section: "BSCS-6A" },
  { reg_no: "2312213", cnic: "61101-2248870-3", email: "2312213@szabist-isb.pk", name: "Omar Farooq", section: "BSCS-6C" },
  { reg_no: "2312256", cnic: "42101-9083316-6", email: "2312256@szabist-isb.pk", name: "Sara Ahmed", section: "BSCS-6A" },
];

const isSuper = (set: Col[]) => set.some((c) => UNIQUE_BY_RULE.includes(c));
const setLabel = (set: Col[]) => `⟨${set.join(", ")}⟩`;

function duplicateRows(set: Col[]): Set<number> {
  const seen = new Map<string, number>();
  const dup = new Set<number>();
  ROWS.forEach((r, i) => {
    const k = set.map((c) => r[c]).join("|");
    if (seen.has(k)) {
      dup.add(i);
      dup.add(seen.get(k)!);
    } else seen.set(k, i);
  });
  return dup;
}

export function DbKeyFinderLab({ id = "key-finder" }: { id?: string }) {
  const key = useActivityKey(id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const ready = useProgressStore((s) => s.hydrated && s.sync !== "checking");
  const saved = useProgressStore((s) => s.activities[key]);

  const [sel, setSel] = useState<Col[]>([]);
  const [found, setFound] = useState<Col[]>([]);
  const [triedSuper, setTriedSuper] = useState(0);
  const seeded = useRef(false);

  useEffect(() => {
    if (!ready || seeded.current) return;
    seeded.current = true;
    if (!saved || saved.attempts === 0 || !saved.lastAnswer) return;
    try {
      const f = JSON.parse(saved.lastAnswer) as Col[];
      if (Array.isArray(f)) setFound(f.filter((c) => CANDIDATES.includes(c)));
    } catch {
      /* ignore */
    }
  }, [ready, saved]);

  const ordered = COLS.filter((c) => sel.includes(c));
  const superKey = ordered.length > 0 && isSuper(ordered);
  const removable = superKey ? ordered.filter((c) => isSuper(ordered.filter((x) => x !== c))) : [];
  const candidate = superKey && removable.length === 0;
  const dups = ordered.length ? duplicateRows(ordered) : new Set<number>();
  const uniqueInRows = ordered.length > 0 && dups.size === 0;
  const allFound = CANDIDATES.every((c) => found.includes(c));

  function toggle(c: Col) {
    const next = sel.includes(c) ? sel.filter((x) => x !== c) : [...sel, c];
    setSel(next);
    const o = COLS.filter((x) => next.includes(x));
    if (o.length && isSuper(o)) setTriedSuper((n) => n + 1);
    if (o.length === 1 && CANDIDATES.includes(o[0]) && !found.includes(o[0])) {
      const f = [...found, o[0]];
      setFound(f);
      recordAttempt(key, CANDIDATES.every((x) => f.includes(x)), JSON.stringify(f));
    }
  }

  let verdict: { tone: "correct" | "incorrect" | "info"; title: string; body: string } | null = null;
  if (ordered.length) {
    if (candidate)
      verdict = {
        tone: "correct",
        title: `${setLabel(ordered)} is a candidate key.`,
        body: `It is a super key, and it is minimal: remove its only attribute and nothing is left. ${
          found.length < CANDIDATES.length ? "Added to your list." : ""
        }`,
      };
    else if (superKey)
      verdict = {
        tone: "info",
        title: `${setLabel(ordered)} is a super key, but not a candidate key.`,
        body: `It identifies every student, but it is not minimal. Drop ${removable.join(" or ")} and what is left still identifies every student.`,
      };
    else if (uniqueInRows)
      verdict = {
        tone: "incorrect",
        title: `${setLabel(ordered)} is not a key, even though it is unique in these six rows.`,
        body: "The last rule allows two students with the same name in the same section. A key is a promise about every state the table can ever be in, not a property of today's rows.",
      };
    else
      verdict = {
        tone: "incorrect",
        title: `${setLabel(ordered)} is not a key.`,
        body: "Two rows already share these values (highlighted in red), so it cannot tell those students apart.",
      };
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-400 bg-background-200">
      <div className="border-b border-gray-400 px-4 py-3">
        <p className="text-label-14 text-gray-1000">
          <span className="text-gray-600">Lab · </span>Find every candidate key of STUDENT
        </p>
        <p className="text-copy-13 mt-0.5 text-gray-700">Tap column headers to build a set of attributes. The lab tells you what that set is.</p>
      </div>

      <div className="border-b border-gray-400 px-4 py-3">
        <p className="text-label-12 mb-1.5 text-gray-600">Business rules</p>
        <ol className="text-copy-13 mt-0 list-none space-y-1 pl-0 text-gray-800">
          {RULES.map((r, i) => (
            <li key={i} className="mt-0 flex gap-2">
              <span className="text-label-12-mono shrink-0 text-gray-600">{i + 1}</span>
              <span>{r.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="overflow-x-auto px-4 pt-4">
        <table className="mt-0 w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr>
              {COLS.map((c) => {
                const on = sel.includes(c);
                return (
                  <th key={c} className="p-0 pb-2 pr-1.5 normal-case tracking-normal">
                    <button
                      onClick={() => toggle(c)}
                      aria-pressed={on}
                      className={`text-label-12-mono w-full rounded-md border px-2 py-1.5 text-left transition-colors ${
                        on ? "border-blue-700 bg-blue-700/15 text-blue-600" : "border-gray-500 text-gray-900 hover:border-gray-700"
                      }`}
                    >
                      {c}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i} className={dups.has(i) ? "bg-red-700/10" : ""}>
                {COLS.map((c) => (
                  <td
                    key={c}
                    className={`border-t border-gray-400 px-2 py-1.5 font-mono text-[12px] ${
                      sel.includes(c) ? (dups.has(i) ? "text-red-600" : "text-gray-1000") : "text-gray-700"
                    }`}
                  >
                    {r[c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4">
        {!verdict && <p className="text-copy-13 text-gray-600">No attributes selected. Start with the one you would trust least, name.</p>}
        {verdict && (
          <div className="grid gap-2 sm:grid-cols-3">
            <Check label="Unique in these rows" ok={uniqueInRows} />
            <Check label="Super key (by the rules)" ok={superKey} />
            <Check label="Minimal (candidate key)" ok={candidate} />
          </div>
        )}
        {verdict && (
          <Feedback tone={verdict.tone} title={verdict.title}>
            <p>{verdict.body}</p>
          </Feedback>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-label-12 text-gray-600">Candidate keys found · {found.length} of {CANDIDATES.length}</span>
          {CANDIDATES.map((c) => (
            <span
              key={c}
              className={`text-label-12-mono rounded-full border px-2.5 py-0.5 ${
                found.includes(c) ? "border-green-700/60 bg-green-700/10 text-green-600" : "border-dashed border-gray-500 text-gray-600"
              }`}
            >
              {found.includes(c) ? setLabel([c]) : "?"}
            </span>
          ))}
          {triedSuper > 0 && <span className="text-label-12 ml-auto text-gray-600">{triedSuper} super keys tried</span>}
        </div>

        {allFound && (
          <Feedback tone="correct" title="All three candidate keys found.">
            <p>
              STUDENT has three candidate keys: reg_no, cnic and email. Of the 31 non-empty sets of these five columns, 28 are super keys, because any set that
              contains one of the three is a super key. The only sets that are not are name, section, and the two together.
            </p>
            <p>
              The designer picks one candidate key as the <strong>primary key</strong> (reg_no: short, assigned by the university, never changes). The other two, cnic
              and email, become <strong>alternate keys</strong>, declared UNIQUE in SQL.
            </p>
          </Feedback>
        )}
      </div>
    </div>
  );
}

function Check({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="rounded-md border border-gray-400 bg-background-100 px-3 py-2">
      <p className="text-label-12 text-gray-700">{label}</p>
      <p className={`mt-0.5 font-mono text-[14px] ${ok ? "text-green-600" : "text-red-600"}`}>{ok ? "yes" : "no"}</p>
    </div>
  );
}

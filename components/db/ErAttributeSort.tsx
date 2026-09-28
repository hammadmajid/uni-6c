"use client";

import { useEffect, useRef, useState } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey } from "@/components/learning/LessonContext";
import { Button, Feedback } from "@/components/learning/ui";

type Kind = "simple" | "composite" | "multi" | "derived" | "complex";

const KINDS: { id: Kind; name: string; symbol: string }[] = [
  { id: "simple", name: "Simple, single-valued, stored", symbol: "plain oval" },
  { id: "composite", name: "Composite", symbol: "oval with sub-ovals" },
  { id: "multi", name: "Multivalued", symbol: "double oval" },
  { id: "derived", name: "Derived", symbol: "dashed oval" },
  { id: "complex", name: "Complex (composite + multivalued)", symbol: "double oval with sub-ovals" },
];

interface Attr {
  id: string;
  what: string;
  kind: Kind;
  why: string;
  trap?: string;
}

const ATTRS: Attr[] = [
  {
    id: "cnic",
    what: "STUDENT.CNIC, e.g. 61101-1234567-1",
    kind: "simple",
    why: "One value per student, stored as-is, and nobody queries its parts separately.",
    trap: "The dashes do not make it composite. An attribute is composite only if the miniworld uses its parts on their own; CNIC is always read whole.",
  },
  {
    id: "gender",
    what: "STUDENT.Gender",
    kind: "simple",
    why: "Atomic, one value, stored.",
  },
  {
    id: "name",
    what: "STUDENT.FullName, made of FirstName and LastName",
    kind: "composite",
    why: "The lecture's own example: FullName splits into First and Last, and you sort by LastName.",
  },
  {
    id: "addr",
    what: "STUDENT.HomeAddress: house, street, sector, city (House 12, St 5, G-9/4, Islamabad)",
    kind: "composite",
    why: "One address made of parts you can use separately, e.g. count students per sector.",
    trap: "A student has one home address here, so it is not multivalued. It has parts, so it is composite.",
  },
  {
    id: "phone",
    what: "STUDENT.PhoneNumbers: a mobile and a home landline",
    kind: "multi",
    why: "Several values of the same attribute for one student: the lecture's own multivalued example.",
    trap: "Two numbers of the same kind for one entity is a set of values, so it is multivalued, not composite. Composite is one value with parts.",
  },
  {
    id: "email",
    what: "STUDENT.Emails: university and personal address",
    kind: "multi",
    why: "One student, several email addresses: a set of values.",
  },
  {
    id: "age",
    what: "STUDENT.Age",
    kind: "derived",
    why: "Computed from DateOfBirth and today's date. Storing it would make it wrong every birthday.",
  },
  {
    id: "cgpa",
    what: "STUDENT.CGPA, shown on the portal",
    kind: "derived",
    why: "CGPA is calculated from the grades and credit hours of the courses taken.",
    trap: "The portal displays it, but it can always be recomputed from the grades, which makes it derived. Being shown on screen does not make it stored.",
  },
  {
    id: "count",
    what: "DEPARTMENT.NumberOfEmployees",
    kind: "derived",
    why: "Elmasri's own example: counted from the EMPLOYEE entities that work for the department.",
  },
  {
    id: "degrees",
    what: "EMPLOYEE.Qualifications: each with DegreeName, University, Year",
    kind: "complex",
    why: "Many qualifications (multivalued), each made of parts (composite): the slide's complex attribute example.",
    trap: "It is multivalued and each value has parts. That nesting is exactly what the slide calls a complex attribute.",
  },
];

export function ErAttributeSort({ id = "attr-sort" }: { id?: string }) {
  const key = useActivityKey(id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const ready = useProgressStore((s) => s.hydrated && s.sync !== "checking");
  const saved = useProgressStore((s) => s.activities[key]);

  const [placed, setPlaced] = useState<Record<string, Kind>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const seeded = useRef(false);

  useEffect(() => {
    if (!ready || seeded.current) return;
    seeded.current = true;
    if (!saved || saved.attempts === 0 || !saved.lastAnswer) return;
    try {
      setPlaced(JSON.parse(saved.lastAnswer) as Record<string, Kind>);
      setAttempts(saved.attempts);
      setChecked(true);
    } catch {
      /* ignore */
    }
  }, [ready, saved]);

  const unplaced = ATTRS.filter((a) => !placed[a.id]);
  const allPlaced = unplaced.length === 0;
  const wrong = ATTRS.filter((a) => placed[a.id] && placed[a.id] !== a.kind);
  const allCorrect = checked && allPlaced && wrong.length === 0;

  function place(kind: Kind) {
    if (!picked) return;
    setPlaced((m) => ({ ...m, [picked]: kind }));
    setPicked(null);
    setChecked(false);
  }
  function unplace(aid: string) {
    if (allCorrect) return;
    setPlaced((m) => {
      const n = { ...m };
      delete n[aid];
      return n;
    });
    setChecked(false);
  }
  function check() {
    setChecked(true);
    setAttempts((a) => a + 1);
    recordAttempt(key, allPlaced && wrong.length === 0, JSON.stringify(placed));
  }

  const chipCls = (a: Attr) => {
    if (checked && placed[a.id]) return placed[a.id] === a.kind ? "border-green-700/60 bg-green-700/10 text-green-600" : "border-red-700/60 bg-red-700/10 text-red-600";
    return picked === a.id ? "border-blue-700 bg-blue-700/15 text-blue-600" : "border-gray-500 text-gray-1000 hover:border-gray-700";
  };

  return (
    <div className="my-6 rounded-lg border border-gray-400 bg-background-200 p-5">
      <p className="text-label-12 mb-2 text-blue-600">Sort · which oval does it get?</p>
      <p className="text-copy-16 font-medium text-gray-1000">Ten attributes from a university and a company. Put each one under the symbol you would draw.</p>
      <p className="text-copy-13 mt-1 text-gray-700">Tap an attribute, then tap a type. Tap a placed attribute to send it back.</p>

      <div className="mt-4 rounded-md border border-dashed border-gray-500 p-3">
        <p className="text-label-12 mb-2 text-gray-600">Unsorted · {unplaced.length}</p>
        <div className="flex flex-col gap-1.5">
          {unplaced.map((a) => (
            <button key={a.id} onClick={() => setPicked(picked === a.id ? null : a.id)} className={`text-copy-13 rounded-md border px-2.5 py-1.5 text-left transition-colors ${chipCls(a)}`}>
              {a.what}
            </button>
          ))}
          {unplaced.length === 0 && <span className="text-copy-13 text-gray-600">All placed.</span>}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            onClick={() => place(k.id)}
            disabled={!picked}
            className={`flex min-h-[64px] flex-col justify-start rounded-md border p-3 text-left transition-colors ${picked ? "cursor-pointer border-blue-700/60 hover:bg-blue-700/10" : "border-gray-400"} disabled:cursor-default`}
          >
            <span className="text-label-12 flex w-full items-center gap-2 text-gray-1000">
              {k.name}
              <span className="text-label-12-mono ml-auto text-gray-600">{k.symbol}</span>
            </span>
            <span className="mt-2 flex flex-col gap-1">
              {ATTRS.filter((a) => placed[a.id] === k.id).map((a) => (
                <span
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    unplace(a.id);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && unplace(a.id)}
                  className={`text-copy-13 rounded-md border px-2 py-1 ${chipCls(a)}`}
                >
                  {a.what}
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
        <Feedback tone="incorrect" title={`${ATTRS.length - wrong.length} of ${ATTRS.length} placed correctly.`}>
          <ul className="list-none space-y-1 pl-0">
            {wrong.map((a) => (
              <li key={a.id} className="mt-0">
                <span className="text-gray-1000">{a.what}:</span> {a.trap ?? a.why}
              </li>
            ))}
          </ul>
        </Feedback>
      )}

      {allCorrect && (
        <Feedback tone="correct" title={`All ${ATTRS.length} placed${attempts > 1 ? ` in ${attempts} attempts` : ""}.`}>
          <ul className="list-none space-y-1 pl-0">
            {ATTRS.map((a) => (
              <li key={a.id} className="mt-0">
                <span className="text-gray-1000">{KINDS.find((k) => k.id === a.kind)!.name}:</span> {a.why}
              </li>
            ))}
          </ul>
        </Feedback>
      )}
    </div>
  );
}

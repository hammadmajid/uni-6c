"use client";

import { useEffect, useRef, useState } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey } from "@/components/learning/LessonContext";
import { Button, Feedback } from "@/components/learning/ui";

type Tag = "entity" | "attribute" | "synonym" | "value" | "none";

const TAGS: { id: Tag; label: string; hint: string }[] = [
  { id: "entity", label: "Entity", hint: "rectangle" },
  { id: "attribute", label: "Attribute", hint: "oval" },
  { id: "synonym", label: "Same as another entity", hint: "no new shape" },
  { id: "value", label: "A value (a row)", hint: "data, not design" },
  { id: "none", label: "Not stored", hint: "no shape" },
];

interface Noun {
  id: string;
  text: string;
  tag: Tag;
  why: string;
  trap: string;
}

const NOUNS: Noun[] = [
  {
    id: "company",
    text: "car sales company",
    tag: "none",
    why: "The company owns the database; it is the miniworld, not something it keeps rows about.",
    trap: "There is only one company and every row belongs to it. An entity type needs many instances to tell apart; COMPANY has one, so it is the database's owner, not an entity.",
  },
  {
    id: "customer",
    text: "customer",
    tag: "entity",
    why: "Many customers, each with a unique customer number and its own attributes.",
    trap: "A customer has a unique number, a name, an address and a phone: an identifier plus descriptive attributes is the signature of an entity.",
  },
  {
    id: "purchase",
    text: "purchase",
    tag: "synonym",
    why: "A purchase is the customer's side of a sale. One entity, SALE, named after the noun that has an identifier (sale id).",
    trap: "Purchase, sale and transaction describe the same event from different sides. Drawing two rectangles would store every sale twice. Keep one: SALE.",
  },
  {
    id: "scheme",
    text: "replacement scheme",
    tag: "entity",
    why: "It has a unique scheme number, a name and a number of years: an entity.",
    trap: "The text gives it a unique replacement scheme number and two more attributes. That makes it an entity, not an attribute of the sale.",
  },
  {
    id: "years",
    text: "1 year, 2 years, 3 years, 4 years and 5 years",
    tag: "value",
    why: "These are the five rows of REPLACEMENT_SCHEME, the values of NoOfYears. They are data, not design.",
    trap: "The five options are instances (rows) of REPLACEMENT_SCHEME. Making five attributes or five entities would mean changing the schema every time the company adds a 6-year plan.",
  },
  {
    id: "oneGo",
    text: "the whole amount in one go",
    tag: "none",
    why: "Paying outright means the sale has no scheme. That is partial participation of SALE in PAID_UNDER, not a new shape.",
    trap: "“Pays in one go” is the absence of a scheme. The ERD shows it as a single (partial) line from SALE to PAID_UNDER; the stored value is a NULL scheme on that sale.",
  },
  {
    id: "custno",
    text: "customer number",
    tag: "attribute",
    why: "Unique, so it is CUSTOMER's key attribute: an underlined oval.",
    trap: "The customer number describes a customer and identifies it. It is CUSTOMER's key attribute, drawn as an underlined oval.",
  },
  {
    id: "address",
    text: "address",
    tag: "attribute",
    why: "Describes a customer. Could be drawn composite (street, city), but the text does not split it, so a simple oval is fine.",
    trap: "An address describes a customer and has no identifier of its own in this case. Attribute.",
  },
  {
    id: "noyears",
    text: "number of years for payment",
    tag: "attribute",
    why: "Describes a scheme: NoOfYears.",
    trap: "This is a property of each scheme, with values 1 to 5. Attribute of REPLACEMENT_SCHEME.",
  },
  {
    id: "car",
    text: "car",
    tag: "entity",
    why: "Unique car code plus make, model, year and price.",
    trap: "A car has a unique car code and four more attributes. Entity.",
  },
  {
    id: "make",
    text: "make",
    tag: "attribute",
    why: "Describes a car.",
    trap: "Make (Toyota, Honda) is a property of a car. It would only become an entity if the text gave makes their own attributes.",
  },
  {
    id: "commission",
    text: "commission",
    tag: "attribute",
    why: "Paid per sale, so it is an attribute of SALE.",
    trap: "The text says the company keeps “a unique sale id and commission to be paid on that sale”. Commission has no identifier; it is one value per sale. Attribute of SALE, not an entity and not an attribute of the salesperson.",
  },
  {
    id: "salesperson",
    text: "sales people",
    tag: "entity",
    why: "Unique salesperson id, name, phone and email.",
    trap: "Sales people have a unique id and descriptive attributes. Entity, named in the singular: SALESPERSON.",
  },
  {
    id: "sale",
    text: "sale",
    tag: "entity",
    why: "Unique sale id plus commission. The hub every other entity connects to.",
    trap: "The company keeps “information about each sale” with “a unique sale id”. That is the definition of an entity.",
  },
  {
    id: "transaction",
    text: "transaction",
    tag: "synonym",
    why: "“The car involved in that transaction” is the sale again.",
    trap: "“That transaction” points back to the sale in the previous sentence. Same entity, SALE; no new rectangle.",
  },
  {
    id: "email",
    text: "email address",
    tag: "attribute",
    why: "Describes a salesperson.",
    trap: "An email describes one salesperson. Attribute.",
  },
];

export function ErCarSalesNounPicker({ id = "car-sales-nouns" }: { id?: string }) {
  const key = useActivityKey(id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const ready = useProgressStore((s) => s.hydrated && s.sync !== "checking");
  const saved = useProgressStore((s) => s.activities[key]);

  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const seeded = useRef(false);

  useEffect(() => {
    if (!ready || seeded.current) return;
    seeded.current = true;
    if (!saved || saved.attempts === 0 || !saved.lastAnswer) return;
    try {
      setTags(JSON.parse(saved.lastAnswer) as Record<string, Tag>);
      setAttempts(saved.attempts);
      setChecked(true);
    } catch {
      /* ignore */
    }
  }, [ready, saved]);

  const left = NOUNS.filter((n) => !tags[n.id]).length;
  const wrong = NOUNS.filter((n) => tags[n.id] && tags[n.id] !== n.tag);
  const allCorrect = checked && left === 0 && wrong.length === 0;

  function set(nid: string, t: Tag) {
    if (allCorrect) return;
    setTags((m) => ({ ...m, [nid]: t }));
    setChecked(false);
  }
  function check() {
    setChecked(true);
    setAttempts((a) => a + 1);
    recordAttempt(key, left === 0 && wrong.length === 0, JSON.stringify(tags));
  }

  const tone = (n: Noun) => {
    if (!checked || !tags[n.id]) return "border-gray-400";
    return tags[n.id] === n.tag ? "border-green-700/60 bg-green-700/5" : "border-red-700/60 bg-red-700/5";
  };

  return (
    <div className="my-6 rounded-lg border border-gray-400 bg-background-200 p-5">
      <p className="text-label-12 mb-2 text-blue-600">Step 1 · underline the nouns, then decide</p>
      <p className="text-copy-16 font-medium text-gray-1000">Sixteen nouns from the case. What does each one become in the ER diagram?</p>
      <p className="text-copy-13 mt-1 text-gray-700">Pick one tag per noun, then check. Wrong tags come back with the reason.</p>

      <ul className="mt-4 list-none space-y-2 pl-0">
        {NOUNS.map((n) => (
          <li key={n.id} className={`mt-0 rounded-md border p-2.5 transition-colors ${tone(n)}`}>
            <p className="text-copy-14 mb-2 font-mono text-gray-1000">“{n.text}”</p>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((t) => {
                const on = tags[n.id] === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => set(n.id, t.id)}
                    aria-pressed={on}
                    className={`text-label-12 rounded-md border px-2 py-1 transition-colors ${
                      on ? "border-blue-700 bg-blue-700/15 text-blue-600" : "border-gray-500 text-gray-800 hover:border-gray-700"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {!allCorrect && (
        <div className="mt-4 flex items-center gap-3">
          <Button variant="primary" onClick={check} disabled={left > 0}>
            Check
          </Button>
          {left > 0 && <span className="text-label-12 text-gray-600">{left} left to tag</span>}
          {attempts > 0 && <span className="text-label-12 text-gray-600">{attempts} {attempts === 1 ? "attempt" : "attempts"}</span>}
        </div>
      )}

      {checked && wrong.length > 0 && (
        <Feedback tone="incorrect" title={`${NOUNS.length - wrong.length} of ${NOUNS.length} tagged correctly.`}>
          <ul className="list-none space-y-1 pl-0">
            {wrong.map((n) => (
              <li key={n.id} className="mt-0">
                <span className="text-gray-1000">“{n.text}”:</span> {n.trap}
              </li>
            ))}
          </ul>
        </Feedback>
      )}

      {allCorrect && (
        <Feedback tone="correct" title={`All ${NOUNS.length} tagged${attempts > 1 ? ` in ${attempts} attempts` : ""}. Five entities: CUSTOMER, REPLACEMENT_SCHEME, CAR, SALE, SALESPERSON.`}>
          <ul className="list-none space-y-1 pl-0">
            {NOUNS.map((n) => (
              <li key={n.id} className="mt-0">
                <span className="text-gray-1000">“{n.text}”:</span> {n.why}
              </li>
            ))}
          </ul>
        </Feedback>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Circle, Eye } from "lucide-react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey } from "@/components/learning/LessonContext";
import { CAPTURE } from "./capture";
import { applyFilter } from "./filter";
import { WiresharkWindow } from "./WiresharkWindow";

interface Task {
  id: string;
  goal: string;
  hint: string;
  /** A filter that produces the expected set. The learner may reach the same set any other way. */
  solution: string;
  why: string;
}

const TASKS: Task[] = [
  {
    id: "http",
    goal: "Show only the HTTP messages (the lab's step 8).",
    hint: "Protocol names are typed in lower case, exactly as they appear in the Protocol column.",
    solution: "http",
    why: "A bare protocol name keeps every packet Wireshark decoded as that protocol. Two frames carry HTTP: the GET and the 200 OK.",
  },
  {
    id: "gaia",
    goal: "Show every packet exchanged with gaia.cs.umass.edu (128.119.245.12), in both directions.",
    hint: "The field for either IP address is ip.addr. A comparison needs ==.",
    solution: "ip.addr == 128.119.245.12",
    why: "ip.addr matches source or destination, so one expression gets both directions: the handshake, the GET, the reply, the ACKs and the teardown. Ten frames.",
  },
  {
    id: "dns-answer",
    goal: "Show only the DNS reply that told your machine gaia's IP address.",
    hint: "It is a DNS packet, it is a response, and it carries an A record. Any of dns.a, dns.flags.response, or frame.number can pin it down.",
    solution: "dns.a == 128.119.245.12",
    why: "Exactly one frame. Several filters get there: dns.a == 128.119.245.12, or dns.flags.response == 1 && dns.qry.type == 1, or simply frame.number == 9. Filters describe a set; any expression that yields the same set is equally right.",
  },
  {
    id: "not-tcp",
    goal: "Hide every TCP packet, so only the non-TCP background traffic remains.",
    hint: "Negation is ! or not, in front of a protocol name.",
    solution: "!tcp",
    why: "What is left is the noise the lab warned about: ARP, mDNS, SSDP, DNS, NTP. Ten frames from doing nothing but loading one page.",
  },
  {
    id: "handshake",
    goal: "Show only the three packets of the TCP handshake with gaia (SYN, SYN-ACK, ACK) and nothing else.",
    hint: "Combine a port test with a frame-number range using &&, or test tcp.flags.syn and add the bare ACK by number. Parentheses group.",
    solution: "tcp.flags.syn == 1 || frame.number == 13",
    why: "Three frames, 11 to 13. The two SYN frames are easy (tcp.flags.syn == 1); the third is a plain ACK with no data, so you either name it (frame.number == 13) or bound the range: tcp.port == 80 && frame.number <= 13.",
  },
];

const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export function FilterLab({ id = "filter-lab" }: { id?: string }) {
  const baseKey = useActivityKey(id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const recordReveal = useProgressStore((s) => s.recordReveal);
  const ready = useProgressStore((s) => s.hydrated && s.sync !== "checking");
  const activities = useProgressStore((s) => s.activities);

  const [filter, setFilter] = useState("");
  const [active, setActive] = useState(0);
  const [solved, setSolved] = useState<Record<string, string>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const seeded = useRef(false);

  const expected = useMemo(() => TASKS.map((t) => applyFilter(t.solution, CAPTURE).matches.map((p) => p.no)), []);

  // Restore solved tasks (and the filter that solved them) from the store.
  useEffect(() => {
    if (!ready || seeded.current) return;
    seeded.current = true;
    const restored: Record<string, string> = {};
    TASKS.forEach((t) => {
      const a = activities[`${baseKey}/${t.id}`];
      if (a?.correct && a.lastAnswer) restored[t.id] = a.lastAnswer;
    });
    setSolved(restored);
    const first = TASKS.findIndex((t) => !restored[t.id]);
    setActive(first === -1 ? 0 : first);
  }, [ready, activities, baseKey]);

  // Live check: the moment the displayed set equals the task's set, it is solved.
  const result = useMemo(() => applyFilter(filter, CAPTURE), [filter]);
  const current = TASKS[active];
  const currentNos = result.ok ? result.matches.map((p) => p.no) : [];
  const matchesNow = result.ok && filter.trim() !== "" && sameSet(currentNos, expected[active]);

  useEffect(() => {
    if (!matchesNow || solved[current.id]) return;
    setSolved((s) => ({ ...s, [current.id]: filter.trim() }));
    recordAttempt(`${baseKey}/${current.id}`, true, filter.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchesNow]);

  const doneCount = TASKS.filter((t) => solved[t.id]).length;

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-400 bg-background-200">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-400 px-4 py-3">
        <p className="text-label-14 text-gray-1000">
          <span className="text-gray-600">Lab · </span>Display filter trainer
        </p>
        <span className="text-label-12-mono text-gray-700">
          {doneCount}/{TASKS.length} solved
        </span>
      </div>

      <div>
        <ol className="flex list-none flex-wrap gap-1.5 border-b border-gray-400 px-3 py-2 pl-3">
          {TASKS.map((t, i) => {
            const isDone = !!solved[t.id];
            return (
              <li key={t.id} className="mt-0">
                <button
                  onClick={() => {
                    setActive(i);
                    setFilter(solved[t.id] ?? "");
                  }}
                  aria-label={`Task ${i + 1}: ${t.goal}`}
                  className={`text-label-12 flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors ${
                    active === i ? "border-blue-700 bg-blue-700/10 text-blue-600" : isDone ? "border-green-700/50 text-green-600" : "border-gray-500 text-gray-800 hover:border-gray-700"
                  }`}
                >
                  {isDone ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  Task {i + 1}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="min-w-0 p-3">
          <div className="rounded-md border border-blue-700/30 bg-blue-700/5 px-3 py-2.5">
            <p className="text-label-12 text-blue-600">Task {active + 1}</p>
            <p className="text-copy-14 mt-0.5 text-gray-1000">{current.goal}</p>
            <p className="text-label-12-mono mt-1.5 text-gray-700">
              expect {expected[active].length} packet{expected[active].length === 1 ? "" : "s"} · showing {result.ok ? currentNos.length : "—"}
            </p>
          </div>

          <div className="-mx-3 -mb-3">
            <WiresharkWindow filter={filter} onFilterChange={setFilter} panes={{ list: true, details: false, bytes: false }} listRows={8} title="Wireshark · lab01.pcapng" />
          </div>

          {solved[current.id] ? (
            <div className="mt-3 rounded-md border border-green-700/40 bg-green-700/10 p-3">
              <p className="text-label-14 text-green-600">
                Solved with <span className="font-mono text-gray-1000">{solved[current.id]}</span>
              </p>
              <p className="text-copy-13 mt-1 text-gray-900">{current.why}</p>
              {active < TASKS.length - 1 && (
                <button
                  onClick={() => {
                    setActive(active + 1);
                    setFilter(solved[TASKS[active + 1].id] ?? "");
                  }}
                  className="text-label-12 mt-2 text-blue-600 hover:text-blue-500"
                >
                  Next task →
                </button>
              )}
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {!hints[current.id] ? (
                <button onClick={() => setHints((h) => ({ ...h, [current.id]: true }))} className="text-label-12 text-amber-600 hover:text-amber-500">
                  Hint
                </button>
              ) : (
                <p className="text-copy-13 text-amber-600">{current.hint}</p>
              )}
              {hints[current.id] && (
                <button
                  onClick={() => {
                    recordReveal(`${baseKey}/${current.id}`);
                    setFilter(current.solution);
                  }}
                  className="text-label-12 flex items-center gap-1 text-gray-700 hover:text-gray-1000"
                >
                  <Eye size={12} /> Show a filter that works
                </button>
              )}
              {filter.trim() && result.ok && !matchesNow && (
                <p className="text-copy-13 text-gray-700">
                  Parses, but {currentNos.length === 0 ? "matches nothing" : `shows ${currentNos.length} packet${currentNos.length === 1 ? "" : "s"}`}; the task needs {expected[active].length}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

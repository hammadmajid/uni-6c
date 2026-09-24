"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Lab, SegmentRow, useExplorationState } from "@/components/learning/Controls";

type Mode = "field" | "local";

const CODE: Record<Mode, string[]> = {
  field: [
    "public class GreetServlet extends HttpServlet {",
    "    private String name;            // one copy, on the heap",
    "    protected void doGet(HttpServletRequest req,",
    "                         HttpServletResponse res) throws IOException {",
    '        name = req.getParameter("name");        // line A',
    "        slowLookup();   // a 50 ms database call  // line B",
    '        res.getWriter().println("Hello " + name); // line C',
    "    }",
    "}",
  ],
  local: [
    "public class GreetServlet extends HttpServlet {",
    "    // no fields holding request data",
    "    protected void doGet(HttpServletRequest req,",
    "                         HttpServletResponse res) throws IOException {",
    '        String name = req.getParameter("name"); // line A',
    "        slowLookup();   // a 50 ms database call  // line B",
    '        res.getWriter().println("Hello " + name); // line C',
    "    }",
    "}",
  ],
};

// Interleaving: which thread runs which line at each step. Line index into CODE (4 = A, 5 = B, 6 = C).
const SCHEDULE: { t: "ali" | "sara"; line: number; say: string }[] = [
  { t: "ali", line: 4, say: "Ali's request (thread exec-1) reads name=ali." },
  { t: "ali", line: 5, say: "exec-1 blocks on the database. The CPU is free, so Tomcat runs another thread." },
  { t: "sara", line: 4, say: "Sara's request (thread exec-2) reads name=sara." },
  { t: "sara", line: 5, say: "exec-2 blocks on the database too." },
  { t: "ali", line: 6, say: "exec-1's query returns. It builds Ali's response from name." },
  { t: "sara", line: 6, say: "exec-2's query returns. It builds Sara's response from name." },
];

const defaults = { mode: "field" as Mode, step: 0 };

export function SharedFieldRace() {
  const { values: v, set, reset } = useExplorationState(defaults);
  const mode = v.mode as Mode;
  const step = Math.max(0, Math.min(SCHEDULE.length, v.step));

  // Replay the schedule up to `step`.
  let field: string | null = null;
  const locals: Record<"ali" | "sara", string | null> = { ali: null, sara: null };
  const out: Record<"ali" | "sara", string | null> = { ali: null, sara: null };
  for (let i = 0; i < step; i++) {
    const s = SCHEDULE[i];
    if (s.line === 4) {
      if (mode === "field") field = s.t;
      else locals[s.t] = s.t;
    }
    if (s.line === 6) out[s.t] = `Hello ${mode === "field" ? field : locals[s.t]}`;
  }
  const cur = step > 0 ? SCHEDULE[step - 1] : null;
  const wrong = (["ali", "sara"] as const).filter((t) => out[t] && out[t] !== `Hello ${t}`);

  return (
    <Lab
      title="Two requests, one servlet object"
      subtitle="Step through the interleaving Tomcat is allowed to produce. Then move name into a local variable and replay."
      onReset={reset}
      controls={
        <>
          <SegmentRow<Mode>
            label="Where does name live?"
            value={mode}
            options={[
              { value: "field", label: "instance field" },
              { value: "local", label: "local variable" },
            ]}
            onChange={(m) => {
              set("mode", m);
              set("step", 0);
            }}
          />
          <div className="space-y-1">
            <p className="text-label-12 text-gray-800">
              Step {step} of {SCHEDULE.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => set("step", Math.max(0, step - 1))}
                disabled={step === 0}
                aria-label="Previous step"
                className="rounded-md border border-gray-500 p-1.5 text-gray-800 hover:text-gray-1000 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => set("step", Math.min(SCHEDULE.length, step + 1))}
                disabled={step === SCHEDULE.length}
                className="text-label-12 flex items-center gap-1 rounded-md border border-gray-500 px-3 py-1.5 text-gray-900 hover:text-gray-1000 disabled:opacity-30"
              >
                next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      }
    >
      <pre className="m-0 overflow-x-auto rounded-md border border-gray-400 bg-background-100 p-3 font-mono text-[12px] leading-[1.6]">
        {CODE[mode].map((l, i) => {
          const active = cur?.line === i;
          const who = active ? cur!.t : null;
          return (
            <div
              key={i}
              className={active ? (who === "ali" ? "-mx-3 bg-blue-700/20 px-3 text-gray-1000" : "-mx-3 bg-amber-700/20 px-3 text-gray-1000") : "text-gray-800"}
            >
              {l}
              {active && <span className={who === "ali" ? "text-blue-600" : "text-amber-600"}>{`   ◀ ${who === "ali" ? "exec-1 (ali)" : "exec-2 (sara)"}`}</span>}
            </div>
          );
        })}
      </pre>

      <p className="text-copy-14 mt-3 min-h-[1.5em] text-gray-900">{cur ? cur.say : "Press next. Both requests hit GET /greet at nearly the same moment."}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-gray-400 bg-background-100 px-3 py-2.5">
          <p className="text-label-12 text-gray-700">{mode === "field" ? "Heap: the one GreetServlet object" : "exec-1's stack frame"}</p>
          <p className="mt-0.5 font-mono text-[13px] text-gray-1000">
            name = {mode === "field" ? (field ? `"${field}"` : "null") : locals.ali ? `"${locals.ali}"` : "(not yet)"}
          </p>
        </div>
        <div className="rounded-md border border-gray-400 bg-background-100 px-3 py-2.5">
          <p className="text-label-12 text-gray-700">{mode === "field" ? "exec-1 and exec-2 stacks" : "exec-2's stack frame"}</p>
          <p className="mt-0.5 font-mono text-[13px] text-gray-1000">{mode === "field" ? "no name here; both read the field" : `name = ${locals.sara ? `"${locals.sara}"` : "(not yet)"}`}</p>
        </div>
        <div className="rounded-md border border-gray-400 bg-background-100 px-3 py-2.5">
          <p className="text-label-12 text-gray-700">Responses sent</p>
          {(["ali", "sara"] as const).map((t) => (
            <p key={t} className={`mt-0.5 font-mono text-[13px] ${!out[t] ? "text-gray-600" : out[t] === `Hello ${t}` ? "text-green-600" : "text-red-600"}`}>
              to {t}: {out[t] ?? "…"}
            </p>
          ))}
        </div>
      </div>

      {step === SCHEDULE.length && (
        <p className={`text-copy-14 mt-3 ${wrong.length ? "text-red-600" : "text-green-600"}`}>
          {wrong.length
            ? "Ali was greeted as Sara. No exception, no log line, and it only happens under load, which is why this bug survives testing."
            : "Each thread has its own stack frame, so each request keeps its own name. Locals are thread-safe for free."}
        </p>
      )}
    </Lab>
  );
}

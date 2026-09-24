"use client";

import { Lab, Presets, SegmentRow, ToggleRow, useExplorationState } from "@/components/learning/Controls";
import { evaluate, javaSource, type Call, type Decl, type Obj } from "./refTypeModel";

const defaults = { rtDecl: "Object" as Decl, rtObj: "Student" as Obj, rtCall: "toString" as Call, rtAbs: false };
type S = typeof defaults;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "Object p = new Student", values: { rtDecl: "Object", rtObj: "Student", rtCall: "toString", rtAbs: false } },
  { label: "Person p, call study()", values: { rtDecl: "Person", rtObj: "Student", rtCall: "study", rtAbs: false } },
  { label: "Faculty's toString", values: { rtDecl: "Person", rtObj: "Faculty", rtCall: "toString", rtAbs: false } },
  { label: "new abstract Person", values: { rtDecl: "Person", rtObj: "Person", rtCall: "getName", rtAbs: true } },
];

/**
 * Declared type (what the compiler checks) against object type (what runs).
 * Every combination was checked against javac and java from JDK 26.
 */
export function RefTypeLab() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const decl = v.rtDecl as Decl;
  const obj = v.rtObj as Obj;
  const call = v.rtCall as Call;
  const out = evaluate(decl, obj, call, v.rtAbs);
  const src = javaSource(decl, obj, call, v.rtAbs);
  const ok = out.errors.length === 0;

  return (
    <Lab
      title="Reference type vs object type"
      subtitle="The declared type decides what compiles. The object decides which body runs."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <SegmentRow<Decl>
            label="Declared type of p"
            value={decl}
            options={(["Object", "Person", "Student"] as Decl[]).map((x) => ({ value: x, label: x }))}
            onChange={(x) => set("rtDecl", x)}
          />
          <SegmentRow<Obj>
            label="Object created with new"
            value={obj}
            options={(["Person", "Student", "Faculty"] as Obj[]).map((x) => ({ value: x, label: x }))}
            onChange={(x) => set("rtObj", x)}
          />
          <SegmentRow<Call>
            label="Method called on p"
            value={call}
            options={(["toString", "getName", "study"] as Call[]).map((x) => ({ value: x, label: `${x}()` }))}
            onChange={(x) => set("rtCall", x)}
          />
          <ToggleRow label="Make Person abstract (slide 39)" value={v.rtAbs} onChange={(x) => set("rtAbs", x)} />
        </>
      }
    >
      <pre className="m-0 overflow-x-auto rounded-md border border-gray-400 bg-background-100 p-3 font-mono text-[12px] leading-[1.6]">
        {src.map((l, i) => {
          const last = i >= src.length - 2;
          return (
            <div key={i} className={last ? "text-gray-1000" : "text-gray-700"}>
              {l || " "}
            </div>
          );
        })}
      </pre>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className={`rounded-md border px-3 py-2.5 ${ok ? "border-green-700/40 bg-green-700/5" : "border-red-700/40 bg-red-700/5"}`}>
          <p className="text-label-12 text-gray-700">javac (checks the declared type {decl})</p>
          {ok ? (
            <p className="mt-0.5 font-mono text-[13px] text-green-600">compiles</p>
          ) : (
            <ul className="mt-0.5 list-none space-y-1 pl-0">
              {out.errors.map((e) => (
                <li key={e} className="mt-0 font-mono text-[12px] text-red-600">
                  error: {e}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-md border border-gray-400 bg-background-100 px-3 py-2.5">
          <p className="text-label-12 text-gray-700">{ok ? `java (runs the ${obj} object)` : "java"}</p>
          {ok ? (
            <>
              <p className="mt-0.5 font-mono text-[13px] text-gray-1000">{out.output}</p>
              <p className="text-copy-13 mt-0.5 text-gray-600">body that ran: {out.runs}</p>
            </>
          ) : (
            <p className="mt-0.5 font-mono text-[13px] text-gray-600">never runs: no .class file was produced</p>
          )}
        </div>
      </div>
    </Lab>
  );
}

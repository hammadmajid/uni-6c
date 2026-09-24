"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Figure, P } from "@/components/learning/Figure";
import { useExplorationState } from "@/components/learning/Controls";

const CODE = [
  "package com.example;",
  "public class Main {",
  "    public static void main(String[] args) {",
  '        Person p = new Person("Ali");',
  "        String s = p.getName();",
  "        System.out.println(s);",
  "    }",
  "}",
];

interface Step {
  /** Index into CODE of the line being run, or -1. */
  line: number;
  title: string;
  say: string;
}

const STEPS: Step[] = [
  { line: -1, title: "$ java com.example.Main", say: "The launcher starts the JVM. The class loader subsystem loads bootstrap classes (java.lang.Object, java.lang.String, ...) and then Main into the method area. The JVM creates the main thread, which gets its own Java stack, pc register and native method stack." },
  { line: 2, title: "main is called", say: "A frame for main is pushed on the main thread's Java stack. Its one local, args, holds a reference to a String array on the heap: empty, because no command-line arguments were given." },
  { line: 3, title: 'new Person("Ali")', say: "First use of Person, so the class loader loads it into the method area. new allocates the object on the heap and the constructor runs in its own frame (pushed, then popped). What comes back is a reference, stored in the local p. The object is on the heap; p is on the stack." },
  { line: 4, title: "p.getName()", say: "A frame for getName is pushed on top of main's. It returns a copy of the reference in the name field, so s and the object's field now point at the same String. The getName frame is popped." },
  { line: 5, title: "System.out.println(s)", say: "println runs in Java frames on the same stack, and the actual write to the terminal goes through a native method (C code in the JDK), which uses the native method stack. Ali is printed." },
  { line: 6, title: "main returns", say: "main's frame is popped. The main thread ends, the JVM shuts down with exit code 0, and the heap objects, unreachable now, never needed collecting." },
];

const W = 640;
const H = 300;

function Box({ x, y, w, h, label, sub, active }: { x: number; y: number; w: number; h: number; label: string; sub: string; active?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={P.panel} stroke={active ? P.blue : P.lineStrong} strokeWidth={active ? 1.5 : 1} />
      <text x={x + 10} y={y + 16} fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
        {label}
      </text>
      <text x={x + w - 10} y={y + 16} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={P.mono}>
        {sub}
      </text>
    </g>
  );
}

function Cell({ x, y, w, text, tone }: { x: number; y: number; w: number; text: string; tone: "new" | "old" | "ghost" }) {
  const stroke = tone === "new" ? P.blue : tone === "ghost" ? P.line : P.lineStrong;
  const fill = tone === "new" ? "rgba(0,112,243,0.12)" : P.bg;
  return (
    <g>
      <rect x={x} y={y} width={w} height={20} rx={3} fill={fill} stroke={stroke} strokeDasharray={tone === "ghost" ? "3 3" : undefined} />
      <text x={x + 6} y={y + 14} fill={tone === "ghost" ? P.muted : P.textStrong} fontSize={10} fontFamily={P.mono}>
        {text}
      </text>
    </g>
  );
}

/** Stepper over the five runtime data areas while a three-line main runs. */
export function JvmMemoryStepper() {
  const { values: v, set } = useExplorationState({ jmStep: 0 });
  const step = Math.max(0, Math.min(STEPS.length - 1, v.jmStep));
  const cur = STEPS[step];

  const personLoaded = step >= 2;
  const hasArgs = step >= 1 && step <= 4;
  const hasP = step >= 2 && step <= 4;
  const hasS = step >= 3 && step <= 4;
  const objects = step >= 2 && step <= 5;
  const tone = (from: number): "new" | "old" => (step === from ? "new" : "old");

  // Geometry
  const ma = { x: 16, y: 16, w: 250, h: 124 };
  const hp = { x: 282, y: 16, w: 342, h: 124 };
  const js = { x: 16, y: 166, w: 380, h: 118 };
  const pc = { x: 412, y: 166, w: 96, h: 118 };
  const ns = { x: 524, y: 166, w: 100, h: 118 };

  const argsObj = { x: hp.x + 12, y: hp.y + 40, w: 90 };
  const personObj = { x: hp.x + 116, y: hp.y + 40, w: 118 };
  const aliObj = { x: hp.x + 250, y: hp.y + 40, w: 80 };

  const mainFrame = { x: js.x + 12, y: js.y + 72, w: js.w - 24 };
  const slot = (i: number) => ({ x: mainFrame.x + 58 + i * 100, y: mainFrame.y + 10, w: 90 });

  const topFrame = step === 3 ? "getName() frame (popped after return)" : step === 4 ? "println(...) frames" : step === 2 ? "Person(String) frame (constructor, popped)" : null;

  return (
    <Figure
      title="Where things live while main runs"
      controls={
        <div className="flex items-center gap-2">
          <button
            onClick={() => set("jmStep", Math.max(0, step - 1))}
            disabled={step === 0}
            aria-label="Previous step"
            className="rounded-md border border-gray-500 p-1.5 text-gray-800 hover:text-gray-1000 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-label-12-mono text-gray-800">
            {step + 1}/{STEPS.length}
          </span>
          <button
            onClick={() => set("jmStep", Math.min(STEPS.length - 1, step + 1))}
            disabled={step === STEPS.length - 1}
            aria-label="Next step"
            className="rounded-md border border-gray-500 p-1.5 text-gray-800 hover:text-gray-1000 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      }
      caption="Top row: shared by every thread. Bottom row: one set per thread (only main exists here). Blue marks what changed in this step. The exam question 'name the JVM's runtime data areas' wants exactly these five."
    >
      <pre className="m-0 mb-3 overflow-x-auto rounded-md border border-gray-400 bg-background-100 p-3 font-mono text-[12px] leading-[1.6]">
        {CODE.map((l, i) => (
          <div key={i} className={cur.line === i ? "-mx-3 bg-blue-700/20 px-3 text-gray-1000" : "text-gray-700"}>
            {l}
          </div>
        ))}
      </pre>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="JVM runtime data areas">
        <defs>
          <marker id="jm-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={P.blueSoft} />
          </marker>
        </defs>

        {/* Method area */}
        <Box {...ma} label="method area" sub="classes, bytecode" active={step === 0 || step === 2} />
        {[
          { t: "java.lang.Object", on: true, from: 0 },
          { t: "java.lang.String", on: true, from: 0 },
          { t: "com.example.Main  main()", on: true, from: 0 },
          { t: "com.example.Person  getName()", on: personLoaded, from: 2 },
        ].map((c, i) =>
          c.on ? <Cell key={c.t} x={ma.x + 10} y={ma.y + 26 + i * 23} w={ma.w - 20} text={c.t} tone={tone(c.from)} /> : null,
        )}

        {/* Heap */}
        <Box {...hp} label="heap" sub="every object, garbage collected" active={step === 1 || step === 2} />
        {step >= 1 && <Cell x={argsObj.x} y={argsObj.y} w={argsObj.w} text="String[0]" tone={step === 1 ? "new" : "old"} />}
        {objects && (
          <>
            <Cell x={personObj.x} y={personObj.y} w={personObj.w} text="Person object" tone={tone(2)} />
            <Cell x={personObj.x} y={personObj.y + 24} w={personObj.w} text="  name ●" tone={tone(2)} />
            <Cell x={aliObj.x} y={aliObj.y} w={aliObj.w} text={'"Ali"'} tone={tone(2)} />
            <line x1={personObj.x + 64} y1={personObj.y + 34} x2={aliObj.x - 2} y2={aliObj.y + 12} stroke={P.blueSoft} strokeWidth={1.2} markerEnd="url(#jm-arrow)" />
          </>
        )}
        {step === 5 && (
          <text x={hp.x + 12} y={hp.y + 112} fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
            nothing points here any more: unreachable
          </text>
        )}

        {/* Java stack */}
        <Box {...js} label="Java stack (main thread)" sub="one frame per call" active={step >= 1} />
        {topFrame && (
          <g>
            <rect x={mainFrame.x} y={js.y + 28} width={mainFrame.w} height={34} rx={4} fill={P.bg} stroke={P.line} strokeDasharray="3 3" />
            <text x={mainFrame.x + 10} y={js.y + 49} fill={P.text} fontSize={10} fontFamily={P.mono}>
              {topFrame}
            </text>
          </g>
        )}
        {step >= 1 && step <= 4 && (
          <g>
            <rect x={mainFrame.x} y={mainFrame.y} width={mainFrame.w} height={40} rx={4} fill={P.bg} stroke={P.lineStrong} />
            <text x={mainFrame.x + 8} y={mainFrame.y + 24} fill={P.text} fontSize={10} fontFamily={P.mono}>
              main
            </text>
            {hasArgs && <Cell {...slot(0)} text="args ●" tone={tone(1)} />}
            {hasP && <Cell {...slot(1)} text="p ●" tone={tone(2)} />}
            {hasS && <Cell {...slot(2)} text="s ●" tone={tone(3)} />}
          </g>
        )}
        {step === 5 && (
          <text x={js.x + 12} y={js.y + 96} fill={P.muted} fontSize={10} fontFamily={P.mono}>
            empty: main returned, thread ended
          </text>
        )}

        {/* References from the stack into the heap */}
        {hasArgs && (
          <line x1={slot(0).x + 40} y1={slot(0).y} x2={argsObj.x + 40} y2={argsObj.y + 22} stroke={P.blueSoft} strokeWidth={1} strokeDasharray="2 3" markerEnd="url(#jm-arrow)" />
        )}
        {hasP && <line x1={slot(1).x + 30} y1={slot(1).y} x2={personObj.x + 40} y2={personObj.y + 46} stroke={P.blueSoft} strokeWidth={1.2} markerEnd="url(#jm-arrow)" />}
        {hasS && <line x1={slot(2).x + 30} y1={slot(2).y} x2={aliObj.x + 40} y2={aliObj.y + 22} stroke={P.blueSoft} strokeWidth={1.2} markerEnd="url(#jm-arrow)" />}

        {/* pc register */}
        <Box {...pc} label="pc register" sub="" active={step >= 1 && step <= 4} />
        <text x={pc.x + 10} y={pc.y + 40} fill={P.text} fontSize={9} fontFamily={P.mono}>
          next
        </text>
        <text x={pc.x + 10} y={pc.y + 52} fill={P.text} fontSize={9} fontFamily={P.mono}>
          instruction
        </text>
        <text x={pc.x + 10} y={pc.y + 66} fill={step >= 1 && step <= 4 ? P.blueSoft : P.muted} fontSize={11} fontFamily={P.mono}>
          {step >= 1 && step <= 4 ? `line ${cur.line + 1}` : "(none)"}
        </text>
        <text x={pc.x + 10} y={pc.y + 104} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          per thread
        </text>

        {/* Native method stack */}
        <Box {...ns} label="native stack" sub="" active={step === 4} />
        <text x={ns.x + 10} y={ns.y + 44} fill={P.text} fontSize={9} fontFamily={P.mono}>
          C code the
        </text>
        <text x={ns.x + 10} y={ns.y + 57} fill={P.text} fontSize={9} fontFamily={P.mono}>
          JDK calls
        </text>
        {step === 4 && <Cell x={ns.x + 8} y={ns.y + 68} w={ns.w - 16} text="write()" tone="new" />}
        <text x={ns.x + 10} y={ns.y + 104} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          per thread
        </text>

        {/* Row labels */}
        <text x={16} y={156} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          shared by all threads ↑ · one per thread ↓
        </text>
      </svg>

      <p className="text-label-14 mt-3 font-mono text-gray-1000">{cur.title}</p>
      <p className="text-copy-14 mt-1 text-gray-900">{cur.say}</p>
    </Figure>
  );
}

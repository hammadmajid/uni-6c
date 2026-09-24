"use client";

import { Lab, SegmentRow, useExplorationState } from "@/components/learning/Controls";
import { P } from "@/components/learning/Figure";

type Op = "and" | "or" | "sub" | "xor";

const SEM1 = ["Programming", "Calculus", "Physics", "English"];
const SEM2 = ["Data Structures", "Calculus", "English", "Discrete Maths"];

const OPS: Record<Op, { sym: string; method: string; words: string; region: { left: boolean; mid: boolean; right: boolean } }> = {
  and: { sym: "&", method: "intersection", words: "in both", region: { left: false, mid: true, right: false } },
  or: { sym: "|", method: "union", words: "in either", region: { left: true, mid: true, right: true } },
  sub: { sym: "-", method: "difference", words: "in sem1 but not sem2", region: { left: true, mid: false, right: false } },
  xor: { sym: "^", method: "symmetric_difference", words: "in exactly one", region: { left: true, mid: false, right: true } },
};

const W = 640;
const H = 250;
const R = 105;
const CX1 = 250;
const CX2 = 390;
const CY = 125;

/** Venn diagram of Lab Task 1's two semesters; pick an operator and the matching region lights up. */
export function SetOpsLab() {
  const { values: v, set, reset } = useExplorationState({ setOp: "and" as Op });
  const op = OPS[v.setOp as Op] ?? OPS.and;
  const onlyLeft = SEM1.filter((c) => !SEM2.includes(c));
  const both = SEM1.filter((c) => SEM2.includes(c));
  const onlyRight = SEM2.filter((c) => !SEM1.includes(c));
  const result = [...(op.region.left ? onlyLeft : []), ...(op.region.mid ? both : []), ...(op.region.right ? onlyRight : [])].sort();
  const lit = "rgba(0,112,243,0.28)";

  return (
    <Lab
      title="Set algebra on two semesters"
      subtitle="Each operator is a region of the Venn diagram. Lab Task 1, question 2, is one of them."
      onReset={reset}
      controls={
        <div className="full">
          <SegmentRow
            label="Operator"
            value={v.setOp as Op}
            options={[
              { value: "and", label: "&  both" },
              { value: "or", label: "|  either" },
              { value: "sub", label: "-  only sem1" },
              { value: "xor", label: "^  exactly one" },
            ]}
            onChange={(x) => set("setOp", x)}
          />
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Venn diagram, ${op.words}`}>
        <defs>
          <clipPath id="so-c1">
            <circle cx={CX1} cy={CY} r={R} />
          </clipPath>
          <clipPath id="so-c2">
            <circle cx={CX2} cy={CY} r={R} />
          </clipPath>
          <mask id="so-not2">
            <rect x={0} y={0} width={W} height={H} fill="white" />
            <circle cx={CX2} cy={CY} r={R} fill="black" />
          </mask>
          <mask id="so-not1">
            <rect x={0} y={0} width={W} height={H} fill="white" />
            <circle cx={CX1} cy={CY} r={R} fill="black" />
          </mask>
        </defs>
        {op.region.left && <circle cx={CX1} cy={CY} r={R} fill={lit} mask="url(#so-not2)" />}
        {op.region.right && <circle cx={CX2} cy={CY} r={R} fill={lit} mask="url(#so-not1)" />}
        {op.region.mid && <circle cx={CX2} cy={CY} r={R} fill={lit} clipPath="url(#so-c1)" />}
        <circle cx={CX1} cy={CY} r={R} fill="none" stroke={P.lineStrong} strokeWidth={1.5} />
        <circle cx={CX2} cy={CY} r={R} fill="none" stroke={P.lineStrong} strokeWidth={1.5} />
        <text x={CX1 - 80} y={24} fill={P.text} fontSize={11} fontFamily={P.mono}>
          sem1
        </text>
        <text x={CX2 + 50} y={24} fill={P.text} fontSize={11} fontFamily={P.mono}>
          sem2
        </text>
        {onlyLeft.map((c, i) => (
          <text key={c} x={CX1 - 50} y={CY - 8 + i * 18} textAnchor="middle" fill={op.region.left ? P.textStrong : P.muted} fontSize={11}>
            {c}
          </text>
        ))}
        {both.map((c, i) => (
          <text key={c} x={(CX1 + CX2) / 2} y={CY - 8 + i * 18} textAnchor="middle" fill={op.region.mid ? P.textStrong : P.muted} fontSize={11}>
            {c}
          </text>
        ))}
        {onlyRight.map((c, i) => (
          <text key={c} x={CX2 + 50} y={CY - 8 + i * 18} textAnchor="middle" fill={op.region.right ? P.textStrong : P.muted} fontSize={11}>
            {c}
          </text>
        ))}
      </svg>
      <div className="rounded-md border border-gray-400 bg-background-100 px-3 py-2.5 font-mono text-[13px]">
        <p className="text-gray-700">
          sem1 {op.sym} sem2 <span className="text-gray-600"># same as sem1.{op.method}(sem2)</span>
        </p>
        <p className="mt-1 text-blue-600">
          {"{"}
          {result.map((c) => `'${c}'`).join(", ")}
          {"}"}
        </p>
      </div>
      <p className="text-copy-13 mt-2 text-gray-600">Sets have no order, so Python may print these in any order, and a different order on the next run. Wrap in sorted() when output order matters.</p>
    </Lab>
  );
}

import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 250;

const cells: { x: number; y: number; label: string; sub: string; tone: "blue" | "green" | "amber" | "gray" }[] = [
  { x: 24, y: 20, label: "Maintainability", sub: "cheap to change as needs move", tone: "blue" },
  { x: 332, y: 20, label: "Dependability & security", sub: "no failures, no data leaks, safe", tone: "green" },
  { x: 24, y: 130, label: "Efficiency", sub: "no wasted CPU, memory, power", tone: "amber" },
  { x: 332, y: 130, label: "Acceptability", sub: "understandable, usable, compatible", tone: "gray" },
];

const strokes = { blue: P.blue, green: P.green, amber: P.amber, gray: P.lineStrong };
const fills = { blue: "rgba(0,112,243,0.10)", green: "rgba(70,167,88,0.08)", amber: "rgba(255,178,36,0.08)", gray: P.panel };
const colors = { blue: P.blueSoft, green: P.greenSoft, amber: P.amberSoft, gray: P.textStrong };

/** Static figure: Sommerville's four essential attributes of good software. */
export function SeQualityAttributes() {
  const w = 284;
  const h = 92;
  return (
    <Figure
      title="Four attributes of good software (Sommerville)"
      caption={
        <>
          Not &quot;does it work today&quot; but &quot;is it good software&quot;. All four are <strong>non-functional</strong>: they say nothing about what
          the program computes, only about how well it lives in the world. A coder already optimises for three of them by instinct; the exam wants all four
          named.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Maintainability, dependability and security, efficiency, acceptability">
        {cells.map((c) => (
          <g key={c.label}>
            <rect x={c.x} y={c.y} width={w} height={h} rx={7} fill={fills[c.tone]} stroke={strokes[c.tone]} />
            <text x={c.x + 16} y={c.y + 38} fill={colors[c.tone]} fontSize={15}>
              {c.label}
            </text>
            <text x={c.x + 16} y={c.y + 64} fill={P.muted} fontSize={11} fontFamily={P.mono}>
              {c.sub}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  );
}

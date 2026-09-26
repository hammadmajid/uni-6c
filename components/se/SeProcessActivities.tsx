import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 220;

const steps: { label: string; sub: string }[] = [
  { label: "Specification", sub: "what & constraints" },
  { label: "Development", sub: "design + code" },
  { label: "Validation", sub: "does it do it" },
  { label: "Evolution", sub: "change over time" },
];

/** Static figure: Sommerville's four generic process activities, in sequence, with the evolution loop-back. */
export function SeProcessActivities() {
  const w = 128;
  const h = 58;
  const y = 60;
  const gap = (W - 32 - steps.length * w) / (steps.length - 1);
  const xs = steps.map((_, i) => 16 + i * (w + gap));
  return (
    <Figure
      title="The four generic process activities"
      caption={
        <>
          Every process model, from waterfall to agile, is a different way of <strong>arranging these same four activities</strong>. Waterfall runs them once
          left-to-right; incremental interleaves them and repeats. Evolution is not a coda: the loop back to specification is where most of a system&apos;s
          life and cost actually happen.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Specification, development, validation and evolution as a loop">
        <defs>
          <marker id="se-act-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.text} />
          </marker>
          <marker id="se-act-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.amber} />
          </marker>
        </defs>

        {steps.map((s, i) => {
          const tone = i === 3 ? P.amber : P.blue;
          const fill = i === 3 ? "rgba(255,178,36,0.08)" : "rgba(0,112,243,0.10)";
          const color = i === 3 ? P.amberSoft : P.blueSoft;
          return (
            <g key={s.label}>
              <rect x={xs[i]} y={y} width={w} height={h} rx={6} fill={fill} stroke={tone} />
              <text x={xs[i] + w / 2} y={y + 26} textAnchor="middle" fill={color} fontSize={13}>
                {s.label}
              </text>
              <text x={xs[i] + w / 2} y={y + 44} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
                {s.sub}
              </text>
              {i < steps.length - 1 && (
                <path d={`M ${xs[i] + w} ${y + h / 2} H ${xs[i + 1] - 2}`} fill="none" stroke={P.text} strokeWidth={1.3} markerEnd="url(#se-act-arrow)" />
              )}
            </g>
          );
        })}

        {/* evolution feedback loop back to specification */}
        <path
          d={`M ${xs[3] + w / 2} ${y + h} V 172 H ${xs[0] + w / 2} V ${y + h + 2}`}
          fill="none"
          stroke={P.amber}
          strokeWidth={1.3}
          strokeDasharray="5 4"
          markerEnd="url(#se-act-arrow-amber)"
        />
        <text x={W / 2} y={190} textAnchor="middle" fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
          new and changed requirements feed back in
        </text>
      </svg>
    </Figure>
  );
}

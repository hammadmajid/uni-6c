import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 300;

const phases: { label: string; sub: string }[] = [
  { label: "Requirements definition", sub: "SRS document" },
  { label: "System & software design", sub: "architecture, DDS" },
  { label: "Implementation & unit test", sub: "code + unit tests" },
  { label: "Integration & system test", sub: "the whole thing" },
  { label: "Operation & maintenance", sub: "live, then fixes" },
];

/** Static figure: the waterfall model as a cascade with limited back-flow. */
export function SeWaterfallModel() {
  const w = 196;
  const h = 42;
  const dx = 92;
  const dy = 50;
  const x0 = 18;
  const y0 = 16;
  const pos = phases.map((_, i) => ({ x: x0 + i * dx, y: y0 + i * dy }));
  return (
    <Figure
      title="The waterfall model"
      caption={
        <>
          Each phase finishes and signs off a document before the next begins, so the flow is one-way, like water falling. The dashed arrows are the only
          feedback the model allows: you can step back one phase, but going from a testing failure back to a requirements mistake is expensive. Use it only
          when requirements are <strong>fixed and well understood</strong>.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Five waterfall phases cascading down and to the right">
        <defs>
          <marker id="se-wf-fwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.blueSoft} />
          </marker>
          <marker id="se-wf-back" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.amber} />
          </marker>
        </defs>

        {pos.map((p, i) => (
          <g key={phases[i].label}>
            {/* forward flow: from this box down to the next */}
            {i < phases.length - 1 && (
              <path
                d={`M ${p.x + w * 0.62} ${p.y + h} V ${pos[i + 1].y + h / 2} H ${pos[i + 1].x - 2}`}
                fill="none"
                stroke={P.blueSoft}
                strokeWidth={1.5}
                markerEnd="url(#se-wf-fwd)"
              />
            )}
            {/* limited feedback: next box back up to this one */}
            {i < phases.length - 1 && (
              <path
                d={`M ${pos[i + 1].x + w * 0.34} ${pos[i + 1].y} V ${p.y + h - 2}`}
                fill="none"
                stroke={P.amber}
                strokeWidth={1.1}
                strokeDasharray="4 3"
                markerEnd="url(#se-wf-back)"
              />
            )}
          </g>
        ))}

        {pos.map((p, i) => (
          <g key={`box-${phases[i].label}`}>
            <rect x={p.x} y={p.y} width={w} height={h} rx={6} fill="rgba(0,112,243,0.10)" stroke={P.blue} />
            <text x={p.x + 14} y={p.y + 19} fill={P.textStrong} fontSize={12}>
              {phases[i].label}
            </text>
            <text x={p.x + 14} y={p.y + 34} fill={P.muted} fontSize={9.5} fontFamily={P.mono}>
              {phases[i].sub}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  );
}

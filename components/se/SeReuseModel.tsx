import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 250;

type Cell = { id: string; label: string; sub: string; x: number; y: number; tone: "blue" | "green" | "gray" };

/** Static figure: reuse-oriented (integration and configuration) software engineering. */
export function SeReuseModel() {
  const w = 184;
  const h = 50;
  const row1 = 30;
  const row2 = 150;
  const xs = [16, 228, 440];
  const cells: Cell[] = [
    { id: "spec", label: "Requirements spec", sub: "what we need", x: xs[0], y: row1, tone: "gray" },
    { id: "disc", label: "Software discovery", sub: "find candidate parts", x: xs[1], y: row1, tone: "blue" },
    { id: "eval", label: "Software evaluation", sub: "do they fit?", x: xs[2], y: row1, tone: "blue" },
    { id: "refine", label: "Requirements refinement", sub: "bend needs to fit parts", x: xs[2], y: row2, tone: "gray" },
    { id: "config", label: "Configure / integrate", sub: "adapt & wire together", x: xs[1], y: row2, tone: "blue" },
    { id: "final", label: "Final system", sub: "mostly assembled, not written", x: xs[0], y: row2, tone: "green" },
  ];
  const strokes = { blue: P.blue, green: P.green, gray: P.lineStrong };
  const fills = { blue: "rgba(0,112,243,0.10)", green: "rgba(70,167,88,0.08)", gray: P.panel };
  const colors = { blue: P.blueSoft, green: P.greenSoft, gray: P.textStrong };
  return (
    <Figure
      title="Integration and configuration (reuse-oriented)"
      caption={
        <>
          You write almost no new code. The system is <strong>assembled</strong> from existing parts, so a step other models do not have shows up:
          <strong> requirements refinement</strong>, where you bend the spec to fit what off-the-shelf components can already do. Any engineer who has built a
          product on a framework, a CMS or cloud services has used this model.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Reuse-oriented pipeline from requirements to an assembled final system">
        <defs>
          <marker id="se-re-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.text} />
          </marker>
        </defs>

        {/* flow arrows: A->B->C down to D, D->E->F (serpentine) */}
        <path d={`M ${xs[0] + w} ${row1 + h / 2} H ${xs[1] - 2}`} fill="none" stroke={P.text} strokeWidth={1.3} markerEnd="url(#se-re-arrow)" />
        <path d={`M ${xs[1] + w} ${row1 + h / 2} H ${xs[2] - 2}`} fill="none" stroke={P.text} strokeWidth={1.3} markerEnd="url(#se-re-arrow)" />
        <path d={`M ${xs[2] + w / 2} ${row1 + h} V ${row2 - 2}`} fill="none" stroke={P.text} strokeWidth={1.3} markerEnd="url(#se-re-arrow)" />
        <path d={`M ${xs[2]} ${row2 + h / 2} H ${xs[1] + w + 2}`} fill="none" stroke={P.text} strokeWidth={1.3} markerEnd="url(#se-re-arrow)" />
        <path d={`M ${xs[1]} ${row2 + h / 2} H ${xs[0] + w + 2}`} fill="none" stroke={P.text} strokeWidth={1.3} markerEnd="url(#se-re-arrow)" />

        {cells.map((c) => (
          <g key={c.id}>
            <rect x={c.x} y={c.y} width={w} height={h} rx={6} fill={fills[c.tone]} stroke={strokes[c.tone]} />
            <text x={c.x + w / 2} y={c.y + 22} textAnchor="middle" fill={colors[c.tone]} fontSize={12}>
              {c.label}
            </text>
            <text x={c.x + w / 2} y={c.y + 39} textAnchor="middle" fill={P.muted} fontSize={9.5} fontFamily={P.mono}>
              {c.sub}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  );
}

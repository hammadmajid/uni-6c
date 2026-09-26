import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 300;

/** Static figure: where the three models sit on requirements-stability vs delivery-cadence. */
export function SeModelFit() {
  const plot = { x: 92, y: 28, w: 520, h: 210 };
  const nodes = [
    { label: "Waterfall", sub: "stable reqs, one late delivery", cx: 188, cy: 180, tone: "blue" as const },
    { label: "Integration & configuration", sub: "reuse drives the schedule", cx: 330, cy: 116, tone: "amber" as const },
    { label: "Incremental", sub: "volatile reqs, ship often", cx: 500, cy: 56, tone: "green" as const },
  ];
  const strokes = { blue: P.blue, green: P.green, amber: P.amber };
  const fills = { blue: "rgba(0,112,243,0.10)", green: "rgba(70,167,88,0.08)", amber: "rgba(255,178,36,0.08)" };
  const colors = { blue: P.blueSoft, green: P.greenSoft, amber: P.amberSoft };
  const bw = 172;
  const bh = 40;
  return (
    <Figure
      title="Which model, and when"
      caption={
        <>
          One picture for the exam&apos;s favourite question. Move <strong>right</strong> as requirements get more uncertain, move <strong>up</strong> as you
          need to ship and get feedback sooner. Waterfall lives bottom-left (fixed, one big delivery); incremental lives top-right (changing, deliver often);
          reuse sits between, its schedule set by what you can find off the shelf.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Waterfall, reuse and incremental plotted by requirements stability and delivery cadence">
        <defs>
          <marker id="se-fit-axis" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.muted} />
          </marker>
        </defs>

        {/* axes */}
        <path d={`M ${plot.x} ${plot.y} V ${plot.y + plot.h + 4}`} fill="none" stroke={P.muted} strokeWidth={1.2} markerStart="url(#se-fit-axis)" />
        <path d={`M ${plot.x - 4} ${plot.y + plot.h} H ${plot.x + plot.w}`} fill="none" stroke={P.muted} strokeWidth={1.2} markerEnd="url(#se-fit-axis)" />

        {/* y-axis labels */}
        <text x={plot.x - 8} y={plot.y + 10} textAnchor="end" fill={P.text} fontSize={10} fontFamily={P.mono}>
          deliver often
        </text>
        <text x={plot.x - 8} y={plot.y + plot.h - 2} textAnchor="end" fill={P.text} fontSize={10} fontFamily={P.mono}>
          deliver late
        </text>

        {/* x-axis labels */}
        <text x={plot.x} y={plot.y + plot.h + 22} fill={P.text} fontSize={10} fontFamily={P.mono}>
          requirements stable
        </text>
        <text x={plot.x + plot.w} y={plot.y + plot.h + 22} textAnchor="end" fill={P.text} fontSize={10} fontFamily={P.mono}>
          requirements volatile
        </text>

        {nodes.map((n) => {
          const bx = Math.min(Math.max(n.cx - bw / 2, plot.x + 4), plot.x + plot.w - bw - 4);
          const by = n.cy + 12;
          return (
            <g key={n.label}>
              <circle cx={n.cx} cy={n.cy} r={6} fill={strokes[n.tone]} />
              <rect x={bx} y={by} width={bw} height={bh} rx={6} fill={fills[n.tone]} stroke={strokes[n.tone]} />
              <text x={bx + bw / 2} y={by + 17} textAnchor="middle" fill={colors[n.tone]} fontSize={11.5}>
                {n.label}
              </text>
              <text x={bx + bw / 2} y={by + 31} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {n.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

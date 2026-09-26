import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 250;

/** Static figure: Pressman's layered-technology view of software engineering. */
export function SeLayeredTechnology() {
  const layers: { label: string; sub: string; w: number; tone: "blue" | "green" | "amber" | "gray" }[] = [
    { label: "Tools", sub: "IntelliJ, Git, CI, profilers", w: 240, tone: "blue" },
    { label: "Methods", sub: "how to do each activity: analyse, design, test", w: 340, tone: "green" },
    { label: "Process", sub: "the framework that holds the methods together", w: 440, tone: "amber" },
    { label: "A quality focus", sub: "the bedrock: total quality management culture", w: 540, tone: "gray" },
  ];
  const strokes = { blue: P.blue, green: P.green, amber: P.amber, gray: P.lineStrong };
  const fills = { blue: "rgba(0,112,243,0.10)", green: "rgba(70,167,88,0.08)", amber: "rgba(255,178,36,0.08)", gray: P.panel };
  const colors = { blue: P.blueSoft, green: P.greenSoft, amber: P.amberSoft, gray: P.textStrong };
  const h = 44;
  const gap = 10;
  return (
    <Figure
      title="Software engineering as a layered technology"
      caption={
        <>
          Read it bottom-up, like a stack. Each layer rests on the one below: tools automate methods, methods run inside a process, and none of it means
          anything without a <strong>quality focus</strong> underneath. The instructor&apos;s slides call this &quot;a layered technology&quot;; it is
          Pressman&apos;s framing.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Quality focus, process, methods and tools as stacked layers">
        {layers.map((l, i) => {
          const y = 16 + i * (h + gap);
          const x = (W - l.w) / 2;
          return (
            <g key={l.label}>
              <rect x={x} y={y} width={l.w} height={h} rx={6} fill={fills[l.tone]} stroke={strokes[l.tone]} />
              <text x={W / 2} y={y + 20} textAnchor="middle" fill={colors[l.tone]} fontSize={13}>
                {l.label}
              </text>
              <text x={W / 2} y={y + 36} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
                {l.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

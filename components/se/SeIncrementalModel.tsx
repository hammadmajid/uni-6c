import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 250;

/** Static figure: incremental development, Sommerville's interleaved-activities form. */
export function SeIncrementalModel() {
  const acts = [
    { label: "Specification", y: 24 },
    { label: "Development", y: 96 },
    { label: "Validation", y: 168 },
  ];
  const outs = [
    { label: "Initial version", y: 24, tone: "amber" as const },
    { label: "Intermediate versions", y: 96, tone: "amber" as const },
    { label: "Final version", y: 168, tone: "green" as const },
  ];
  const groupX = 150;
  const groupW = 236;
  const aw = 200;
  const ah = 44;
  const ax = groupX + (groupW - aw) / 2;
  const ow = 156;
  const ox = 462;
  return (
    <Figure
      title="Incremental development"
      caption={
        <>
          The three activities are not phases in a line, they run <strong>concurrently</strong> and feed each other (the vertical arrows). Each pass ships a
          real, running version; the customer uses it and the next increment folds in what they learned. This is how you already work: merge a small slice,
          deploy, get feedback, repeat.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Concurrent specification, development and validation producing successive versions">
        <defs>
          <marker id="se-inc-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.blueSoft} />
          </marker>
          <marker id="se-inc-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.text} />
          </marker>
        </defs>

        {/* outline input */}
        <rect x={16} y={96} width={104} height={44} rx={6} fill={P.panel} stroke={P.lineStrong} />
        <text x={68} y={114} textAnchor="middle" fill={P.textStrong} fontSize={11}>
          Outline
        </text>
        <text x={68} y={129} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
          description
        </text>
        <path d={`M 120 118 H ${groupX - 2}`} fill="none" stroke={P.text} strokeWidth={1.3} markerEnd="url(#se-inc-g)" />

        {/* concurrent-activities container */}
        <rect x={groupX} y={12} width={groupW} height={216} rx={9} fill="none" stroke={P.line} strokeDasharray="5 4" />
        <text x={groupX + 8} y={224} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          concurrent activities
        </text>

        {acts.map((a, i) => (
          <g key={a.label}>
            <rect x={ax} y={a.y} width={aw} height={ah} rx={6} fill="rgba(0,112,243,0.10)" stroke={P.blue} />
            <text x={ax + aw / 2} y={a.y + 27} textAnchor="middle" fill={P.blueSoft} fontSize={12}>
              {a.label}
            </text>
            {/* two-way link to the activity below */}
            {i < acts.length - 1 && (
              <>
                <path d={`M ${ax + aw / 2 - 10} ${a.y + ah} V ${acts[i + 1].y - 2}`} fill="none" stroke={P.blueSoft} strokeWidth={1.2} markerEnd="url(#se-inc-b)" />
                <path d={`M ${ax + aw / 2 + 10} ${acts[i + 1].y} V ${a.y + ah + 2}`} fill="none" stroke={P.blueSoft} strokeWidth={1.2} markerEnd="url(#se-inc-b)" />
              </>
            )}
          </g>
        ))}

        {/* outputs: successive running versions, all emitted by the development activity */}
        {outs.map((o) => {
          const stroke = o.tone === "green" ? P.green : P.amber;
          const fill = o.tone === "green" ? "rgba(70,167,88,0.08)" : "rgba(255,178,36,0.08)";
          const color = o.tone === "green" ? P.greenSoft : P.amberSoft;
          return (
            <g key={o.label}>
              <path d={`M ${ax + aw} 118 H ${ox - 26} V ${o.y + ah / 2} H ${ox - 2}`} fill="none" stroke={P.text} strokeWidth={1.2} markerEnd="url(#se-inc-g)" />
              <rect x={ox} y={o.y} width={ow} height={ah} rx={6} fill={fill} stroke={stroke} />
              <text x={ox + ow / 2} y={o.y + 27} textAnchor="middle" fill={color} fontSize={11.5}>
                {o.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

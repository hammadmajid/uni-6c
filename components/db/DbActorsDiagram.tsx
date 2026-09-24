import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 300;

/** Static figure after the lecture's "Component of Database Application": which actor works on which layer. */
export function DbActorsDiagram() {
  const sx = 40;
  const sw = 200;
  const layers = [
    { y: 34, name: "Application program", sub: "your servlet, the ATM screens", color: P.blue },
    { y: 124, name: "DBMS", sub: "PostgreSQL, Oracle, MySQL", color: P.amber },
    { y: 214, name: "Database", sub: "schema + the stored data", color: P.green },
  ];
  const px = 400;
  const pw = 224;
  const people: { y: number; name: string; verb: string; to: number; sub: string; lt?: number; dashed?: boolean }[] = [
    { y: 18, name: "End users", verb: "use", to: 0, sub: "casual · naive · soph. · standalone" },
    { y: 74, name: "Analysts, app programmers", verb: "specify, build", to: 0, sub: "canned transactions" },
    { y: 140, name: "DBA", verb: "administer", to: 1, sub: "access, backup, tuning" },
    { y: 206, name: "Database designer", verb: "design", lt: 0.28, to: 2, sub: "tables, keys, constraints" },
    { y: 252, name: "Workers behind the scene", verb: "build", lt: 0.62, to: 1, sub: "DBMS implementers, tool makers", dashed: true },
  ];

  return (
    <Figure
      title="Who works on which part"
      caption={
        <>
          Everyone in a solid box is one of Elmasri&apos;s <em>actors on the scene</em>: their jobs involve the content of this particular database. The dashed row builds the DBMS software itself and never sees your data: <em>workers behind the scene</em>.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Actors connected to application program, DBMS and database">
        <defs>
          <marker id="act-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={P.lineStrong} />
          </marker>
        </defs>

        {layers.map((l, i) => (
          <g key={l.name}>
            <rect x={sx} y={l.y} width={sw} height={56} rx={6} fill={P.panel} stroke={l.color} />
            <text x={sx + 14} y={l.y + 24} fill={P.textStrong} fontSize={12}>
              {l.name}
            </text>
            <text x={sx + 14} y={l.y + 41} fill={P.muted} fontSize={9} fontFamily={P.mono}>
              {l.sub}
            </text>
            {i < layers.length - 1 && <line x1={sx + sw / 2} y1={l.y + 58} x2={sx + sw / 2} y2={layers[i + 1].y - 2} stroke={P.lineStrong} strokeWidth={2} />}
          </g>
        ))}
        <text x={sx} y={20} fill={P.text} fontSize={10} fontFamily={P.mono}>
          software and data
        </text>

        {people.map((p) => {
          const target = layers[p.to];
          const ty = target.y + 28;
          const py = p.y + 17;
          return (
            <g key={p.name}>
              <line
                x1={px - 4}
                y1={py}
                x2={sx + sw + 6}
                y2={ty}
                stroke={p.dashed ? P.muted : P.lineStrong}
                strokeDasharray={p.dashed ? "4 4" : undefined}
                markerEnd="url(#act-arrow)"
              />
              <text x={px - 4 + (sx + sw + 6 - (px - 4)) * (p.lt ?? 0.5)} y={py + (ty - py) * (p.lt ?? 0.5) - 5} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
                {p.verb}
              </text>
              <rect x={px} y={p.y} width={pw} height={36} rx={6} fill={P.panel} stroke={p.dashed ? P.muted : P.lineStrong} strokeDasharray={p.dashed ? "4 3" : undefined} />
              <text x={px + 10} y={p.y + 15} fill={p.dashed ? P.text : P.textStrong} fontSize={11}>
                {p.name}
              </text>
              <text x={px + 10} y={p.y + 29} fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {p.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

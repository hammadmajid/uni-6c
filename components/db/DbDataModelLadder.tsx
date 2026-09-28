import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 340;

const BANDS = [
  {
    y: 20,
    name: "High-level",
    alias: "conceptual",
    color: P.blue,
    fill: "rgba(0,112,243,0.08)",
    speaks: "entities · attributes · relationships",
    models: ["ER model", "OO model"],
    who: "users, analysts",
  },
  {
    y: 120,
    name: "Representational",
    alias: "implementation / logical",
    color: P.amber,
    fill: "rgba(255,178,36,0.08)",
    speaks: "records: rows, columns, links",
    models: ["relational", "network", "hierarchical"],
    who: "users and the DBMS",
  },
  {
    y: 220,
    name: "Low-level",
    alias: "physical",
    color: P.green,
    fill: "rgba(70,167,88,0.08)",
    speaks: "record formats · ordering · access paths",
    models: ["files", "B-tree index", "data blocks"],
    who: "DBMS, specialists",
  },
];

/** Static figure: Elmasri's three categories of data model as a ladder from "how users see it" to "how the disk stores it", with the lecture's models placed on the right rung. */
export function DbDataModelLadder() {
  const bx = 150;
  const bw = 400;
  const bh = 84;

  return (
    <Figure
      title="Three categories of data model, by how close they sit to the user"
      caption={
        <>
          The higher the rung, the closer to how people think; the lower, the closer to how the disk works. Representational models sit in between: an end user can read a
          table, and the DBMS can store it directly. Object-oriented models straddle the top two rungs, and the lecture&apos;s <em>semi-structured</em> model (JSON, XML) is a
          self-describing representational model.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="High-level, representational and low-level data models">
        <defs>
          <marker id="dml-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={P.lineStrong} />
          </marker>
        </defs>

        {/* Axis */}
        <line x1={40} y1={34} x2={40} y2={292} stroke={P.lineStrong} markerStart="url(#dml-arrow)" markerEnd="url(#dml-arrow)" />
        <text x={40} y={16} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
          people
        </text>
        <text x={40} y={312} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
          disk
        </text>
        <text x={60} y={166} fill={P.muted} fontSize={9} fontFamily={P.mono} transform="rotate(-90 60 166)" textAnchor="middle">
          more abstraction
        </text>

        {BANDS.map((b) => (
          <g key={b.name}>
            <rect x={bx - 70} y={b.y} width={bw + 70} height={bh} rx={6} fill={b.fill} stroke={b.color} />
            <text x={bx - 58} y={b.y + 26} fill={P.textStrong} fontSize={12}>
              {b.name}
            </text>
            <text x={bx - 58} y={b.y + 42} fill={P.text} fontSize={9} fontFamily={P.mono}>
              {b.alias}
            </text>
            <text x={bx - 58} y={b.y + 70} fill={P.muted} fontSize={9} fontFamily={P.mono}>
              read by: {b.who}
            </text>
            <text x={bx + 110} y={b.y + 26} fill={P.text} fontSize={10} fontFamily={P.mono}>
              {b.speaks}
            </text>
            {b.models.map((m, i) => (
              <g key={m}>
                <rect x={bx + 110 + i * 92} y={b.y + 42} width={86} height={26} rx={13} fill={P.panel} stroke={b.color} />
                <text x={bx + 153 + i * 92} y={b.y + 59} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
                  {m}
                </text>
              </g>
            ))}
          </g>
        ))}

        {/* Semi-structured sits beside the representational rung, self-describing */}
        <text x={bx + bw + 8} y={20 + 46} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          ↕ OO
        </text>
        <text x={bx + bw + 8} y={20 + 60} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          straddles
        </text>
        <text x={bx + bw + 8} y={120 + 46} fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
          + semi-
        </text>
        <text x={bx + bw + 8} y={120 + 60} fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
          structured
        </text>
        <text x={bx + bw + 8} y={120 + 74} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          (JSON, XML)
        </text>

        <text x={bx - 70} y={330} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          design flows downward: ER diagram → relational tables → files and indexes
        </text>
      </svg>
    </Figure>
  );
}

import { Figure, P } from "@/components/learning/Figure";
import { ErAttr, ErEntity, ErLink } from "./erShapes";

const W = 640;
const H = 300;

/** Static figure: the EMPLOYEE example from DB lecture 03 slide 50, redrawn in clean Chen notation with every attribute type labelled. */
export function ErEmployeeDiagram() {
  const e = { x: 300, y: 150 };
  const attrs = [
    { x: 300, y: 50, label: "empId", kind: "key" as const, tag: "key", tx: 300, ty: 26 },
    { x: 460, y: 62, label: "empName", kind: "simple" as const, tag: "simple", tx: 460, ty: 38 },
    { x: 150, y: 62, label: "experience", kind: "derived" as const, tag: "derived", tx: 150, ty: 38 },
    { x: 110, y: 190, label: "dateHired", kind: "simple" as const, tag: "stored", tx: 110, ty: 222 },
    { x: 250, y: 252, label: "hobbies", kind: "multi" as const, tag: "multivalued", tx: 250, ty: 284 },
    { x: 480, y: 150, label: "address", kind: "simple" as const, tag: "composite", tx: 560, ty: 154 },
  ];
  const parts = [
    { x: 420, y: 252, label: "street" },
    { x: 545, y: 252, label: "houseNo" },
  ];

  return (
    <Figure
      title="EMPLOYEE in Chen notation (lecture 03, slide 50)"
      caption={
        <>
          One entity, every kind of attribute. The mono tags name each type. The <span className="text-amber-600">amber arrow</span> is not ER notation: it only
          shows where the derived attribute gets its value. The diagram shows that experience is derived, not the formula.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="EMPLOYEE entity with key, simple, derived, stored, multivalued and composite attributes">
        <defs>
          <marker id="eed-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={P.amber} />
          </marker>
        </defs>

        {attrs.map((a) => (
          <ErLink key={a.label} x1={e.x} y1={e.y} x2={a.x} y2={a.y} />
        ))}
        {parts.map((p) => (
          <ErLink key={p.label} x1={480} y1={150} x2={p.x} y2={p.y} hl />
        ))}

        {/* derived-from hint */}
        <path d="M 100 174 C 80 130, 100 100, 128 80" fill="none" stroke={P.amber} strokeDasharray="3 3" markerEnd="url(#eed-arrow)" />
        <text x={40} y={128} fill={P.amber} fontSize={9} fontFamily={P.mono}>
          computed
        </text>
        <text x={40} y={140} fill={P.amber} fontSize={9} fontFamily={P.mono}>
          from
        </text>

        <ErEntity x={e.x} y={e.y} label="EMPLOYEE" w={104} />
        {attrs.map((a) => (
          <g key={a.label}>
            <ErAttr x={a.x} y={a.y} label={a.label} kind={a.kind} hl={a.kind !== "simple"} rx={a.label === "address" ? 40 : undefined} />
            <text x={a.tx} y={a.ty} textAnchor={a.label === "address" ? "start" : "middle"} fill={P.muted} fontSize={9} fontFamily={P.mono}>
              {a.tag}
            </text>
          </g>
        ))}
        {parts.map((p) => (
          <g key={p.label}>
            <ErAttr x={p.x} y={p.y} label={p.label} />
            <text x={p.x} y={p.y + 32} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
              simple part
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  );
}

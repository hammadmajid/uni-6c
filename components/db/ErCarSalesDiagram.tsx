import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 520;

type Stage = "entities" | "relationships" | "full";

interface Ent {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
}
interface Attr {
  of: string;
  name: string;
  x: number;
  y: number;
  key?: boolean;
}
interface Rel {
  name: string;
  x: number;
  y: number;
  /** [entity id, cardinality label, total participation?] for each side */
  a: [string, string, boolean];
  b: [string, string, boolean];
}

const ENTS: Ent[] = [
  { id: "cust", name: "CUSTOMER", x: 120, y: 150, w: 120 },
  { id: "sp", name: "SALESPERSON", x: 520, y: 150, w: 120 },
  { id: "sale", name: "SALE", x: 320, y: 275, w: 110 },
  { id: "rs", name: "REPLACEMENT_SCHEME", x: 120, y: 400, w: 150 },
  { id: "car", name: "CAR", x: 520, y: 400, w: 110 },
];

const ATTRS: Attr[] = [
  { of: "cust", name: "CustomerNo", x: 58, y: 78, key: true },
  { of: "cust", name: "Name", x: 150, y: 64 },
  { of: "cust", name: "Address", x: 232, y: 96 },
  { of: "cust", name: "Phone", x: 40, y: 222 },
  { of: "sp", name: "SalespersonId", x: 572, y: 70, key: true },
  { of: "sp", name: "Name", x: 468, y: 64 },
  { of: "sp", name: "Phone", x: 404, y: 100 },
  { of: "sp", name: "Email", x: 600, y: 222 },
  { of: "sale", name: "SaleId", x: 320, y: 196, key: true },
  { of: "sale", name: "Commission", x: 320, y: 366 },
  { of: "rs", name: "SchemeNo", x: 56, y: 478, key: true },
  { of: "rs", name: "Name", x: 148, y: 494 },
  { of: "rs", name: "NoOfYears", x: 238, y: 468 },
  { of: "car", name: "CarCode", x: 402, y: 456, key: true },
  { of: "car", name: "Make", x: 432, y: 500 },
  { of: "car", name: "Model", x: 504, y: 504 },
  { of: "car", name: "YearOfManufacture", x: 578, y: 458 },
  { of: "car", name: "Price", x: 610, y: 400 },
];

const RELS: Rel[] = [
  { name: "BUYS", x: 220, y: 212, a: ["cust", "1", false], b: ["sale", "N", true] },
  { name: "MAKES", x: 420, y: 212, a: ["sp", "1", false], b: ["sale", "N", true] },
  { name: "PAID_UNDER", x: 220, y: 338, a: ["rs", "1", false], b: ["sale", "N", false] },
  { name: "FOR", x: 420, y: 338, a: ["car", "1", false], b: ["sale", "1", true] },
];

const ent = (id: string) => ENTS.find((e) => e.id === id)!;

/** A line between two points; doubled (two parallel strokes) for total participation. */
function Link({ x1, y1, x2, y2, total }: { x1: number; y1: number; x2: number; y2: number; total?: boolean }) {
  if (!total) return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.lineStrong} strokeWidth={1.2} />;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = (-(y2 - y1) / len) * 2.5;
  const ny = ((x2 - x1) / len) * 2.5;
  return (
    <g stroke={P.textStrong} strokeWidth={1.1}>
      <line x1={x1 + nx} y1={y1 + ny} x2={x2 + nx} y2={y2 + ny} />
      <line x1={x1 - nx} y1={y1 - ny} x2={x2 - nx} y2={y2 - ny} />
    </g>
  );
}

/** Model-answer Chen ER diagram for the lecture 03 car-sales case study, drawable in stages. */
export function ErCarSalesDiagram({ stage = "full" }: { stage?: Stage }) {
  const showAttrs = stage !== "relationships";
  const showRels = stage !== "entities";

  const title =
    stage === "entities" ? "Car sales, step 1: five entity types and their attributes" : stage === "relationships" ? "Car sales, step 2: relationships, cardinality, participation" : "Car sales: the complete ER diagram";

  const caption =
    stage === "entities" ? (
      <>
        Every noun that has its own identifier became a rectangle, and its <em>unique</em> attribute is underlined as the key. Commission sits on SALE, because it is
        paid per sale.
      </>
    ) : stage === "relationships" ? (
      <>
        One diamond per verb. <span className="text-amber-600">1 and N</span> are the cardinality ratio; a <span className="text-gray-1000">double line</span> means total
        participation (every SALE must have a customer, a salesperson and a car). The scheme line is single on both sides: paying in one go is allowed, and a scheme may
        never be chosen.
      </>
    ) : (
      <>
        The model answer. Keys underlined, <span className="text-amber-600">cardinality</span> beside each diamond, double lines for total participation. SALE is the hub:
        it is the only entity every other one connects to.
      </>
    );

  return (
    <Figure title={title} caption={caption}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Chen ER diagram of customers, salespeople, sales, cars and replacement schemes">
        {/* attribute links, under everything */}
        {showAttrs &&
          ATTRS.map((a) => {
            const e = ent(a.of);
            return <line key={a.of + a.name} x1={a.x} y1={a.y} x2={e.x} y2={e.y} stroke={P.line} strokeWidth={1} />;
          })}

        {/* relationship links */}
        {showRels &&
          RELS.map((r) =>
            [r.a, r.b].map(([id, , total]) => {
              const e = ent(id);
              return <Link key={r.name + id} x1={e.x} y1={e.y} x2={r.x} y2={r.y} total={total} />;
            }),
          )}

        {/* cardinality labels: on each entity–diamond segment, nudged off the line */}
        {showRels &&
          RELS.map((r) =>
            [r.a, r.b].map(([id, card]) => {
              const e = ent(id);
              const mx = r.x + (e.x - r.x) * 0.42;
              const my = r.y + (e.y - r.y) * 0.42;
              const len = Math.hypot(e.x - r.x, e.y - r.y);
              const ox = (-(e.y - r.y) / len) * 11;
              const oy = ((e.x - r.x) / len) * 11;
              return (
                <text key={r.name + id + "c"} x={mx + ox} y={my + oy + 4} textAnchor="middle" fill={P.amber} fontSize={12} fontWeight={600} fontFamily={P.mono}>
                  {card}
                </text>
              );
            }),
          )}

        {/* attributes */}
        {showAttrs &&
          ATTRS.map((a) => {
            const rx = Math.max(24, a.name.length * 3 + 8);
            return (
              <g key={a.of + a.name + "o"}>
                <ellipse cx={a.x} cy={a.y} rx={rx} ry={12} fill={P.bg} stroke={a.key ? P.textStrong : P.lineStrong} />
                <text
                  x={a.x}
                  y={a.y + 3.5}
                  textAnchor="middle"
                  fill={a.key ? P.textStrong : P.text}
                  fontSize={9.5}
                  fontFamily={P.mono}
                  textDecoration={a.key ? "underline" : undefined}
                >
                  {a.name}
                </text>
              </g>
            );
          })}

        {/* diamonds */}
        {showRels &&
          RELS.map((r) => {
            const hw = 50;
            const hh = 22;
            return (
              <g key={r.name + "d"}>
                <polygon points={`${r.x},${r.y - hh} ${r.x + hw},${r.y} ${r.x},${r.y + hh} ${r.x - hw},${r.y}`} fill={P.panel} stroke={P.amber} />
                <text x={r.x} y={r.y + 3.5} textAnchor="middle" fill={P.textStrong} fontSize={9.5} fontFamily={P.mono}>
                  {r.name}
                </text>
              </g>
            );
          })}

        {/* entities */}
        {ENTS.map((e) => (
          <g key={e.id}>
            <rect x={e.x - e.w / 2} y={e.y - 18} width={e.w} height={36} fill={P.panel} stroke={P.blue} strokeWidth={1.4} />
            <text x={e.x} y={e.y + 4} textAnchor="middle" fill={P.textStrong} fontSize={11} fontWeight={600} fontFamily={P.mono}>
              {e.name}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  );
}

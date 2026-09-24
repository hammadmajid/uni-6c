import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const COLS = [
  { name: "tuple", lit: "(1, 2)", tone: P.blueSoft },
  { name: "list", lit: "[1, 2]", tone: P.blueSoft },
  { name: "set", lit: "set(), {1, 2}", tone: P.amberSoft },
  { name: "dict", lit: "dict(), {k: v}", tone: P.amberSoft },
];
// yes / no / text per column
const ROWS: { label: string; cells: (boolean | string)[] }[] = [
  { label: "keeps insertion order", cells: [true, true, false, true] },
  { label: "mutable", cells: [false, true, true, true] },
  { label: "duplicates allowed", cells: [true, true, false, "keys: no"] },
  { label: "hashable (can be a key)", cells: ["if contents are", false, false, false] },
  { label: "x in c", cells: ["O(n) scan", "O(n) scan", "O(1) hash", "O(1) on keys"] },
  { label: "index by", cells: ["position", "position", "nothing", "key"] },
  { label: "reach for it when", cells: ["fixed record", "ordered, growing", "fast in, dedupe", "lookup by name"] },
];

const LABEL_W = 170;
const COL_W = (W - LABEL_W - 8) / COLS.length;
const ROW_H = 30;
const TOP = 52;
const H = TOP + ROWS.length * ROW_H + 12;

/** Static comparison grid: tuple, list, set, dict against the properties that decide which to use. */
export function CollectionsFigure() {
  return (
    <Figure
      title="Four collections, seven questions"
      caption={
        <>
          Tuples and lists are sequences: ordered, indexed by position. Sets and dicts are hash tables (amber), which is why membership is O(1) and why their elements or keys must
          be hashable. Note that an empty pair of braces is an empty dict; the empty set has to be written set().
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Comparison of tuple, list, set and dict">
        {COLS.map((c, i) => {
          const x = LABEL_W + i * COL_W + COL_W / 2;
          return (
            <g key={c.name}>
              <text x={x} y={20} textAnchor="middle" fill={c.tone} fontSize={13} fontFamily={P.mono}>
                {c.name}
              </text>
              <text x={x} y={38} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
                {c.lit}
              </text>
            </g>
          );
        })}
        {ROWS.map((r, j) => {
          const y = TOP + j * ROW_H;
          return (
            <g key={r.label}>
              <line x1={0} x2={W} y1={y} y2={y} stroke={P.line} />
              <text x={4} y={y + 19} fill={P.text} fontSize={11}>
                {r.label}
              </text>
              {r.cells.map((cell, i) => {
                const x = LABEL_W + i * COL_W + COL_W / 2;
                if (typeof cell === "boolean") {
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y + 15} r={8} fill={cell ? "rgba(70,167,88,0.15)" : "rgba(229,72,77,0.12)"} stroke={cell ? P.green : P.red} />
                      <text x={x} y={y + 19} textAnchor="middle" fill={cell ? P.greenSoft : P.redSoft} fontSize={11} fontFamily={P.mono}>
                        {cell ? "✓" : "✗"}
                      </text>
                    </g>
                  );
                }
                return (
                  <text key={i} x={x} y={y + 19} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
                    {cell}
                  </text>
                );
              })}
            </g>
          );
        })}
        {/* Hash-table bracket over set and dict */}
        <rect x={LABEL_W + 2 * COL_W + 4} y={4} width={2 * COL_W - 8} height={H - 10} rx={6} fill="none" stroke={P.amber} strokeOpacity={0.35} strokeDasharray="4 4" />
      </svg>
    </Figure>
  );
}

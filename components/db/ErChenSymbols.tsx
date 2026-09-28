import type { ReactNode } from "react";
import { Figure, P } from "@/components/learning/Figure";
import { ErAttr, ErCard, ErEntity, ErLink, ErRel } from "./erShapes";

const W = 640;
const H = 486;
const COL = 320;
const ROW0 = 38;
const ROWH = 62;

interface Cell {
  name: string;
  lines: string[];
  draw: (cx: number, cy: number) => ReactNode;
}

const CELLS: Cell[] = [
  { name: "Entity type", lines: ["rectangle", "STUDENT, COURSE"], draw: (x, y) => <ErEntity x={x} y={y} label="STUDENT" /> },
  { name: "Weak entity type", lines: ["double rectangle", "no key of its own"], draw: (x, y) => <ErEntity x={x} y={y} label="DEPENDENT" weak hl /> },
  { name: "Attribute", lines: ["oval, joined to", "its entity by a line"], draw: (x, y) => <ErAttr x={x} y={y} label="Name" /> },
  { name: "Key attribute", lines: ["name underlined", "unique for each entity"], draw: (x, y) => <ErAttr x={x} y={y} label="RegNo" kind="key" hl /> },
  { name: "Multivalued attribute", lines: ["double oval", "a set of values"], draw: (x, y) => <ErAttr x={x} y={y} label="Phone" kind="multi" hl /> },
  { name: "Derived attribute", lines: ["dashed oval", "computed, e.g. from DOB"], draw: (x, y) => <ErAttr x={x} y={y} label="Age" kind="derived" hl /> },
  {
    name: "Composite attribute",
    lines: ["oval with sub-ovals", "parts: Street, City"],
    draw: (x, y) => (
      <g>
        <ErLink x1={x - 32} y1={y} x2={x + 52} y2={y - 16} hl />
        <ErLink x1={x - 32} y1={y} x2={x + 52} y2={y + 16} hl />
        <ErAttr x={x - 32} y={y} label="Address" rx={38} />
        <ErAttr x={x + 52} y={y - 16} label="Street" rx={30} ry={11} />
        <ErAttr x={x + 52} y={y + 16} label="City" rx={30} ry={11} />
      </g>
    ),
  },
  { name: "Partial key", lines: ["dashed underline", "unique within owner"], draw: (x, y) => <ErAttr x={x} y={y} label="DepName" kind="partial" hl /> },
  { name: "Relationship type", lines: ["diamond", "associates entity types"], draw: (x, y) => <ErRel x={x} y={y} label="ENROLLS" /> },
  { name: "Identifying relationship", lines: ["double diamond", "weak entity to its owner"], draw: (x, y) => <ErRel x={x} y={y} label="DEPENDS_ON" identifying hl w={116} /> },
];

/** Static figure: the complete Chen (Elmasri) ER notation cheat sheet, as used on the DB lecture 03 slides. Reused by later ER lessons. */
export function ErChenSymbols() {
  const stripY = ROW0 + 5 * ROWH + 8;
  const dy = stripY + 44;
  return (
    <Figure
      title="Chen ER notation: every symbol you will draw"
      caption={
        <>
          Blue marks the part that tells a symbol apart from the plain one: the second border, the dashes, the underline. In the bottom row, the numbers are the{" "}
          <span className="text-amber-600">cardinality ratio</span> and the <span className="text-blue-600">double line</span> is total participation.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Chen notation symbols for entities, attributes, relationships, cardinality and participation">
        {CELLS.map((c, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x0 = col * COL;
          const cy = ROW0 + row * ROWH;
          return (
            <g key={c.name}>
              {row > 0 && <line x1={x0 + 8} y1={cy - ROWH / 2} x2={x0 + COL - 8} y2={cy - ROWH / 2} stroke={P.line} />}
              {c.draw(x0 + 84, cy)}
              <text x={x0 + 178} y={cy - 8} fill={P.textStrong} fontSize={11}>
                {c.name}
              </text>
              {c.lines.map((l, j) => (
                <text key={l} x={x0 + 178} y={cy + 7 + j * 13} fill={P.text} fontSize={9} fontFamily={P.mono}>
                  {l}
                </text>
              ))}
            </g>
          );
        })}
        <line x1={COL} y1={ROW0 - 26} x2={COL} y2={stripY - 18} stroke={P.line} />

        {/* Cardinality and participation strip */}
        <line x1={8} y1={stripY - 18} x2={W - 8} y2={stripY - 18} stroke={P.lineStrong} />
        <text x={16} y={stripY} fill={P.textStrong} fontSize={11}>
          Cardinality ratio and participation
        </text>
        <ErLink x1={120} y1={dy} x2={320} y2={dy} />
        <ErLink x1={320} y1={dy} x2={520} y2={dy} total hl />
        <ErEntity x={120} y={dy} label="DEPARTMENT" />
        <ErRel x={320} y={dy} label="OFFERS" />
        <ErEntity x={520} y={dy} label="COURSE" />
        <ErCard x={200} y={dy - 8} label="1" />
        <ErCard x={440} y={dy - 8} label="N" />
        <text x={16} y={dy + 42} fill={P.text} fontSize={10} fontFamily={P.mono}>
          <tspan fill={P.amber}>1 … N</tspan> : a department offers many courses; each course belongs to one department
        </text>
        <text x={16} y={dy + 58} fill={P.text} fontSize={10} fontFamily={P.mono}>
          <tspan fill={P.blueSoft}>double line</tspan> : total participation, every COURSE must be offered by a department
        </text>
        <text x={16} y={dy + 74} fill={P.text} fontSize={10} fontFamily={P.mono}>
          single line : partial participation, a new department may offer no course yet
        </text>
      </svg>
    </Figure>
  );
}

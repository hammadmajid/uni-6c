import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 372;

/** Static figure: ANSI/SPARC three-schema architecture with the two data independences, annotated with what each level is in Postgres. */
export function ThreeSchemaDiagram() {
  const bx = 96; // left edge of level boxes
  const bw = 372; // width of conceptual and internal boxes
  const views = [
    { name: "Student view", pg: "my_grades" },
    { name: "Teacher view", pg: "course_roster" },
    { name: "Finance view", pg: "fee_status" },
  ];
  const vw = 116;
  const vgap = (bw - 3 * vw) / 2;
  const yExt = 34;
  const yCon = 142;
  const yInt = 240;
  const yDb = 318;
  const brX = bx + bw + 16;

  return (
    <Figure
      title="Three-schema architecture and where the independence lives"
      caption={
        <>
          Each level is described by its own schema, and the DBMS keeps a <em>mapping</em> between neighbours. Change a level and only the mapping above it has to change:
          that is <span className="text-blue-600">logical</span> data independence at the top gap and <span className="text-green-600">physical</span> data independence at the
          bottom gap. Mono labels show what each level is in Postgres.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="External, conceptual and internal levels with logical and physical data independence">
        <defs>
          <marker id="tsa-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={P.lineStrong} />
          </marker>
        </defs>

        {/* Level labels */}
        {[
          { y: yExt + 26, t: "external", s: "level" },
          { y: yCon + 30, t: "conceptual", s: "level" },
          { y: yInt + 26, t: "internal", s: "level" },
        ].map((l) => (
          <g key={l.t}>
            <text x={16} y={l.y} fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
              {l.t}
            </text>
            <text x={16} y={l.y + 14} fill={P.muted} fontSize={10} fontFamily={P.mono}>
              {l.s}
            </text>
          </g>
        ))}

        {/* External views */}
        {views.map((v, i) => {
          const x = bx + i * (vw + vgap);
          return (
            <g key={v.name}>
              <rect x={x} y={yExt} width={vw} height={52} rx={6} fill="rgba(0,112,243,0.08)" stroke={P.blue} />
              <text x={x + vw / 2} y={yExt + 22} textAnchor="middle" fill={P.textStrong} fontSize={11}>
                {v.name}
              </text>
              <text x={x + vw / 2} y={yExt + 39} textAnchor="middle" fill={P.blueSoft} fontSize={9} fontFamily={P.mono}>
                VIEW {v.pg}
              </text>
              <line x1={x + vw / 2} y1={yExt + 54} x2={bx + bw / 2 + (i - 1) * 60} y2={yCon - 4} stroke={P.lineStrong} markerEnd="url(#tsa-arrow)" markerStart="url(#tsa-arrow)" />
            </g>
          );
        })}

        {/* Conceptual */}
        <rect x={bx} y={yCon} width={bw} height={62} rx={6} fill={P.panel} stroke={P.lineStrong} />
        <text x={bx + bw / 2} y={yCon + 22} textAnchor="middle" fill={P.textStrong} fontSize={11}>
          Conceptual schema: entities, relationships, constraints
        </text>
        <text x={bx + bw / 2} y={yCon + 40} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
          CREATE TABLE student, course, enrollment, fee
        </text>
        <text x={bx + bw / 2} y={yCon + 53} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          PRIMARY KEY · FOREIGN KEY · CHECK · NOT NULL
        </text>
        <line x1={bx + bw / 2} y1={yCon + 64} x2={bx + bw / 2} y2={yInt - 4} stroke={P.lineStrong} markerEnd="url(#tsa-arrow)" markerStart="url(#tsa-arrow)" />

        {/* Internal */}
        <rect x={bx} y={yInt} width={bw} height={52} rx={6} fill={P.panel} stroke={P.lineStrong} />
        <text x={bx + bw / 2} y={yInt + 21} textAnchor="middle" fill={P.textStrong} fontSize={11}>
          Internal schema: files, record layout, access paths
        </text>
        <text x={bx + bw / 2} y={yInt + 38} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          heap files · B-tree index on reg_no · tablespace on SSD
        </text>
        <line x1={bx + bw / 2} y1={yInt + 54} x2={bx + bw / 2} y2={yDb - 4} stroke={P.lineStrong} markerEnd="url(#tsa-arrow)" />

        {/* Stored database */}
        <g>
          <path d={`M ${bx + bw / 2 - 60} ${yDb + 6} v 30 a 60 6 0 0 0 120 0 v -30`} fill={P.panel} stroke={P.lineStrong} />
          <ellipse cx={bx + bw / 2} cy={yDb + 6} rx={60} ry={6} fill={P.panel} stroke={P.lineStrong} />
          <text x={bx + bw / 2} y={yDb + 30} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
            stored database
          </text>
        </g>

        {/* Independence brackets */}
        <path d={`M ${brX} ${yExt + 26} h 8 v ${yCon + 31 - (yExt + 26)} h -8`} fill="none" stroke={P.blue} strokeWidth={1.3} />
        <text x={brX + 16} y={(yExt + yCon) / 2 + 24} fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
          logical data
        </text>
        <text x={brX + 16} y={(yExt + yCon) / 2 + 38} fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
          independence
        </text>
        <text x={brX + 16} y={(yExt + yCon) / 2 + 54} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          add a column: views,
        </text>
        <text x={brX + 16} y={(yExt + yCon) / 2 + 66} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          apps unchanged
        </text>

        <path d={`M ${brX} ${yCon + 35} h 8 v ${yInt + 26 - (yCon + 35)} h -8`} fill="none" stroke={P.green} strokeWidth={1.3} />
        <text x={brX + 16} y={(yCon + yInt) / 2 + 28} fill={P.greenSoft} fontSize={11} fontFamily={P.mono}>
          physical data
        </text>
        <text x={brX + 16} y={(yCon + yInt) / 2 + 42} fill={P.greenSoft} fontSize={11} fontFamily={P.mono}>
          independence
        </text>
        <text x={brX + 16} y={(yCon + yInt) / 2 + 58} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          add an index: tables,
        </text>
        <text x={brX + 16} y={(yCon + yInt) / 2 + 70} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          queries unchanged
        </text>
      </svg>
    </Figure>
  );
}

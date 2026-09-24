import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 300;

function Cylinder({ x, y, w, h, label, sub, color }: { x: number; y: number; w: number; h: number; label: string; sub: string; color: string }) {
  const ry = 7;
  return (
    <g>
      <path d={`M ${x} ${y + ry} v ${h - 2 * ry} a ${w / 2} ${ry} 0 0 0 ${w} 0 v ${-(h - 2 * ry)}`} fill={P.panel} stroke={color} />
      <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} fill={P.panel} stroke={color} />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill={P.textStrong} fontSize={11}>
        {label}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 18} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
        {sub}
      </text>
    </g>
  );
}

/** Static figure after Elmasri & Navathe Fig. 1.1 and the lecture's "simplified view": users → applications → DBMS → stored data + catalog. */
export function DbSystemDiagram() {
  const users = [
    { y: 44, name: "Admissions office", sub: "naive user" },
    { y: 124, name: "Accounts office", sub: "naive user" },
    { y: 204, name: "Analyst", sub: "ad-hoc SQL" },
  ];
  const apps = [
    { y: 44, name: "Admissions app", sub: "data entry, reports" },
    { y: 124, name: "Accounts app", sub: "fees, receipts" },
    { y: 204, name: "Query tool", sub: "psql, DBeaver" },
  ];
  const ux = 16;
  const uw = 118;
  const ax = 166;
  const aw = 130;
  const dx = 336;
  const dw = 130;
  const cx = 540;
  const cw = 88;

  return (
    <Figure
      title="A database system: what sits between the user and the disk"
      caption={
        <>
          Nobody touches the stored data directly. Every program sends queries to the DBMS, and the DBMS consults the <span className="text-blue-600">catalog</span> (the metadata) to
          know what the data looks like before it reads the data itself. Database + DBMS together are the <em>database system</em>.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Users, application programs, DBMS, stored database and catalog">
        <defs>
          <marker id="dbsys-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={P.lineStrong} />
          </marker>
        </defs>

        <text x={ux} y={20} fill={P.text} fontSize={10} fontFamily={P.mono}>
          users
        </text>
        <text x={ax} y={20} fill={P.text} fontSize={10} fontFamily={P.mono}>
          application programs
        </text>

        {/* Database system boundary */}
        <rect x={dx - 14} y={28} width={W - dx + 6} height={H - 44} rx={8} fill="none" stroke={P.lineStrong} strokeDasharray="4 4" />
        <text x={dx - 6} y={H - 22} fill={P.text} fontSize={10} fontFamily={P.mono}>
          database system = DBMS software + database
        </text>

        {users.map((u, i) => (
          <g key={u.name}>
            <rect x={ux} y={u.y} width={uw} height={46} rx={6} fill={P.panel} stroke={P.lineStrong} />
            <text x={ux + 10} y={u.y + 20} fill={P.textStrong} fontSize={11}>
              {u.name}
            </text>
            <text x={ux + 10} y={u.y + 35} fill={P.muted} fontSize={9} fontFamily={P.mono}>
              {u.sub}
            </text>
            <line x1={ux + uw + 2} y1={u.y + 23} x2={ax - 4} y2={apps[i].y + 23} stroke={P.lineStrong} markerEnd="url(#dbsys-arrow)" markerStart="url(#dbsys-arrow)" />
          </g>
        ))}

        {apps.map((a) => (
          <g key={a.name}>
            <rect x={ax} y={a.y} width={aw} height={46} rx={6} fill="rgba(0,112,243,0.08)" stroke={P.blue} />
            <text x={ax + 10} y={a.y + 20} fill={P.textStrong} fontSize={11}>
              {a.name}
            </text>
            <text x={ax + 10} y={a.y + 35} fill={P.muted} fontSize={9} fontFamily={P.mono}>
              {a.sub}
            </text>
            <line x1={ax + aw + 2} y1={a.y + 23} x2={dx - 4} y2={148} stroke={P.lineStrong} markerEnd="url(#dbsys-arrow)" markerStart="url(#dbsys-arrow)" />
          </g>
        ))}

        {/* DBMS */}
        <rect x={dx} y={62} width={dw} height={172} rx={8} fill={P.panel} stroke={P.blue} strokeWidth={1.4} />
        <text x={dx + dw / 2} y={82} textAnchor="middle" fill={P.blueSoft} fontSize={12} fontFamily={P.mono}>
          DBMS software
        </text>
        <rect x={dx + 12} y={94} width={dw - 24} height={52} rx={5} fill={P.bg} stroke={P.lineStrong} />
        <text x={dx + dw / 2} y={116} textAnchor="middle" fill={P.textStrong} fontSize={11}>
          process queries
        </text>
        <text x={dx + dw / 2} y={132} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          parse, check, plan
        </text>
        <rect x={dx + 12} y={158} width={dw - 24} height={62} rx={5} fill={P.bg} stroke={P.lineStrong} />
        <text x={dx + dw / 2} y={180} textAnchor="middle" fill={P.textStrong} fontSize={11}>
          access stored data
        </text>
        <text x={dx + dw / 2} y={196} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          concurrency, logs
        </text>
        <text x={dx + dw / 2} y={209} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          backup, recovery
        </text>
        <line x1={dx + dw / 2} y1={146} x2={dx + dw / 2} y2={156} stroke={P.lineStrong} markerEnd="url(#dbsys-arrow)" />

        {/* Stored data */}
        <Cylinder x={cx} y={56} w={cw} h={74} label="catalog" sub="metadata" color={P.blue} />
        <Cylinder x={cx} y={160} w={cw} h={74} label="stored data" sub="rows, indexes" color={P.lineStrong} />
        <line x1={dx + dw + 2} y1={108} x2={cx - 4} y2={96} stroke={P.blue} markerEnd="url(#dbsys-arrow)" />
        <text x={dx + dw + 8} y={92} fill={P.blueSoft} fontSize={9} fontFamily={P.mono}>
          1 schema?
        </text>
        <line x1={dx + dw + 2} y1={190} x2={cx - 4} y2={196} stroke={P.lineStrong} markerEnd="url(#dbsys-arrow)" markerStart="url(#dbsys-arrow)" />
        <text x={dx + dw + 8} y={184} fill={P.text} fontSize={9} fontFamily={P.mono}>
          2 rows
        </text>
      </svg>
    </Figure>
  );
}

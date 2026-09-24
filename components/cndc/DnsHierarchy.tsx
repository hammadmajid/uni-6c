import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 240;
const BH = 26;

type N = { id: string; x: number; y: number; label: string; w: number; parent?: string; tone?: string };

const NODES: N[] = [
  { id: "root", x: 320, y: 40, label: "root", w: 90, tone: P.amber },
  { id: "com", x: 110, y: 116, label: ".com", w: 70, parent: "root", tone: P.blue },
  { id: "org", x: 250, y: 116, label: ".org", w: 70, parent: "root", tone: P.blue },
  { id: "edu", x: 392, y: 116, label: ".edu", w: 70, parent: "root", tone: P.blue },
  { id: "pk", x: 545, y: 116, label: ".pk", w: 70, parent: "root", tone: P.blue },
  { id: "yahoo", x: 70, y: 196, label: "yahoo.com", w: 76, parent: "com" },
  { id: "amazon", x: 152, y: 196, label: "amazon.com", w: 80, parent: "com" },
  { id: "pbs", x: 250, y: 196, label: "pbs.org", w: 76, parent: "org" },
  { id: "umass", x: 350, y: 196, label: "umass.edu", w: 76, parent: "edu" },
  { id: "nyu", x: 435, y: 196, label: "nyu.edu", w: 76, parent: "edu" },
  { id: "szabist", x: 545, y: 196, label: "szabist.edu.pk", w: 100, parent: "pk" },
];

/** Static figure: the DNS name-server hierarchy, root to TLD to authoritative. */
export function DnsHierarchy() {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <Figure
      title="DNS: a hierarchy of name servers"
      caption={
        <>
          No server knows every name. The <span className="text-gray-1000">root</span> knows only who runs each top-level domain; a{" "}
          <span className="text-gray-1000">TLD</span> server knows only who runs each domain under it; the <span className="text-gray-1000">authoritative</span>{" "}
          server for umass.edu holds the actual records for names in umass.edu. Resolution walks down this tree from the top. The .pk branch is run by PKNIC, with
          edu.pk as an intermediate zone above SZABIST, so the tree can be deeper than three levels.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="DNS hierarchy tree from root through TLDs to authoritative servers">
        {NODES.filter((n) => n.parent).map((n) => {
          const p = byId[n.parent!];
          return <line key={n.id} x1={p.x} y1={p.y + BH / 2} x2={n.x} y2={n.y - BH / 2} stroke={n.id === "szabist" ? P.muted : P.lineStrong} strokeDasharray={n.id === "szabist" ? "3 3" : undefined} />;
        })}
        {NODES.map((n) => (
          <g key={n.id}>
            <rect
              x={n.x - n.w / 2}
              y={n.y - BH / 2}
              width={n.w}
              height={BH}
              rx={4}
              fill={n.tone === P.amber ? "rgba(255,178,36,0.10)" : n.tone === P.blue ? "rgba(0,112,243,0.10)" : P.panel}
              stroke={n.tone ?? P.lineStrong}
            />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill={P.textStrong} fontSize={10.5} fontFamily={P.mono}>
              {n.label}
            </text>
          </g>
        ))}
        <text x={12} y={44} fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
          root · 13 names, 1,000+ instances
        </text>
        <text x={12} y={92} fill={P.blueSoft} fontSize={9} fontFamily={P.mono}>
          TLD servers
        </text>
        <text x={12} y={H - 6} fill={P.text} fontSize={9} fontFamily={P.mono}>
          authoritative servers · hold the records
        </text>
        <text x={552} y={160} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          via edu.pk
        </text>
      </svg>
    </Figure>
  );
}

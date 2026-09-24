import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 318;
const R = 82;

function ring(cx: number, cy: number, n: number, r: number, offset = -Math.PI / 2) {
  return Array.from({ length: n }, (_, i) => {
    const a = offset + (i * 2 * Math.PI) / n;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

function Pc({ x, y, label, tone }: { x: number; y: number; label: string; tone: "peer" | "client" }) {
  const stroke = tone === "peer" ? P.amber : P.lineStrong;
  return (
    <g>
      <rect x={x - 20} y={y - 13} width={40} height={26} rx={4} fill={P.panel} stroke={stroke} />
      <text x={x} y={y + 4} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
        {label}
      </text>
    </g>
  );
}

/** Static figure: peer-to-peer workgroup beside a client-server LAN, with who serves what. */
export function NetworkRoles() {
  const lc = { x: 160, y: 130 };
  const rc = { x: 480, y: 130 };
  const peers = ring(lc.x, lc.y, 5, R);
  const clients = ring(rc.x, rc.y, 5, R);
  const pairs: [number, number][] = [];
  for (let i = 0; i < peers.length; i++) for (let j = i + 1; j < peers.length; j++) pairs.push([i, j]);
  const peerShares = ["files", "printer", "files", "—", "scanner"];

  return (
    <Figure
      title="Classified by role: peer-to-peer vs client-server"
      caption={
        <>
          Left: every machine serves and requests (amber), and each one runs its own security. Right: one machine serves, the rest only request (blue),
          so security, backup and administration live in one place. That box is also the single point of failure.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A peer-to-peer network of five PCs beside a client-server network with one server and five clients">
        <text x={lc.x} y={16} textAnchor="middle" fill={P.text} fontSize={11} fontFamily={P.mono}>
          peer-to-peer (workgroup)
        </text>
        <text x={rc.x} y={16} textAnchor="middle" fill={P.text} fontSize={11} fontFamily={P.mono}>
          client-server
        </text>
        <line x1={W / 2} x2={W / 2} y1={24} y2={H - 70} stroke={P.line} />

        {pairs.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={peers[a].x} y1={peers[a].y} x2={peers[b].x} y2={peers[b].y} stroke={P.amber} strokeOpacity={0.45} />
        ))}
        {peers.map((p, i) => (
          <g key={i}>
            <Pc x={p.x} y={p.y} label={`PC${i + 1}`} tone="peer" />
            <text x={p.x} y={p.y + (p.y > lc.y ? 26 : -18)} textAnchor="middle" fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
              {peerShares[i] === "—" ? "shares nothing" : `shares ${peerShares[i]}`}
            </text>
          </g>
        ))}

        {clients.map((p, i) => (
          <line key={i} x1={rc.x} y1={rc.y} x2={p.x} y2={p.y} stroke={P.blueSoft} strokeOpacity={0.7} />
        ))}
        {clients.map((p, i) => (
          <Pc key={i} x={p.x} y={p.y} label={`C${i + 1}`} tone="client" />
        ))}
        <rect x={rc.x - 42} y={rc.y - 22} width={84} height={44} rx={5} fill={P.panel} />
        <rect x={rc.x - 42} y={rc.y - 22} width={84} height={44} rx={5} fill="rgba(0,112,243,0.18)" stroke={P.blue} />
        <text x={rc.x} y={rc.y - 4} textAnchor="middle" fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
          server
        </text>
        <text x={rc.x} y={rc.y + 11} textAnchor="middle" fill={P.blueSoft} fontSize={9} fontFamily={P.mono}>
          files·print·db
        </text>

        {[
          ["no central control or server", "each PC sets its own security", "cheap, easy; fine below ~10 PCs"],
          ["central security, backup, admin", "better performance, reliability", "costs a server and an admin"],
        ].map((lines, k) => (
          <g key={k}>
            {lines.map((t, i) => (
              <text key={i} x={k === 0 ? lc.x : rc.x} y={H - 50 + i * 16} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
                {t}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </Figure>
  );
}

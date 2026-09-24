import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 280;

function Node({ x, y, label, tone = P.lineStrong, fill = P.panel, w = 64 }: { x: number; y: number; label: string; tone?: string; fill?: string; w?: number }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - 13} width={w} height={26} rx={4} fill={P.bg} />
      <rect x={x - w / 2} y={y - 13} width={w} height={26} rx={4} fill={fill} stroke={tone} />
      <text x={x} y={y + 4} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
        {label}
      </text>
    </g>
  );
}

/** Static figure: client-server beside P2P, with who talks to whom and what each costs. */
export function AppArchitectures() {
  // Client-server panel
  const sx = 160;
  const sy = 92;
  const clients = [
    { x: 50, y: 196 },
    { x: 125, y: 226 },
    { x: 200, y: 226 },
    { x: 275, y: 196 },
  ];

  // P2P panel: five peers on a ring
  const cx = 480;
  const cy = 150;
  const r = 82;
  const peers = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return { x: cx + r * Math.cos(a) * 1.25, y: cy + r * Math.sin(a) };
  });
  const pairs: [number, number][] = [
    [0, 2],
    [0, 3],
    [1, 3],
    [1, 4],
    [2, 4],
    [0, 1],
  ];

  return (
    <Figure
      title="Client-server vs peer-to-peer"
      caption={
        <>
          Left: every arrow ends at the one always-on server, so the server&apos;s uplink and CPU are what run out. Your VPS behind Nginx is this picture. Right:
          peers download from each other <span className="text-gray-1000">and upload to each other</span>, so every new peer adds capacity as well as demand. That
          property, self-scalability, is the one-line exam answer for why P2P exists.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Client-server architecture beside a peer-to-peer mesh">
        <text x={20} y={18} fill={P.text} fontSize={11} fontFamily={P.mono}>
          client-server
        </text>
        <text x={360} y={18} fill={P.text} fontSize={11} fontFamily={P.mono}>
          peer-to-peer (P2P)
        </text>
        <line x1={330} x2={330} y1={10} y2={H - 10} stroke={P.line} />

        {clients.map((c, i) => (
          <line key={i} x1={c.x} y1={c.y - 13} x2={sx} y2={sy + 13} stroke={P.blueSoft} strokeWidth={1.2} />
        ))}
        <rect x={sx - 60} y={sy - 44} width={120} height={80} rx={6} fill="none" stroke={P.line} strokeDasharray="3 3" />
        <text x={sx} y={sy - 30} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          data center
        </text>
        <Node x={sx} y={sy} label="server" tone={P.blue} fill="rgba(0,112,243,0.12)" />
        {clients.map((c, i) => (
          <Node key={i} x={c.x} y={c.y} label="client" w={56} />
        ))}
        <text x={20} y={H - 14} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          always-on · fixed IP · clients never talk to each other
        </text>

        {pairs.map(([a, b], i) => (
          <line key={i} x1={peers[a].x} y1={peers[a].y} x2={peers[b].x} y2={peers[b].y} stroke={P.green} strokeWidth={1.2} opacity={0.8} />
        ))}
        {peers.map((p, i) => (
          <Node key={i} x={p.x} y={p.y} label="peer" w={48} tone={P.green} fill="rgba(70,167,88,0.12)" />
        ))}
        <text x={360} y={H - 14} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          intermittent · changing IPs · peers serve peers
        </text>
      </svg>
    </Figure>
  );
}

import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 290;

const CLIENTS = [
  { y: 130, name: "client A", addr: "10.0.0.5:51834" },
  { y: 185, name: "client B", addr: "10.0.0.9:51834" },
  { y: 240, name: "client C", addr: "10.0.0.5:51900" },
];

/** Static figure: a TCP server's welcoming socket plus one connection socket per client, each identified by the full 4-tuple. */
export function TcpSockets() {
  const cx = 86;
  const sx = 356;
  const sw = 250;
  const wy = 58;
  return (
    <Figure
      title="TCP: one welcoming socket, one connection socket per client"
      caption={
        <>
          Amber: each client&apos;s handshake knocks on the welcoming socket (port 80). <span className="font-mono text-gray-1000">accept()</span> then returns a
          brand-new connection socket for that client, and all its data flows there (blue). Clients A and B use the <span className="text-gray-1000">same</span>{" "}
          source port 51834, yet the server never confuses them: the kernel demultiplexes on the whole 4-tuple, not on the source port alone.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Three TCP clients, a welcoming socket, and three connection sockets on the server">
        <rect x={sx - 16} y={16} width={sw + 32} height={H - 30} rx={6} fill="none" stroke={P.line} />
        <text x={sx - 8} y={32} fill={P.text} fontSize={10} fontFamily={P.mono}>
          server 128.119.245.12
        </text>

        {CLIENTS.map((c) => (
          <g key={c.name}>
            <path d={`M ${cx + 64} ${c.y - 6} C ${cx + 150} ${c.y - 30}, ${sx - 90} ${wy + 20}, ${sx} ${wy + 6}`} fill="none" stroke={P.amber} strokeWidth={1} strokeDasharray="3 3" />
            <line x1={cx + 64} y1={c.y + 4} x2={sx - 8} y2={c.y + 4} stroke={P.blueSoft} strokeWidth={1.6} />
            <polygon points={`${sx},${c.y + 4} ${sx - 9},${c.y} ${sx - 9},${c.y + 8}`} fill={P.blueSoft} />
          </g>
        ))}

        <rect x={sx} y={wy - 16} width={sw} height={32} rx={4} fill="rgba(255,178,36,0.10)" stroke={P.amber} />
        <text x={sx + 10} y={wy - 1} fill={P.textStrong} fontSize={11}>
          welcoming socket
        </text>
        <text x={sx + 10} y={wy + 11} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          listen() on *:80 · only sees handshakes
        </text>

        {CLIENTS.map((c) => (
          <g key={c.name}>
            <rect x={cx - 64} y={c.y - 16} width={128} height={32} rx={4} fill={P.panel} stroke={P.lineStrong} />
            <text x={cx} y={c.y - 1} textAnchor="middle" fill={P.textStrong} fontSize={11}>
              {c.name}
            </text>
            <text x={cx} y={c.y + 11} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
              {c.addr}
            </text>
            <rect x={sx} y={c.y - 14} width={sw} height={36} rx={4} fill="rgba(0,112,243,0.10)" stroke={P.blue} />
            <text x={sx + 10} y={c.y + 1} fill={P.textStrong} fontSize={10.5}>
              connection socket
            </text>
            <text x={sx + 10} y={c.y + 14} fill={P.blueSoft} fontSize={9} fontFamily={P.mono}>
              ({c.addr.replace(":", ", ")}, 128.119.245.12, 80)
            </text>
          </g>
        ))}
        <text x={cx - 64} y={H - 10} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          4-tuple = (src IP, src port, dst IP, dst port)
        </text>
      </svg>
    </Figure>
  );
}

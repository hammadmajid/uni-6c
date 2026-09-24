import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 292;
const ROW = 36;
const TOP = 52;
const DOOR = 112;
const LAYERS = ["application", "transport", "network", "link", "physical"];

/** Static figure: two hosts, process above socket, the socket as the door between developer-owned and OS-owned code, addressed by IP:port. */
export function SocketDoor() {
  const hosts = [
    { x: 40, name: "client host", ip: "192.168.1.7", port: "51834", proc: "browser" },
    { x: 380, name: "server host", ip: "128.119.245.12", port: "80", proc: "web server" },
  ];
  const hw = 220;
  const bottomY = TOP + LAYERS.length * ROW;

  return (
    <Figure
      title="A socket is the door between your code and the OS"
      caption={
        <>
          Everything above the blue door is yours: the process, its protocol logic, its message format. Everything below is the kernel&apos;s, and you only choose
          which transport (TCP or UDP) and a few parameters. The door has an address, <span className="font-mono text-gray-1000">IP:port</span>. The IP gets the
          datagram to the host; the port gets it to the process, because one host runs many processes.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Two protocol stacks with a socket between application and transport on each">
        {hosts.map((h) => (
          <g key={h.name}>
            <text x={h.x} y={20} fill={P.text} fontSize={11} fontFamily={P.mono}>
              {h.name} · {h.proc}
            </text>
            <rect x={h.x - 6} y={28} width={hw + 12} height={bottomY - 28 + 10} rx={6} fill="none" stroke={P.line} />
            {LAYERS.map((l, i) => {
              const y = TOP + i * ROW;
              const app = i === 0;
              return (
                <g key={l}>
                  <rect x={h.x} y={y} width={hw} height={ROW - 6} rx={4} fill={app ? "rgba(0,112,243,0.10)" : P.panel} stroke={app ? P.blue : P.lineStrong} />
                  <text x={h.x + 10} y={y + ROW / 2} fill={app ? P.textStrong : P.text} fontSize={11}>
                    {l}
                  </text>
                  <text x={h.x + hw - 10} y={y + ROW / 2} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={P.mono}>
                    {app ? "app developer" : "OS kernel"}
                  </text>
                </g>
              );
            })}
            {/* The socket door straddles application and transport */}
            <rect x={h.x + DOOR - 26} y={TOP + ROW - 12} width={52} height={12} rx={2} fill={P.blue} />
            <text x={h.x + DOOR} y={TOP + ROW - 3} textAnchor="middle" fill="#fff" fontSize={9} fontFamily={P.mono}>
              socket
            </text>
            <text x={h.x + hw / 2} y={bottomY + 28} textAnchor="middle" fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
              {h.ip}:{h.port}
            </text>
            <text x={h.x + hw / 2} y={bottomY + 44} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
              {h.name === "client host" ? "port picked by the OS (ephemeral)" : "well-known port, bound by the server"}
            </text>
          </g>
        ))}

        {/* Message path: down the client, across, up the server */}
        {(() => {
          const cx = hosts[0].x + DOOR;
          const sx = hosts[1].x + DOOR;
          const y0 = TOP + ROW + 2;
          const y1 = bottomY - 14;
          return (
            <g fill="none" stroke={P.blueSoft} strokeWidth={1.4}>
              <path d={`M ${cx} ${y0} V ${y1}`} />
              <path d={`M ${cx} ${y1} C ${cx + 60} ${y1 + 30}, ${sx - 60} ${y1 + 30}, ${sx} ${y1}`} strokeDasharray="4 3" />
              <path d={`M ${sx} ${y1} V ${y0 + 6}`} />
              <polygon points={`${sx},${y0} ${sx - 4},${y0 + 8} ${sx + 4},${y0 + 8}`} fill={P.blueSoft} stroke="none" />
            </g>
          );
        })()}
        <text x={W / 2} y={bottomY + 34} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          Internet
        </text>
      </svg>
    </Figure>
  );
}

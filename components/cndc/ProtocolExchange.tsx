import { Figure, P } from "@/components/learning/Figure";

/**
 * A web fetch drawn as a sequence diagram, with the three parts of the protocol definition
 * (format, order, actions) annotated on the picture itself.
 */
export function ProtocolExchange() {
  const W = 640;
  const H = 330;
  const cx = 170; // client lifeline
  const sx = 470; // server lifeline
  const top = 44;
  const bottom = H - 20;

  const msgs = [
    { y: 84, from: "c", label: "1  TCP SYN", sub: "seq=x, flags=SYN" },
    { y: 128, from: "s", label: "2  TCP SYN-ACK", sub: "seq=y, ack=x+1" },
    { y: 200, from: "c", label: "3  GET /index.html HTTP/1.1", sub: "Host: example.com" },
    { y: 262, from: "s", label: "4  HTTP/1.1 200 OK", sub: "Content-Length: 1523 + body" },
  ];

  const Arrow = ({ y, from, label, sub, tone = P.blue }: { y: number; from: string; label: string; sub: string; tone?: string }) => {
    const x1 = from === "c" ? cx : sx;
    const x2 = from === "c" ? sx : cx;
    const dir = from === "c" ? 1 : -1;
    return (
      <g>
        <line x1={x1} y1={y} x2={x2 - dir * 8} y2={y} stroke={tone} strokeWidth={1.6} />
        <polygon points={`${x2},${y} ${x2 - dir * 9},${y - 4} ${x2 - dir * 9},${y + 4}`} fill={tone} />
        <text x={(cx + sx) / 2} y={y - 6} textAnchor="middle" fill={P.textStrong} fontSize={10.5} fontFamily={P.mono}>
          {label}
        </text>
        <text x={(cx + sx) / 2} y={y + 12} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          {sub}
        </text>
      </g>
    );
  };

  return (
    <Figure
      title="A protocol is format + order + actions"
      caption={
        <>
          Read the annotations, not just the arrows. <span className="text-gray-1000">Format</span>: each message has fields in a fixed layout.{" "}
          <span className="text-gray-1000">Order</span>: a GET before the handshake is simply ignored, so the numbering is part of the protocol.{" "}
          <span className="text-gray-1000">Actions</span>: what each side does on receiving a message, and on the event of receiving nothing (the retransmit
          timer). Those three words are the full-marks definition.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sequence diagram of a TCP handshake and HTTP request with format, order and actions annotated">
        {/* Lifelines */}
        {[
          { x: cx, name: "client (curl)" },
          { x: sx, name: "server" },
        ].map((l) => (
          <g key={l.x}>
            <rect x={l.x - 44} y={top - 26} width={88} height={22} rx={4} fill={P.panel} stroke={P.lineStrong} />
            <text x={l.x} y={top - 11} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
              {l.name}
            </text>
            <line x1={l.x} y1={top} x2={l.x} y2={bottom} stroke={P.line} strokeWidth={1} strokeDasharray="3 3" />
          </g>
        ))}
        <text x={cx - 44} y={bottom + 12} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          time ↓
        </text>

        {msgs.map((m) => (
          <Arrow key={m.y} {...m} />
        ))}

        {/* ORDER annotation: struck-through out-of-order GET */}
        <g opacity={0.8}>
          <line x1={cx} y1={60} x2={sx - 8} y2={60} stroke={P.red} strokeWidth={1.2} strokeDasharray="4 3" />
          <polygon points={`${sx},60 ${sx - 9},56 ${sx - 9},64`} fill={P.red} />
          <text x={(cx + sx) / 2} y={56} textAnchor="middle" fill={P.redSoft} fontSize={9} fontFamily={P.mono}>
            GET before SYN → ignored (no connection)
          </text>
          <line x1={(cx + sx) / 2 - 92} y1={53} x2={(cx + sx) / 2 + 92} y2={53} stroke={P.red} strokeWidth={1} />
        </g>
        <text x={W - 12} y={64} textAnchor="end" fill={P.amberSoft} fontSize={10} fontFamily={P.mono} fontWeight={600}>
          ORDER
        </text>
        <text x={W - 12} y={76} textAnchor="end" fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
          numbered arrows must happen
        </text>
        <text x={W - 12} y={86} textAnchor="end" fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
          in this sequence
        </text>

        {/* FORMAT annotation: bracket around GET, label on the left */}
        <g>
          <rect x={(cx + sx) / 2 - 96} y={188} width={192} height={30} rx={3} fill="none" stroke={P.amber} strokeWidth={1} strokeDasharray="2 2" />
          <line x1={(cx + sx) / 2 - 96} y1={203} x2={cx + 6} y2={203} stroke={P.amber} strokeWidth={1} />
          <text x={cx - 30} y={198} textAnchor="end" fill={P.amberSoft} fontSize={10} fontFamily={P.mono} fontWeight={600}>
            FORMAT
          </text>
          <text x={cx - 30} y={210} textAnchor="end" fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
            request line, headers,
          </text>
          <text x={cx - 30} y={220} textAnchor="end" fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
            blank line, body
          </text>
        </g>

        {/* ACTIONS on server: bracket */}
        <g>
          <path d={`M ${sx + 14} 78 h 8 v 56 h -8`} fill="none" stroke={P.green} strokeWidth={1.2} />
          <text x={sx + 28} y={100} fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
            on SYN: allocate state,
          </text>
          <text x={sx + 28} y={111} fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
            send SYN-ACK
          </text>
          <path d={`M ${sx + 14} 208 h 8 v 62 h -8`} fill="none" stroke={P.green} strokeWidth={1.2} />
          <text x={sx + 28} y={236} fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
            on GET: find file,
          </text>
          <text x={sx + 28} y={247} fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
            build response
          </text>
        </g>

        {/* ACTIONS on client: timeout loop */}
        <g>
          <path d={`M ${cx - 14} 92 h -10 v 30 h 10`} fill="none" stroke={P.green} strokeWidth={1.2} />
          <polygon points={`${cx - 14},122 ${cx - 22},118 ${cx - 22},126`} fill={P.green} />
          <text x={cx - 30} y={100} textAnchor="end" fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
            no SYN-ACK within
          </text>
          <text x={cx - 30} y={111} textAnchor="end" fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
            timeout → resend SYN
          </text>
          <text x={cx - 30} y={124} textAnchor="end" fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
            (action on an event,
          </text>
          <text x={cx - 30} y={134} textAnchor="end" fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
            not on a message)
          </text>
          <text x={cx - 30} y={296} textAnchor="end" fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
            on 200 OK: print body
          </text>
          <path d={`M ${cx - 14} 256 h -10 v 44 h 10`} fill="none" stroke={P.green} strokeWidth={1.2} />
        </g>
        <text x={W - 12} y={300} textAnchor="end" fill={P.greenSoft} fontSize={10} fontFamily={P.mono} fontWeight={600}>
          ACTIONS
        </text>
        <text x={W - 12} y={312} textAnchor="end" fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
          green brackets, both sides
        </text>
      </svg>
    </Figure>
  );
}

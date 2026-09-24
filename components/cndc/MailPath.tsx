import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 230;
const NY = 70; // node centre y
const NW = 116;
const NH = 44;

const NODES = [
  { x: 72, name: "Alice's UA", sub: "Thunderbird, phone" },
  { x: 236, name: "Alice's server", sub: "outgoing queue" },
  { x: 404, name: "Bob's server", sub: "Bob's mailbox" },
  { x: 568, name: "Bob's UA", sub: "Gmail web, Outlook" },
];

const HOPS = [
  { a: 0, b: 1, label: "SMTP · push", sub: "steps 1–2 · submission", tone: P.blueSoft, dir: 1 },
  { a: 1, b: 2, label: "SMTP · push", sub: "steps 3–5 · TCP port 25", tone: P.blueSoft, dir: 1 },
  { a: 2, b: 3, label: "IMAP / POP3 / HTTP", sub: "step 6 · pull", tone: P.green, dir: 1 },
];

/** Static figure: an email from Alice to Bob, with SMTP pushing and an access protocol pulling. */
export function MailPath() {
  const bottom = NY + NH / 2;
  const laneY = 150;
  return (
    <Figure
      title="Alice to Bob: SMTP pushes, IMAP or POP3 pulls"
      caption={
        <>
          SMTP only ever <span className="text-gray-1000">pushes</span> mail toward a server. It cannot fetch Bob&apos;s mail for him, which is why a separate
          mail access protocol (POP3, IMAP, or plain HTTPS for webmail) covers the last hop. The two servers talk directly; there is no intermediate mail
          server, and if Bob&apos;s server is down the message waits in Alice&apos;s server&apos;s queue and is retried.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Email path from Alice's user agent through two mail servers to Bob's user agent">
        {HOPS.map((h, i) => {
          const x1 = NODES[h.a].x + 22;
          const x2 = NODES[h.b].x - 22;
          const y = laneY - (i === 1 ? 24 : 0);
          return (
            <g key={i}>
              <path d={`M ${x1} ${bottom} V ${y} H ${x2} V ${bottom + 9}`} fill="none" stroke={h.tone} strokeWidth={1.5} />
              <polygon points={`${x2},${bottom + 1} ${x2 - 4},${bottom + 10} ${x2 + 4},${bottom + 10}`} fill={h.tone} />
              <text x={(x1 + x2) / 2} y={y + 16} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
                {h.label}
              </text>
              <text x={(x1 + x2) / 2} y={y + 29} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {h.sub}
              </text>
            </g>
          );
        })}
        {NODES.map((n, i) => {
          const server = i === 1 || i === 2;
          return (
            <g key={n.name}>
              <rect x={n.x - NW / 2} y={NY - NH / 2} width={NW} height={NH} rx={5} fill={server ? "rgba(0,112,243,0.10)" : P.panel} stroke={server ? P.blue : P.lineStrong} />
              <text x={n.x} y={NY - 3} textAnchor="middle" fill={P.textStrong} fontSize={11}>
                {n.name}
              </text>
              <text x={n.x} y={NY + 12} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {n.sub}
              </text>
            </g>
          );
        })}
        <text x={20} y={22} fill={P.text} fontSize={10} fontFamily={P.mono}>
          user agent → mail server → mail server → user agent
        </text>
        <text x={W - 20} y={H - 10} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          blue = push (SMTP) · green = pull (access protocol)
        </text>
      </svg>
    </Figure>
  );
}

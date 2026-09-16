import { Figure, P } from "@/components/learning/Figure";

const ROW = 44;
const TOP = 28;
const W = 640;

// OSI rows, top to bottom. Layer numbers 7..1.
const OSI = [
  { n: 7, name: "Application" },
  { n: 6, name: "Presentation" },
  { n: 5, name: "Session" },
  { n: 4, name: "Transport" },
  { n: 3, name: "Network" },
  { n: 2, name: "Data link" },
  { n: 1, name: "Physical" },
];

// TCP/IP rows. Application spans OSI rows 7..5.
const TCP = [
  { name: "Application", pdu: "message", eg: "HTTP, DNS", span: 3 },
  { name: "Transport", pdu: "segment", eg: "TCP, UDP", span: 1 },
  { name: "Network", pdu: "datagram", eg: "IP, ICMP", span: 1 },
  { name: "Link", pdu: "frame", eg: "Ethernet, Wi-Fi", span: 1 },
  { name: "Physical", pdu: "bit", eg: "1000BASE-T, 802.11 PHY", span: 1 },
];

const H = TOP + OSI.length * ROW + 40;

/** Static figure: OSI seven layers beside the TCP/IP five, aligned, with PDU names. */
export function LayerStacks() {
  const numX = 34;
  const osiX = 56;
  const osiW = 200;
  const gapX = 40;
  const tcpX = osiX + osiW + gapX;
  const tcpW = W - tcpX - 16;

  let row = 0;

  return (
    <Figure
      title="OSI (7) beside TCP/IP (5), aligned"
      caption={
        <>
          Same wire, same jobs. The only difference is the two amber rows: OSI names presentation and session as layers, TCP/IP leaves those jobs to the
          application. Layer numbers on the left are OSI&apos;s, and that numbering is what &quot;layer 2 switch&quot; and &quot;layer 7 load balancer&quot; refer to.
          Each TCP/IP box carries the name of its unit of data, which is what the exam calls the PDU.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="OSI and TCP/IP layer stacks side by side">
        <text x={osiX} y={16} fill={P.text} fontSize={11} fontFamily={P.mono}>
          OSI · 7 layers
        </text>
        <text x={tcpX} y={16} fill={P.text} fontSize={11} fontFamily={P.mono}>
          TCP/IP · 5 layers
        </text>

        {OSI.map((l, i) => {
          const y = TOP + i * ROW;
          const folded = l.n === 6 || l.n === 5;
          return (
            <g key={l.n}>
              <text x={numX} y={y + ROW / 2 + 4} textAnchor="end" fill={P.muted} fontSize={11} fontFamily={P.mono}>
                L{l.n}
              </text>
              <rect x={osiX} y={y + 2} width={osiW} height={ROW - 4} rx={4} fill={folded ? "rgba(255,178,36,0.10)" : P.panel} stroke={folded ? P.amber : P.lineStrong} />
              <text x={osiX + 12} y={y + ROW / 2 + 4} fill={folded ? P.amberSoft : P.textStrong} fontSize={12}>
                {l.name}
              </text>
            </g>
          );
        })}

        {TCP.map((l) => {
          const y = TOP + row * ROW;
          row += l.span;
          const h = l.span * ROW - 4;
          return (
            <g key={l.name}>
              <rect x={tcpX} y={y + 2} width={tcpW} height={h} rx={4} fill={P.panel} stroke={P.lineStrong} />
              <text x={tcpX + 12} y={y + 2 + h / 2 - 4} fill={P.textStrong} fontSize={12}>
                {l.name}
              </text>
              <text x={tcpX + 12} y={y + 2 + h / 2 + 11} fill={P.muted} fontSize={10}>
                {l.eg}
              </text>
              <text x={tcpX + tcpW - 12} y={y + 2 + h / 2 + 4} textAnchor="end" fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
                {l.pdu}
              </text>
            </g>
          );
        })}

        {/* Bracket from presentation+session to the TCP/IP application box */}
        {(() => {
          const y0 = TOP + 1 * ROW + 6;
          const y1 = TOP + 3 * ROW - 6;
          const bx = osiX + osiW + 10;
          return (
            <g>
              <path d={`M ${bx} ${y0} h 8 v ${y1 - y0} h -8`} fill="none" stroke={P.amber} strokeWidth={1.2} />
              <line x1={bx + 8} y1={(y0 + y1) / 2} x2={tcpX - 6} y2={(y0 + y1) / 2} stroke={P.amber} strokeWidth={1.2} strokeDasharray="3 3" />
              <text x={tcpX + 12} y={y1 + 2} fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
                presentation + session folded in here
              </text>
            </g>
          );
        })()}

        {/* Alignment guides for the five shared layers */}
        {[3, 4, 5, 6].map((i) => {
          const y = TOP + i * ROW + ROW / 2;
          return <line key={i} x1={osiX + osiW + 4} x2={tcpX - 4} y1={y} y2={y} stroke={P.line} strokeDasharray="2 4" />;
        })}

        <text x={osiX} y={H - 12} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          ISO reference model, 1984
        </text>
        <text x={tcpX} y={H - 12} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          the deployed Internet
        </text>
      </svg>
    </Figure>
  );
}

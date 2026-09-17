import { Figure, P } from "@/components/learning/Figure";

/**
 * Where a packet sniffer sits inside the host (the lab manual's Figure 1, redrawn).
 * The capture library hooks the link layer and hands a copy of every frame, sent or received, to the analyzer.
 * Nothing is intercepted or slowed; the browser and the server never know.
 */
export function SnifferPlacement() {
  const W = 640;
  const H = 300;
  const stackX = 330;
  const stackW = 200;
  const layers = [
    { name: "application", ex: "browser: HTTP", y: 68 },
    { name: "transport", ex: "TCP / UDP", y: 108 },
    { name: "network", ex: "IP", y: 148 },
    { name: "link", ex: "Ethernet / Wi-Fi driver", y: 188 },
    { name: "physical", ex: "NIC", y: 228 },
  ];
  const rowH = 32;
  const mono = P.mono;

  return (
    <Figure
      title="Where Wireshark sits"
      caption={
        <>
          The capture library (libpcap on Linux and macOS, Npcap on Windows) hooks the link layer and hands the analyzer a <span className="text-gray-1000">copy</span> of every frame the
          interface sends or receives. The browser and the server are untouched. That is why the bytes pane shows the Ethernet header: you are seeing frames, not
          HTTP messages, and each frame carries the whole stack above it.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A host's protocol stack with a packet sniffer tapping copies of frames at the link layer">
        {/* host box */}
        <rect x={stackX - 20} y={40} width={stackW + 40} height={230} rx={6} fill="none" stroke={P.lineStrong} strokeDasharray="4 3" />
        <text x={stackX - 12} y={56} fill={P.muted} fontSize={9} fontFamily={mono}>
          your laptop
        </text>
        <text x={stackX + stackW + 12} y={56} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={mono}>
          operating system ↓
        </text>

        {/* stack */}
        {layers.map((l, i) => {
          const isLink = l.name === "link";
          const isApp = l.name === "application";
          return (
            <g key={l.name}>
              <rect x={stackX} y={l.y} width={stackW} height={rowH} rx={3} fill={isLink ? "rgba(0,112,243,0.14)" : P.panel} stroke={isLink ? P.blue : P.line} />
              <text x={stackX + 10} y={l.y + 20} fill={isApp || isLink ? P.textStrong : P.text} fontSize={11} fontFamily={mono}>
                {l.name}
              </text>
              <text x={stackX + stackW - 10} y={l.y + 20} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={mono}>
                {l.ex}
              </text>
              {i < layers.length - 1 && <line x1={stackX + stackW / 2} y1={l.y + rowH} x2={stackX + stackW / 2} y2={l.y + rowH + 8} stroke={P.line} />}
            </g>
          );
        })}
        {/* OS bracket */}
        <path d={`M ${stackX + stackW + 6} 108 h 6 v 152 h -6`} fill="none" stroke={P.lineStrong} />

        {/* wire out of the bottom */}
        <line x1={stackX + stackW / 2} y1={260} x2={stackX + stackW / 2} y2={290} stroke={P.green} strokeWidth={1.5} />
        <text x={stackX + stackW / 2 + 8} y={284} fill={P.greenSoft} fontSize={9} fontFamily={mono}>
          to / from the network
        </text>

        {/* sniffer box */}
        <rect x={40} y={40} width={230} height={230} rx={6} fill="none" stroke={P.amber} strokeDasharray="4 3" />
        <text x={50} y={56} fill={P.amberSoft} fontSize={9} fontFamily={mono}>
          packet sniffer
        </text>

        <rect x={60} y={72} width={190} height={64} rx={3} fill={P.panel} stroke={P.amber} />
        <text x={155} y={96} textAnchor="middle" fill={P.textStrong} fontSize={11} fontFamily={mono}>
          packet analyzer
        </text>
        <text x={155} y={112} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={mono}>
          Wireshark: dissects, displays, filters
        </text>
        <text x={155} y={126} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={mono}>
          (runs as a normal program)
        </text>

        <rect x={60} y={176} width={190} height={56} rx={3} fill={P.panel} stroke={P.amber} />
        <text x={155} y={198} textAnchor="middle" fill={P.textStrong} fontSize={11} fontFamily={mono}>
          packet capture library
        </text>
        <text x={155} y={214} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={mono}>
          libpcap / Npcap, in the kernel
        </text>

        {/* pcap -> analyzer */}
        <line x1={155} y1={176} x2={155} y2={144} stroke={P.amber} strokeWidth={1.4} />
        <polygon points="155,136 151,145 159,145" fill={P.amber} />
        <text x={163} y={160} fill={P.muted} fontSize={8.5} fontFamily={mono}>
          copies of frames
        </text>

        {/* tap: link layer -> pcap */}
        <path d={`M ${stackX} 204 H 290 V 204 H 250`} fill="none" stroke={P.blue} strokeWidth={1.6} />
        <polygon points="250,204 259,199 259,209" fill={P.blue} />
        <text x={290} y={196} textAnchor="middle" fill={P.blueSoft} fontSize={8.5} fontFamily={mono}>
          copy
        </text>
        <text x={290} y={222} textAnchor="middle" fill={P.muted} fontSize={8} fontFamily={mono}>
          both directions
        </text>

        {/* note */}
        <text x={40} y={290} fill={P.muted} fontSize={9} fontFamily={mono}>
          passive: nothing is delayed, altered or blocked
        </text>
      </svg>
    </Figure>
  );
}

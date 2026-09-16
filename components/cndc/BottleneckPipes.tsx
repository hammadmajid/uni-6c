import { Figure, P } from "@/components/learning/Figure";

/**
 * Throughput as the narrowest pipe. Top: three links in series. Bottom: a shared core link divided among flows first.
 * Uses the lesson's Predict numbers: 10 Gbps server, 100 Mbps core shared by 10, 1 Gbps client → 10 Mbps.
 */
export function BottleneckPipes() {
  const W = 640;
  const H = 330;

  // widths in px for a log-ish scale: 10 Mbps → 6, 100 Mbps → 14, 1 Gbps → 26, 10 Gbps → 40
  const pipeW = (mbps: number) => 6 + Math.log10(mbps / 10) * 11;

  const Node = ({ x, y, label, sub }: { x: number; y: number; label: string; sub?: string }) => (
    <g>
      <rect x={x - 22} y={y - 16} width={44} height={32} rx={4} fill={P.panel} stroke={P.lineStrong} />
      <text x={x} y={y + 4} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
        {label}
      </text>
      {sub && (
        <text x={x} y={y + 32} textAnchor="middle" fill={P.text} fontSize={10}>
          {sub}
        </text>
      )}
    </g>
  );

  const Pipe = ({ x1, x2, y, mbps, bottleneck, label }: { x1: number; x2: number; y: number; mbps: number; bottleneck?: boolean; label: string }) => {
    const w = pipeW(mbps);
    return (
      <g>
        <rect x={x1} y={y - w / 2} width={x2 - x1} height={w} rx={w / 2} fill={bottleneck ? P.amber : P.lineStrong} opacity={bottleneck ? 0.9 : 0.6} />
        <text x={(x1 + x2) / 2} y={y - w / 2 - 8} textAnchor="middle" fill={bottleneck ? P.amberSoft : P.text} fontSize={11} fontFamily={P.mono}>
          {label}
        </text>
      </g>
    );
  };

  // Water: a thin stream at the throughput rate flowing through every pipe.
  const Water = ({ x1, x2, y, mbps }: { x1: number; x2: number; y: number; mbps: number }) => {
    const w = Math.max(pipeW(mbps) - 2, 2);
    return <rect x={x1} y={y - w / 2} width={x2 - x1} height={w} rx={w / 2} fill={P.blue} />;
  };

  const y1 = 60;
  const nx = [50, 220, 390, 590];

  const y2 = 215;
  const flows = 10;
  const coreX1 = 250;
  const coreX2 = 420;

  return (
    <Figure
      title="Throughput is the narrowest pipe"
      caption="Top: water can only pass at the rate of the narrowest pipe, wherever it sits. The 10 Gbps and 1 Gbps links spend most of their time empty. Bottom: a shared link is first divided among the flows using it, and that share is what enters the min. Ten flows on 100 Mbps leaves each with 10 Mbps, which is now the narrowest pipe on the path."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Pipes of different widths in series, and a shared core link split among ten flows">
        {/* ---- top panel: series ---- */}
        <text x={20} y={22} fill={P.text} fontSize={11}>
          A · links in series
        </text>
        <Pipe x1={nx[0] + 22} x2={nx[1] - 22} y={y1} mbps={10000} label="R1 = 10 Gbps" />
        <Pipe x1={nx[1] + 22} x2={nx[2] - 22} y={y1} mbps={100} bottleneck label="R2 = 100 Mbps" />
        <Pipe x1={nx[2] + 22} x2={nx[3] - 22} y={y1} mbps={1000} label="R3 = 1 Gbps" />
        <Water x1={nx[0] + 22} x2={nx[3] - 22} y={y1} mbps={100} />
        <Node x={nx[0]} y={y1} label="srv" sub="server" />
        <Node x={nx[1]} y={y1} label="R" sub="router" />
        <Node x={nx[2]} y={y1} label="R" sub="router" />
        <Node x={nx[3]} y={y1} label="me" sub="client" />
        <text x={W / 2} y={y1 + 62} textAnchor="middle" fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
          throughput = min(R1, R2, R3) = 100 Mbps
        </text>

        {/* ---- bottom panel: shared core ---- */}
        <text x={20} y={y2 - 70} fill={P.text} fontSize={11}>
          B · a shared link is divided first
        </text>
        {/* ten flows fanning into the core */}
        {Array.from({ length: flows }, (_, i) => {
          const fy = y2 - 45 + i * 10;
          const mine = i === 4;
          return (
            <g key={i}>
              <path d={`M60,${fy} C 160,${fy} 180,${y2} ${coreX1},${y2}`} fill="none" stroke={mine ? P.blue : P.muted} strokeWidth={mine ? 2 : 1} opacity={mine ? 1 : 0.6} />
              <path d={`M${coreX2},${y2} C ${coreX2 + 70},${y2} ${coreX2 + 90},${fy} ${W - 60},${fy}`} fill="none" stroke={mine ? P.blue : P.muted} strokeWidth={mine ? 2 : 1} opacity={mine ? 1 : 0.6} />
            </g>
          );
        })}
        <text x={60} y={y2 - 52} fill={P.text} fontSize={10} fontFamily={P.mono}>
          10 flows
        </text>
        <text x={60} y={y2 + 16} fill={P.blueSoft} fontSize={10} fontFamily={P.mono}>
          mine: 1 Gbps
        </text>
        <text x={W - 56} y={y2 - 3} fill={P.blueSoft} fontSize={10} fontFamily={P.mono}>
          10 Gbps
        </text>
        {/* the core pipe */}
        <rect x={coreX1} y={y2 - 12} width={coreX2 - coreX1} height={24} rx={12} fill={P.amber} opacity={0.9} />
        {Array.from({ length: flows }, (_, i) => (
          <line key={i} x1={coreX1 + 4} x2={coreX2 - 4} y1={y2 - 9 + i * 2} y2={y2 - 9 + i * 2} stroke={i === 4 ? P.blue : P.bg} strokeWidth={1.2} opacity={i === 4 ? 1 : 0.5} />
        ))}
        <text x={(coreX1 + coreX2) / 2} y={y2 - 20} textAnchor="middle" fill={P.amberSoft} fontSize={11} fontFamily={P.mono}>
          core link R = 100 Mbps
        </text>
        <text x={(coreX1 + coreX2) / 2} y={y2 + 30} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
          each flow gets R ÷ 10 = 10 Mbps
        </text>
        <text x={W / 2} y={y2 + 62} textAnchor="middle" fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
          throughput = min(1 Gbps, 100 ÷ 10 Mbps, 10 Gbps) = 10 Mbps
        </text>
        <text x={W / 2} y={y2 + 80} textAnchor="middle" fill={P.text} fontSize={10}>
          the access links are not the problem this time; the shared core is
        </text>
      </svg>
    </Figure>
  );
}

import { Figure, P } from "@/components/learning/Figure";

/** Average queueing delay against traffic intensity La/R. The hockey stick, with the bands ISPs actually design to. */
export function IntensityCurve() {
  const W = 640;
  const H = 260;
  const padL = 52;
  const padR = 16;
  const padT = 20;
  const padB = 44;
  const xMax = 1.2;
  const yMax = 10; // in units of L/R
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const X = (rho: number) => padL + (rho / xMax) * plotW;
  const Y = (y: number) => padT + plotH - (Math.min(y, yMax) / yMax) * plotH;

  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const rho = (i / 240) * 0.999;
    const y = rho / (1 - rho);
    if (y > yMax) break;
    pts.push(`${i === 0 ? "M" : "L"}${X(rho).toFixed(1)},${Y(y).toFixed(1)}`);
  }
  const path = pts.join(" ");

  const rhoDot = 0.6;
  const yDot = rhoDot / (1 - rhoDot);

  return (
    <Figure
      title="Queueing delay against traffic intensity La ÷ R"
      caption="Below about 0.7 the queue is nearly empty. Between 0.7 and 1 the wait climbs steeply, which is why ISPs upgrade a link long before it is full. At 1 the curve goes vertical: arrivals match capacity and any burst is never drained. Past 1 the buffer fills and packets are dropped."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Hockey-stick curve of queueing delay versus traffic intensity">
        {/* bands */}
        <rect x={X(0)} y={padT} width={X(0.7) - X(0)} height={plotH} fill={P.green} opacity={0.08} />
        <rect x={X(0.7)} y={padT} width={X(1) - X(0.7)} height={plotH} fill={P.amber} opacity={0.1} />
        <rect x={X(1)} y={padT} width={X(xMax) - X(1)} height={plotH} fill={P.red} opacity={0.12} />
        <text x={X(0.35)} y={padT + 14} textAnchor="middle" fill={P.greenSoft} fontSize={11}>
          where ISPs run links
        </text>
        <text x={X(0.85)} y={padT + 14} textAnchor="middle" fill={P.amberSoft} fontSize={11}>
          delay climbing
        </text>
        <text x={X(1.1)} y={padT + 14} textAnchor="middle" fill={P.redSoft} fontSize={11}>
          loss
        </text>

        {/* axes */}
        <line x1={padL} x2={W - padR} y1={padT + plotH} y2={padT + plotH} stroke={P.lineStrong} />
        <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke={P.lineStrong} />
        {[0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map((t) => (
          <g key={t}>
            <line x1={X(t)} x2={X(t)} y1={padT + plotH} y2={padT + plotH + 4} stroke={P.lineStrong} />
            <text x={X(t)} y={padT + plotH + 16} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        <text x={(padL + W - padR) / 2} y={H - 8} textAnchor="middle" fill={P.text} fontSize={11}>
          traffic intensity La ÷ R
        </text>
        <text x={padL - 8} y={padT + 10} textAnchor="end" fill={P.text} fontSize={10} fontFamily={P.mono}>
          wait
        </text>
        <text x={padL - 8} y={padT + plotH + 3} textAnchor="end" fill={P.text} fontSize={10} fontFamily={P.mono}>
          0
        </text>

        {/* wall at 1 */}
        <line x1={X(1)} x2={X(1)} y1={padT} y2={padT + plotH} stroke={P.red} strokeDasharray="4 4" />
        <text x={X(1) + 6} y={padT + plotH - 60} fill={P.redSoft} fontSize={10} fontFamily={P.mono}>
          La ÷ R = 1
        </text>
        <text x={X(1) + 6} y={padT + plotH - 46} fill={P.redSoft} fontSize={10}>
          queue grows
        </text>
        <text x={X(1) + 6} y={padT + plotH - 34} fill={P.redSoft} fontSize={10}>
          without bound
        </text>

        {/* curve */}
        <path d={path} fill="none" stroke={P.textStrong} strokeWidth={2} />

        {/* worked value */}
        <line x1={X(rhoDot)} x2={X(rhoDot)} y1={Y(yDot)} y2={padT + plotH} stroke={P.blue} strokeDasharray="2 3" />
        <circle cx={X(rhoDot)} cy={Y(yDot)} r={5} fill={P.blue} />
        <text x={X(rhoDot) - 8} y={Y(yDot) - 8} textAnchor="end" fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
          0.6 (the worked example)
        </text>
      </svg>
    </Figure>
  );
}

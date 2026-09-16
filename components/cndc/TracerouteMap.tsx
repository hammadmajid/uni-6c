import { Figure, P } from "@/components/learning/Figure";

const HOPS: { n: number; rtt: number | null; name: string; where: "local" | "sea" | "eu" }[] = [
  { n: 1, rtt: 1.2, name: "home router", where: "local" },
  { n: 2, rtt: 4.8, name: "ISP edge", where: "local" },
  { n: 3, rtt: 6.2, name: "ISP core, Islamabad", where: "local" },
  { n: 4, rtt: 12.4, name: "Karachi landing", where: "local" },
  { n: 5, rtt: null, name: "no reply", where: "sea" },
  { n: 6, rtt: 98.7, name: "Marseille", where: "eu" },
  { n: 7, rtt: 112.3, name: "Frankfurt IX", where: "eu" },
  { n: 8, rtt: 113.1, name: "server", where: "eu" },
];

/** The lesson's sample traceroute drawn as RTT bars over the path, with the submarine jump called out. */
export function TracerouteMap() {
  const W = 640;
  const H = 300;
  const padL = 44;
  const padR = 20;
  const baseY = 200;
  const barMaxH = 150;
  const yMax = 120;
  const slot = (W - padL - padR) / HOPS.length;
  const X = (i: number) => padL + slot * (i + 0.5);
  const barH = (rtt: number) => (rtt / yMax) * barMaxH;

  const seaX1 = X(3) + 10;
  const seaX2 = X(5) - 10;

  return (
    <Figure
      title="Reading the Islamabad to Frankfurt trace"
      caption="Hops 1 to 4 stay under 13 ms: local queueing plus a little propagation to Karachi. The 86 ms step to hop 6 is the submarine cable to Europe, steady across all three probes, so it is distance and not congestion. Hop 5 answering nothing is normal: that router is configured not to reply, and traffic still passes through it. RTTs after the sea only creep up, and a later hop can even read lower than an earlier one."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="RTT per hop of a traceroute from Islamabad to Frankfurt">
        {/* y grid */}
        {[0, 40, 80, 120].map((ms) => (
          <g key={ms}>
            <line x1={padL} x2={W - padR} y1={baseY - barH(ms)} y2={baseY - barH(ms)} stroke={P.line} />
            <text x={padL - 6} y={baseY - barH(ms) + 3} textAnchor="end" fill={P.muted} fontSize={10} fontFamily={P.mono}>
              {ms}
            </text>
          </g>
        ))}
        <text x={padL - 6} y={baseY - barMaxH - 12} textAnchor="end" fill={P.text} fontSize={10} fontFamily={P.mono}>
          ms
        </text>

        {/* submarine bracket */}
        <rect x={seaX1} y={baseY - barMaxH - 6} width={seaX2 - seaX1} height={barMaxH + 6} fill={P.amber} opacity={0.06} />
        <line x1={seaX1} x2={seaX2} y1={baseY - barMaxH - 14} y2={baseY - barMaxH - 14} stroke={P.amber} />
        <line x1={seaX1} x2={seaX1} y1={baseY - barMaxH - 18} y2={baseY - barMaxH - 10} stroke={P.amber} />
        <line x1={seaX2} x2={seaX2} y1={baseY - barMaxH - 18} y2={baseY - barMaxH - 10} stroke={P.amber} />
        <text x={(seaX1 + seaX2) / 2} y={baseY - barMaxH - 22} textAnchor="middle" fill={P.amberSoft} fontSize={11}>
          ≈ 8000 km of fiber: propagation, not congestion
        </text>
        <text x={(seaX1 + seaX2) / 2} y={baseY - barMaxH + 8} textAnchor="middle" fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
          +86 ms
        </text>

        {/* bars + dots */}
        {HOPS.map((h, i) => {
          const x = X(i);
          const color = h.where === "local" ? P.green : P.blueSoft;
          return (
            <g key={h.n}>
              {h.rtt !== null ? (
                <>
                  <rect x={x - 9} y={baseY - barH(h.rtt)} width={18} height={barH(h.rtt)} rx={2} fill={color} opacity={0.8} />
                  <text x={x} y={baseY - barH(h.rtt) - 5} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
                    {h.rtt}
                  </text>
                  <circle cx={x} cy={baseY} r={5} fill={color} />
                </>
              ) : (
                <>
                  <text x={x} y={baseY - 40} textAnchor="middle" fill={P.muted} fontSize={12} fontFamily={P.mono}>
                    * * *
                  </text>
                  <circle cx={x} cy={baseY} r={5} fill={P.bg} stroke={P.muted} strokeWidth={1.5} />
                </>
              )}
              <text x={x} y={baseY + 18} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
                {h.n}
              </text>
              <text x={x} y={baseY + 32} textAnchor="middle" fill={h.rtt === null ? P.muted : P.text} fontSize={9}>
                {h.name.split(", ")[0]}
              </text>
              {h.name.includes(", ") && (
                <text x={x} y={baseY + 43} textAnchor="middle" fill={P.text} fontSize={9}>
                  {h.name.split(", ")[1]}
                </text>
              )}
            </g>
          );
        })}
        {/* path line */}
        <line x1={X(0)} x2={X(HOPS.length - 1)} y1={baseY} y2={baseY} stroke={P.lineStrong} />

        {/* map strip */}
        <rect x={padL} y={262} width={W - padL - padR} height={22} rx={4} fill={P.panel} />
        {[
          { x: X(1), t: "Islamabad", a: "middle" },
          { x: X(3) + 16, t: "Karachi", a: "end" },
          { x: X(4) + 8, t: "Arabian · Red Sea · Med", a: "middle" },
          { x: X(5) + 4, t: "Marseille", a: "start" },
          { x: X(7) - 8, t: "Frankfurt", a: "middle" },
        ].map((m) => (
          <text key={m.t} x={m.x} y={276} textAnchor={m.a as "start" | "middle" | "end"} fill={m.t.includes("Sea") ? P.amberSoft : P.text} fontSize={m.t.includes("Sea") ? 8 : 9} fontFamily={P.mono}>
            {m.t}
          </text>
        ))}
      </svg>
    </Figure>
  );
}

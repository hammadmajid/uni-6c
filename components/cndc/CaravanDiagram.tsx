import { Figure, P } from "@/components/learning/Figure";

/**
 * Kurose's caravan analogy as a picture. Booth = router, car = bit, caravan = packet, road = link.
 * Booth services one car every 12 s (transmission). Road is 100 km at 100 km/h (propagation).
 * A second caravan waiting behind a busy booth is queueing delay.
 */
export function CaravanDiagram() {
  const W = 640;
  const H = 260;
  const roadY = 120;
  const booth1X = 250;
  const booth2X = 560;
  const carW = 12;
  const carH = 8;
  const carGap = 4;

  // Ten cars of our caravan: a few already on the road past booth 1, the rest still being serviced / waiting at booth 1.
  const onRoad = [0, 1, 2].map((i) => booth1X + 60 + i * (carW + carGap));
  const atBooth = booth1X - 8; // the car currently being processed
  const waitingOurs = [0, 1, 2, 3, 4, 5].map((i) => booth1X - 30 - i * (carW + carGap));
  // A second caravan (other packet) queued behind ours: queueing delay.
  const queued = [0, 1, 2, 3].map((i) => booth1X - 30 - 6 * (carW + carGap) - 14 - i * (carW + carGap));

  const Car = ({ x, fill, stroke }: { x: number; fill: string; stroke?: string }) => (
    <rect x={x} y={roadY - carH / 2} width={carW} height={carH} rx={2} fill={fill} stroke={stroke} strokeWidth={stroke ? 1 : 0} />
  );

  const Booth = ({ x, label }: { x: number; label: string }) => (
    <g>
      <rect x={x} y={roadY - 26} width={18} height={52} rx={2} fill={P.panel} stroke={P.lineStrong} />
      <line x1={x + 9} x2={x + 9} y1={roadY - 26} y2={roadY - 40} stroke={P.lineStrong} />
      <rect x={x - 2} y={roadY - 46} width={22} height={8} rx={1} fill={P.lineStrong} />
      <text x={x + 9} y={roadY + 42} textAnchor="middle" fill={P.text} fontSize={11} fontFamily={P.mono}>
        {label}
      </text>
    </g>
  );

  return (
    <Figure
      title="The caravan: one packet, two booths, one road"
      caption="Left to right is space, not time. The booth takes 12 s per car no matter how long the road is; the road takes 60 min no matter how many cars. Those two delays never trade off against each other. Cars stacked up behind the booth are the only part that depends on other people's traffic."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Caravan analogy for transmission, propagation and queueing delay">
        {/* road */}
        <rect x={20} y={roadY - 12} width={W - 40} height={24} fill={P.panel} />
        <line x1={20} x2={W - 20} y1={roadY} y2={roadY} stroke={P.lineStrong} strokeDasharray="8 8" />

        {/* booths */}
        <Booth x={booth1X} label="booth 1 (router)" />
        <Booth x={booth2X} label="booth 2 (router)" />

        {/* road distance bracket */}
        <line x1={booth1X + 18} x2={booth2X} y1={roadY + 22} y2={roadY + 22} stroke={P.blueSoft} strokeWidth={1} />
        <line x1={booth1X + 18} x2={booth1X + 18} y1={roadY + 18} y2={roadY + 26} stroke={P.blueSoft} />
        <line x1={booth2X} x2={booth2X} y1={roadY + 18} y2={roadY + 26} stroke={P.blueSoft} />
        <text x={(booth1X + 18 + booth2X) / 2} y={roadY + 38} textAnchor="middle" fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
          100 km road at 100 km/h
        </text>
        <text x={(booth1X + 18 + booth2X) / 2} y={roadY + 52} textAnchor="middle" fill={P.textStrong} fontSize={11}>
          propagation delay = 60 min · d ÷ s
        </text>

        {/* cars on road (already served) */}
        {onRoad.map((x, i) => (
          <Car key={`r${i}`} x={x} fill={P.blueSoft} />
        ))}
        {/* car being served */}
        <Car x={atBooth} fill={P.blue} />
        {/* our cars waiting to be served by booth 1 */}
        {waitingOurs.map((x, i) => (
          <Car key={`w${i}`} x={x} fill={P.blue} />
        ))}
        {/* other caravan queued behind */}
        {queued.map((x, i) => (
          <Car key={`q${i}`} x={x} fill="none" stroke={P.amber} />
        ))}

        {/* transmission bracket above booth 1 */}
        <line x1={waitingOurs[waitingOurs.length - 1]} x2={onRoad[2] + carW} y1={roadY - 58} y2={roadY - 58} stroke={P.blue} />
        <line x1={waitingOurs[waitingOurs.length - 1]} x2={waitingOurs[waitingOurs.length - 1]} y1={roadY - 54} y2={roadY - 62} stroke={P.blue} />
        <line x1={onRoad[2] + carW} x2={onRoad[2] + carW} y1={roadY - 54} y2={roadY - 62} stroke={P.blue} />
        <text x={(waitingOurs[waitingOurs.length - 1] + onRoad[2] + carW) / 2} y={roadY - 68} textAnchor="middle" fill={P.blue} fontSize={11} fontFamily={P.mono}>
          10 cars × 12 s each
        </text>
        <text x={(waitingOurs[waitingOurs.length - 1] + onRoad[2] + carW) / 2} y={roadY - 82} textAnchor="middle" fill={P.textStrong} fontSize={11}>
          transmission delay = 2 min · L ÷ R
        </text>

        {/* queueing label */}
        <line x1={queued[queued.length - 1]} x2={queued[0] + carW} y1={roadY + 22} y2={roadY + 22} stroke={P.amber} />
        <text x={(queued[queued.length - 1] + queued[0] + carW) / 2} y={roadY + 38} textAnchor="middle" fill={P.amber} fontSize={11} fontFamily={P.mono}>
          another caravan
        </text>
        <text x={(queued[queued.length - 1] + queued[0] + carW) / 2} y={roadY + 52} textAnchor="middle" fill={P.textStrong} fontSize={11}>
          queueing delay
        </text>

        {/* mapping table */}
        {[
          ["car", "bit"],
          ["caravan", "packet (L bits)"],
          ["toll booth", "router"],
          ["road", "link"],
          ["12 s per car", "L ÷ R"],
          ["100 km at 100 km/h", "d ÷ s"],
        ].map(([a, b], i) => {
          const col = i < 3 ? 0 : 1;
          const row = i % 3;
          const x = 40 + col * 300;
          const y = 200 + row * 16;
          return (
            <g key={a}>
              <text x={x} y={y} fill={P.text} fontSize={11} fontFamily={P.mono}>
                {a}
              </text>
              <text x={x + 150} y={y} fill={P.muted} fontSize={11}>
                →
              </text>
              <text x={x + 168} y={y} fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
                {b}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

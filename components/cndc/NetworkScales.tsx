import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const padL = 96;
const padR = 16;
const TOP = 24;
const ROW = 46;
const plotW = W - padL - padR;
/** log10(metres) from 0 (1 m) to 7 (10,000 km). */
const x = (log10m: number) => padL + (log10m / 7) * plotW;

const ROWS = [
  { name: "PAN", full: "personal", from: 0, to: 1, eg: "Bluetooth, USB · one person" },
  { name: "LAN", full: "local", from: 1, to: 3, eg: "Ethernet switch, Wi-Fi · one organisation" },
  { name: "CAN", full: "campus", from: 2.7, to: 3.7, eg: "fibre between buildings · campus owner" },
  { name: "MAN", full: "metropolitan", from: 3.7, to: 4.7, eg: "metro fibre, cable TV · ISP or city" },
  { name: "WAN", full: "wide", from: 4.7, to: 7, eg: "leased lines, MPLS, satellite, subsea fibre · carriers" },
];

const TICKS = [
  { v: 0, l: "1 m" },
  { v: 1, l: "10 m" },
  { v: 2, l: "100 m" },
  { v: 3, l: "1 km" },
  { v: 4, l: "10 km" },
  { v: 5, l: "100 km" },
  { v: 6, l: "1000 km" },
  { v: 7, l: "10,000 km" },
];

const axisY = TOP + ROWS.length * ROW + 6;
const H = axisY + 44;

/** Static figure: PAN to WAN on a log distance axis, with typical technology and owner. */
export function NetworkScales() {
  const campus = Math.log10(4000); // H-8 to I-8, roughly 4 km
  return (
    <Figure
      title="Network types by the distance they span"
      caption={
        <>
          Log scale: every tick is ten times the last. The categories overlap on purpose. They are named by typical reach and owner, not by a hard
          limit, which is why the dashed line, SZABIST&apos;s two campuses about 4 km apart, can fairly be called a CAN or a small MAN.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="PAN, LAN, CAN, MAN and WAN placed on a distance axis from 1 metre to 10,000 kilometres">
        {TICKS.map((t) => (
          <line key={t.v} x1={x(t.v)} x2={x(t.v)} y1={TOP - 6} y2={axisY} stroke={P.line} strokeDasharray="2 4" />
        ))}

        {ROWS.map((r, i) => {
          const y = TOP + i * ROW;
          const x0 = x(r.from);
          const x1 = x(r.to);
          const rightHeavy = r.from > 3.5;
          return (
            <g key={r.name}>
              <text x={12} y={y + 16} fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
                {r.name}
              </text>
              <text x={12} y={y + 30} fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {r.full}
              </text>
              <rect x={x0} y={y + 6} width={x1 - x0} height={14} rx={3} fill="rgba(0,112,243,0.22)" stroke={P.blueSoft} />
              <text x={rightHeavy ? x1 : x0} y={y + 34} textAnchor={rightHeavy ? "end" : "start"} fill={P.text} fontSize={10}>
                {r.eg}
              </text>
            </g>
          );
        })}

        {/* Dashed only through the bar bands, so it never crosses a label. */}
        <line x1={x(campus)} x2={x(campus)} y1={TOP - 8} y2={TOP + 2} stroke={P.amber} strokeDasharray="4 3" strokeWidth={1.2} />
        {ROWS.map((_, i) => (
          <line key={i} x1={x(campus)} x2={x(campus)} y1={TOP + i * ROW + 2} y2={TOP + i * ROW + 24} stroke={P.amber} strokeDasharray="4 3" strokeWidth={1.2} />
        ))}
        <line x1={x(campus)} x2={x(campus)} y1={axisY - 8} y2={axisY} stroke={P.amber} strokeWidth={1.2} />
        <text x={x(campus) + 4} y={TOP - 12} fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
          H-8 ↔ I-8 ≈ 4 km
        </text>

        <line x1={padL} x2={W - padR} y1={axisY} y2={axisY} stroke={P.lineStrong} />
        {TICKS.map((t) => (
          <text key={t.v} x={x(t.v)} y={axisY + 16} textAnchor={t.v === 0 ? "start" : t.v === 7 ? "end" : "middle"} fill={P.muted} fontSize={9} fontFamily={P.mono}>
            {t.l}
          </text>
        ))}
        <text x={padL} y={axisY + 36} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          distance spanned (log scale)
        </text>
      </svg>
    </Figure>
  );
}

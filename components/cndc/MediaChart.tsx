import { Figure, P } from "@/components/learning/Figure";

/**
 * Schematic chart: data rate against distance you can cover without a repeater, per physical medium.
 * Deliberately not to scale; the point is the ordering and the guided/unguided split.
 */
export function MediaChart() {
  const W = 640;
  const H = 362;
  const padL = 64;
  const padR = 20;
  const padT = 24;
  const padB = 46;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  // x: log10(metres) from 1 (10 m) to 5 (100 km); y: log10(bps) from 6 (1 Mbps) to 13 (10 Tbps)
  const x = (log10m: number) => padL + ((log10m - 1) / 4) * plotW;
  const y = (log10bps: number) => padT + plotH - ((log10bps - 6) / 7) * plotH;

  const xTicks = [
    { v: 1, l: "10 m" },
    { v: 2, l: "100 m" },
    { v: 3, l: "1 km" },
    { v: 4, l: "10 km" },
    { v: 5, l: "100 km" },
  ];
  const yTicks = [
    { v: 6, l: "1 Mbps" },
    { v: 8, l: "100 Mbps" },
    { v: 9, l: "1 Gbps" },
    { v: 11, l: "100 Gbps" },
    { v: 13, l: "10 Tbps" },
  ];

  type Region = { name: string; pts: [number, number][]; fill: string; stroke: string; guided: boolean; lx: number; ly: number; note?: string };
  const regions: Region[] = [
    { name: "Fiber", guided: true, fill: "rgba(0,112,243,0.22)", stroke: P.blueSoft, pts: [[2, 9], [5, 9.3], [5, 13], [2.6, 13]], lx: 3.9, ly: 11.6, note: "immune to EMI · lowest attenuation" },
    { name: "Coax", guided: true, fill: "rgba(70,167,88,0.18)", stroke: P.greenSoft, pts: [[1, 7.6], [3.2, 7.3], [3.2, 9.6], [1, 10]], lx: 1.7, ly: 8.9 },
    { name: "Twisted pair (UTP)", guided: true, fill: "rgba(255,178,36,0.18)", stroke: P.amberSoft, pts: [[1, 6.2], [2.9, 6], [2.9, 8.2], [1, 10.1]], lx: 1.45, ly: 7.2, note: "Cat 6: 10 Gbps for 55 m, 1 Gbps for 100 m; DSL rate falls with distance" },
    { name: "Wi-Fi", guided: false, fill: "rgba(229,72,77,0.16)", stroke: P.redSoft, pts: [[1, 6.8], [2.3, 6.4], [2.3, 8.5], [1, 9.5]], lx: 1.05, ly: 9.1 },
    { name: "Cellular (4G/5G)", guided: false, fill: "rgba(229,72,77,0.1)", stroke: P.redSoft, pts: [[2.5, 6.6], [4.5, 6.3], [4.5, 8.6], [2.5, 9]], lx: 3.05, ly: 8.35 },
    { name: "Satellite", guided: false, fill: "rgba(229,72,77,0.08)", stroke: P.redSoft, pts: [[4.2, 6.1], [5, 6.1], [5, 8.4], [4.2, 8.2]], lx: 4.3, ly: 7.4, note: "GEO: 36,000 km, ≈250 ms one way" },
  ];

  return (
    <Figure
      title="Physical media: how fast, and how far before a repeater"
      caption={
        <>
          Schematic, not measured. Guided media (solid outline) carry the signal inside a solid: copper pair, coax, glass. Unguided media (dashed outline)
          radiate through air or space. Fiber sits alone in the top right: highest rate, longest unrepeated span, and no electromagnetic interference because it
          carries light, not current. Copper rates collapse with distance, which is the physics behind DSL slowing down as you move away from the exchange.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Chart of data rate against distance for guided and unguided media">
        {/* Grid */}
        {yTicks.map((t) => (
          <g key={t.v}>
            <line x1={padL} x2={W - padR} y1={y(t.v)} y2={y(t.v)} stroke={P.line} strokeWidth={1} />
            <text x={padL - 8} y={y(t.v) + 3.5} textAnchor="end" fill={P.text} fontSize={9.5} fontFamily={P.mono}>
              {t.l}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={t.v}>
            <line x1={x(t.v)} x2={x(t.v)} y1={padT} y2={padT + plotH} stroke={P.line} strokeWidth={1} />
            <text x={x(t.v)} y={padT + plotH + 16} textAnchor="middle" fill={P.text} fontSize={9.5} fontFamily={P.mono}>
              {t.l}
            </text>
          </g>
        ))}
        <text x={W - padR} y={H - 11} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          distance before a repeater →
        </text>
        <text x={14} y={padT + plotH / 2} transform={`rotate(-90 14 ${padT + plotH / 2})`} textAnchor="middle" fill={P.muted} fontSize={9.5} fontFamily={P.mono}>
          data rate ↑
        </text>

        {/* Regions */}
        {regions.map((r) => (
          <g key={r.name}>
            <polygon points={r.pts.map(([a, b]) => `${x(a)},${y(b)}`).join(" ")} fill={r.fill} stroke={r.stroke} strokeWidth={1.2} strokeDasharray={r.guided ? undefined : "4 3"} strokeLinejoin="round" />
            <text x={x(r.lx)} y={y(r.ly)} fill={P.textStrong} fontSize={10.5} fontFamily={P.mono} fontWeight={600}>
              {r.name}
            </text>
          </g>
        ))}
        {/* Notes */}
        <text x={x(2.7)} y={y(12.6)} fill={P.blueSoft} fontSize={9} fontFamily={P.mono}>
          immune to EMI · lowest attenuation
        </text>
        <text x={x(1.05)} y={y(6.35)} fill={P.amberSoft} fontSize={8.5} fontFamily={P.mono}>
          rate falls with distance (DSL)
        </text>
        <text x={x(4.22)} y={y(6.45)} fill={P.redSoft} fontSize={8.5} fontFamily={P.mono}>
          GEO ≈ 250 ms one way
        </text>

        {/* Legend */}
        <g transform={`translate(${padL}, ${H - 26})`}>
          <rect x={0} y={0} width={372} height={22} rx={4} fill={P.bg} stroke={P.line} />
          <line x1={8} y1={11} x2={30} y2={11} stroke={P.textStrong} strokeWidth={1.4} />
          <text x={36} y={14.5} fill={P.text} fontSize={9} fontFamily={P.mono}>
            guided: inside a solid
          </text>
          <line x1={170} y1={11} x2={192} y2={11} stroke={P.textStrong} strokeWidth={1.4} strokeDasharray="4 3" />
          <text x={198} y={14.5} fill={P.text} fontSize={9} fontFamily={P.mono}>
            unguided: radio, air or space
          </text>
        </g>
      </svg>
    </Figure>
  );
}

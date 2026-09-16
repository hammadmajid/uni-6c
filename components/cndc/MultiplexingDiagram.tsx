import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 240;
const USERS = [P.blue, P.green, P.amber, P.redSoft];

/** Static figure: FDM (bands in frequency) beside TDM (slots in time), one circuit highlighted in each. */
export function MultiplexingDiagram() {
  // Left panel: FDM
  const lx = 44;
  const ly = 28;
  const lw = 250;
  const lh = 150;
  const band = lh / 4;
  const guard = 8;

  // Right panel: TDM
  const rx = 350;
  const ry = 28;
  const rw = 270;
  const frames = 3;
  const slots = 4;
  const frameW = rw / frames;
  const slotW = frameW / slots;
  const slotH = 60;

  return (
    <Figure
      title="Two ways to carve one link into circuits"
      caption={
        <>
          Left, FDM: the link&apos;s spectrum is cut into bands and user 3 owns the amber band for the whole call, with small guard bands between
          neighbours. Right, TDM: time is cut into frames, each frame into slots, and user 3 owns slot 3 in every frame. Either way the slice is
          yours whether you are talking or silent. Under TDM the arithmetic is the exam&apos;s favourite: a circuit&apos;s rate is the link rate divided by
          the number of slots.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="FDM bands and TDM slots">
        {/* FDM */}
        <text x={lx} y={16} fill={P.text} fontSize={11} fontFamily={P.mono}>
          FDM · frequency-division
        </text>
        <line x1={lx} y1={ly} x2={lx} y2={ly + lh} stroke={P.lineStrong} />
        <line x1={lx} y1={ly + lh} x2={lx + lw} y2={ly + lh} stroke={P.lineStrong} />
        <text x={lx - 6} y={ly + 8} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          f
        </text>
        <text x={lx + lw} y={ly + lh + 14} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          time →
        </text>
        {USERS.map((c, i) => {
          const y = ly + i * band;
          const hi = i === 2;
          return (
            <g key={i}>
              <rect x={lx + 1} y={y + guard / 2} width={lw - 1} height={band - guard} fill={c} opacity={hi ? 0.85 : 0.3} rx={2} />
              <text x={lx + 10} y={y + band / 2 + 4} fill={hi ? "#000" : P.textStrong} fontSize={10} fontFamily={P.mono}>
                user {i + 1}
              </text>
              {i < USERS.length - 1 && (
                <text x={lx + lw - 6} y={y + band + 3} textAnchor="end" fill={P.muted} fontSize={8} fontFamily={P.mono}>
                  guard
                </text>
              )}
            </g>
          );
        })}
        <text x={lx} y={ly + lh + 34} fill={P.text} fontSize={10}>
          each circuit = one band, all the time
        </text>

        {/* TDM */}
        <text x={rx} y={16} fill={P.text} fontSize={11} fontFamily={P.mono}>
          TDM · time-division
        </text>
        <line x1={rx} y1={ry + slotH + 22} x2={rx + rw} y2={ry + slotH + 22} stroke={P.lineStrong} />
        <text x={rx + rw} y={ry + slotH + 36} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          time →
        </text>
        {Array.from({ length: frames }, (_, f) => (
          <g key={f}>
            <rect x={rx + f * frameW + 1} y={ry + 8} width={frameW - 2} height={slotH + 4} fill="none" stroke={P.lineStrong} rx={3} />
            <text x={rx + f * frameW + frameW / 2} y={ry + 2} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
              frame {f + 1}
            </text>
            {Array.from({ length: slots }, (_, s) => {
              const hi = s === 2;
              return (
                <g key={s}>
                  <rect x={rx + f * frameW + s * slotW + 3} y={ry + 12} width={slotW - 6} height={slotH - 4} rx={2} fill={hi ? P.amber : P.panel} stroke={hi ? P.amber : P.line} />
                  <text x={rx + f * frameW + s * slotW + slotW / 2} y={ry + 12 + slotH / 2 + 2} textAnchor="middle" fill={hi ? "#000" : P.muted} fontSize={10} fontFamily={P.mono}>
                    {s + 1}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
        <text x={rx} y={ry + slotH + 56} fill={P.amberSoft} fontSize={10}>
          user 3 gets slot 3 in every frame
        </text>
        <text x={rx} y={ry + slotH + 78} fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
          rate per circuit = link rate ÷ slots
        </text>
        <text x={rx} y={ry + slotH + 96} fill={P.text} fontSize={10} fontFamily={P.mono}>
          1.536 Mbps ÷ 24 = 64 kbps
        </text>
        <text x={rx} y={ry + slotH + 114} fill={P.muted} fontSize={9}>
          (the T1 line: 24 voice calls of 64 kbps each)
        </text>
      </svg>
    </Figure>
  );
}

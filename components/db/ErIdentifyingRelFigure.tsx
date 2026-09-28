import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 290;

function Oval({ cx, cy, rx, label, under }: { cx: number; cy: number; rx: number; label: string; under?: "solid" | "dashed" }) {
  const tw = label.length * 6.6;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={17} fill={P.panel} stroke={P.textStrong} />
      <text x={cx} y={cy + 4} textAnchor="middle" fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
        {label}
      </text>
      {under && (
        <line
          x1={cx - tw / 2}
          y1={cy + 7}
          x2={cx + tw / 2}
          y2={cy + 7}
          stroke={under === "dashed" ? P.amber : P.textStrong}
          strokeDasharray={under === "dashed" ? "3 2" : undefined}
        />
      )}
    </g>
  );
}

/** Static figure: Elmasri's EMPLOYEE / DEPENDENT weak entity with an identifying relationship, partial key and total participation. */
export function ErIdentifyingRelFigure() {
  const y = 130;
  const eL = { x: 30, w: 140 };
  const eR = { x: 470, w: 140 };
  const dcx = 320;
  const dw = 170;
  const dh = 66;
  return (
    <Figure
      title="A weak entity and its identifying relationship"
      caption={
        <>
          A DEPENDENT has no key of its own: two employees can both have a son called Ahmed. It is identified by its owner&apos;s key (Ssn) plus its{" "}
          <span className="text-amber-600">partial key</span> Dependent_name. The <span className="text-blue-600">double line</span> says every DEPENDENT must take part:
          a weak entity always has total participation in its identifying relationship.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="EMPLOYEE, DEPENDENTS_OF double diamond, DEPENDENT double rectangle">
        {/* attribute connectors */}
        <line x1={100} y1={65} x2={100} y2={y - 20} stroke={P.lineStrong} />
        <line x1={100} y1={y + 20} x2={100} y2={198} stroke={P.lineStrong} />
        <line x1={505} y1={65} x2={525} y2={y - 20} stroke={P.lineStrong} />
        <line x1={480} y1={198} x2={515} y2={y + 20} stroke={P.lineStrong} />
        <line x1={585} y1={198} x2={560} y2={y + 20} stroke={P.lineStrong} />

        {/* EMPLOYEE — diamond: partial, single line */}
        <line x1={eL.x + eL.w} y1={y} x2={dcx - dw / 2} y2={y} stroke={P.textStrong} strokeWidth={1.4} />
        {/* diamond — DEPENDENT: total, double line */}
        <line x1={dcx + dw / 2} y1={y - 3} x2={eR.x} y2={y - 3} stroke={P.blue} strokeWidth={1.4} />
        <line x1={dcx + dw / 2} y1={y + 3} x2={eR.x} y2={y + 3} stroke={P.blue} strokeWidth={1.4} />

        {/* EMPLOYEE */}
        <rect x={eL.x} y={y - 20} width={eL.w} height={40} fill={P.panel} stroke={P.textStrong} />
        <text x={eL.x + eL.w / 2} y={y + 4} textAnchor="middle" fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
          EMPLOYEE
        </text>

        {/* DEPENDENT, double rectangle */}
        <rect x={eR.x} y={y - 20} width={eR.w} height={40} fill={P.panel} stroke={P.textStrong} />
        <rect x={eR.x + 4} y={y - 16} width={eR.w - 8} height={32} fill="none" stroke={P.textStrong} />
        <text x={eR.x + eR.w / 2} y={y + 4} textAnchor="middle" fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
          DEPENDENT
        </text>

        {/* identifying relationship, double diamond */}
        <polygon points={`${dcx - dw / 2},${y} ${dcx},${y - dh / 2} ${dcx + dw / 2},${y} ${dcx},${y + dh / 2}`} fill={P.panel} stroke={P.textStrong} />
        <polygon
          points={`${dcx - dw / 2 + 12},${y} ${dcx},${y - dh / 2 + 5} ${dcx + dw / 2 - 12},${y} ${dcx},${y + dh / 2 - 5}`}
          fill="none"
          stroke={P.textStrong}
        />
        <text x={dcx} y={y + 4} textAnchor="middle" fill={P.textStrong} fontSize={10.5} fontFamily={P.mono}>
          DEPENDENTS_OF
        </text>

        {/* cardinality */}
        <text x={eL.x + eL.w + 10} y={y - 9} fill={P.amber} fontSize={13} fontFamily={P.mono} fontWeight={600}>
          1
        </text>
        <text x={eR.x - 10} y={y - 11} textAnchor="end" fill={P.amber} fontSize={13} fontFamily={P.mono} fontWeight={600}>
          N
        </text>

        {/* attributes */}
        <Oval cx={100} cy={48} rx={36} label="Ssn" under="solid" />
        <Oval cx={100} cy={215} rx={40} label="Name" />
        <Oval cx={505} cy={48} rx={68} label="Dependent_name" under="dashed" />
        <Oval cx={470} cy={215} rx={50} label="Birth_date" />
        <Oval cx={585} cy={215} rx={50} label="Relation" />

        {/* annotations */}
        <text x={180} y={52} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          key: solid underline
        </text>
        <text x={478} y={78} textAnchor="end" fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
          partial key: dashed underline
        </text>
        <text x={dcx} y={y + dh / 2 + 18} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
          identifying relationship
        </text>
        <text x={dcx} y={y + dh / 2 + 31} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
          (double diamond)
        </text>

        {/* legend */}
        <line x1={16} y1={250} x2={W - 16} y2={250} stroke={P.line} />
        <text x={16} y={268} fill={P.text} fontSize={10} fontFamily={P.mono}>
          double rectangle = weak entity · double diamond = identifying relationship
        </text>
        <text x={16} y={283} fill={P.text} fontSize={10} fontFamily={P.mono}>
          <tspan fill={P.blueSoft}>double line = total participation</tspan> · single line = partial
        </text>
      </svg>
    </Figure>
  );
}

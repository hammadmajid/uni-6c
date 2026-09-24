import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 190;

function Outer({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <text x={x} y={20} fill={P.text} fontSize={11} fontFamily={P.mono}>
        {label}
      </text>
      <text x={x} y={52} fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
        grid →
      </text>
      <rect x={x + 52} y={34} width={36} height={28} rx={3} fill={P.panel} stroke={P.lineStrong} />
      <rect x={x + 88} y={34} width={36} height={28} rx={3} fill={P.panel} stroke={P.lineStrong} />
      <text x={x + 55} y={43} fill={P.muted} fontSize={8} fontFamily={P.mono}>
        [0]
      </text>
      <text x={x + 91} y={43} fill={P.muted} fontSize={8} fontFamily={P.mono}>
        [1]
      </text>
      <circle cx={x + 72} cy={50} r={3} fill={P.textStrong} />
      <circle cx={x + 108} cy={50} r={3} fill={P.textStrong} />
    </g>
  );
}

function Inner({ x, y, vals, stroke }: { x: number; y: number; vals: string[]; stroke: string }) {
  return (
    <g>
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={x + i * 30} y={y} width={30} height={26} rx={3} fill={P.panel} stroke={stroke} />
          <text x={x + i * 30 + 15} y={y + 17} textAnchor="middle" fill={v === "9" ? P.amberSoft : P.textStrong} fontSize={11} fontFamily={P.mono}>
            {v}
          </text>
        </g>
      ))}
    </g>
  );
}

/** [[0]*3]*2 copies a reference twice; the comprehension builds two lists. After grid[0][0] = 9. */
export function AliasFigure() {
  const L = 20;
  const R = 340;
  return (
    <Figure
      title="Two references to one list, or two lists"
      caption={
        <>
          Both grids after <code>grid[0][0] = 9</code>. Multiplying a list copies its references, not the objects they point at, so on the left both rows are the same inner list
          and the 9 shows up twice. The comprehension on the right runs <code>[0] * 3</code> once per row.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="List aliasing">
        <Outer x={L} label="[[0] * 3] * 2" />
        <path d={`M ${L + 72} 50 C ${L + 70} 110, ${L + 120} 120, ${L + 150} 128`} fill="none" stroke={P.red} strokeWidth={1.2} />
        <path d={`M ${L + 108} 50 C ${L + 106} 100, ${L + 130} 115, ${L + 150} 128`} fill="none" stroke={P.red} strokeWidth={1.2} />
        <Inner x={L + 150} y={116} vals={["9", "0", "0"]} stroke={P.red} />
        <text x={L} y={176} fill={P.redSoft} fontSize={10} fontFamily={P.mono}>
          print(grid) → [[9, 0, 0], [9, 0, 0]]
        </text>

        <line x1={W / 2} x2={W / 2} y1={6} y2={H - 6} stroke={P.line} />

        <Outer x={R} label="[[0] * 3 for _ in range(2)]" />
        <path d={`M ${R + 72} 50 C ${R + 70} 90, ${R + 110} 96, ${R + 150} 96`} fill="none" stroke={P.green} strokeWidth={1.2} />
        <path d={`M ${R + 108} 50 C ${R + 106} 120, ${R + 120} 140, ${R + 150} 140`} fill="none" stroke={P.green} strokeWidth={1.2} />
        <Inner x={R + 150} y={84} vals={["9", "0", "0"]} stroke={P.green} />
        <Inner x={R + 150} y={128} vals={["0", "0", "0"]} stroke={P.green} />
        <text x={R} y={176} fill={P.greenSoft} fontSize={10} fontFamily={P.mono}>
          print(grid) → [[9, 0, 0], [0, 0, 0]]
        </text>
      </svg>
    </Figure>
  );
}

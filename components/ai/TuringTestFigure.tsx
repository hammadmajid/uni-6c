import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 250;

/** Static figure: the imitation game. A judge talks by text to two hidden respondents. */
export function TuringTestFigure() {
  const judge = { x: 24, y: 80, w: 190, h: 96 };
  const wallX = 330;
  const a = { x: 430, y: 30, w: 186, h: 76 };
  const b = { x: 430, y: 150, w: 186, h: 76 };

  return (
    <Figure
      title="The Turing test (the imitation game, 1950)"
      caption={
        <>
          The judge sees only text from two channels, labelled X and Y, and must say which one is the machine. The wall matters: it removes voice and
          appearance, so the test is about <strong>behaviour in conversation</strong> only. If, over many rounds, the judge cannot reliably tell them apart,
          the machine passes.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A human judge exchanging text with a hidden human and a hidden machine">
        {/* judge */}
        <rect x={judge.x} y={judge.y} width={judge.w} height={judge.h} rx={8} fill={P.panel} stroke={P.lineStrong} />
        <circle cx={judge.x + 34} cy={judge.y + 38} r={14} fill="none" stroke={P.textStrong} strokeWidth={1.4} />
        <path d={`M ${judge.x + 14} ${judge.y + 80} q 20 -26 40 0`} fill="none" stroke={P.textStrong} strokeWidth={1.4} />
        <text x={judge.x + 66} y={judge.y + 34} fill={P.textStrong} fontSize={13}>
          Judge
        </text>
        <text x={judge.x + 66} y={judge.y + 52} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          interrogator
        </text>
        <text x={judge.x + 66} y={judge.y + 68} fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
          &quot;which is the
        </text>
        <text x={judge.x + 66} y={judge.y + 82} fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
          machine?&quot;
        </text>

        {/* wall */}
        <rect x={wallX - 6} y={24} width={12} height={H - 48} fill={P.line} stroke={P.lineStrong} />
        <text x={wallX} y={14} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
          wall: no voice, no face
        </text>

        {/* channels */}
        {[
          { box: a, label: "channel X", y: a.y + a.h / 2 },
          { box: b, label: "channel Y", y: b.y + b.h / 2 },
        ].map((c) => (
          <g key={c.label}>
            <path d={`M ${judge.x + judge.w} ${judge.y + judge.h / 2} C ${judge.x + judge.w + 60} ${judge.y + judge.h / 2}, ${wallX - 60} ${c.y}, ${c.box.x} ${c.y}`} fill="none" stroke={P.blueSoft} strokeWidth={1.4} strokeDasharray="4 3" />
            <rect x={(wallX + c.box.x) / 2 - 38} y={c.y - 22} width={76} height={16} rx={3} fill={P.bg} />
            <text x={(wallX + c.box.x) / 2} y={c.y - 10} textAnchor="middle" fill={P.blueSoft} fontSize={10} fontFamily={P.mono}>
              {c.label}
            </text>
          </g>
        ))}
        <text x={judge.x + 14} y={judge.y + judge.h + 18} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          text only, typed through a terminal
        </text>

        {/* respondents */}
        <rect x={a.x} y={a.y} width={a.w} height={a.h} rx={8} fill="rgba(70,167,88,0.08)" stroke={P.green} />
        <text x={a.x + 14} y={a.y + 28} fill={P.textStrong} fontSize={13}>
          Human respondent
        </text>
        <text x={a.x + 14} y={a.y + 48} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          answers honestly
        </text>

        <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} fill="rgba(0,112,243,0.10)" stroke={P.blue} />
        <text x={b.x + 14} y={b.y + 28} fill={P.textStrong} fontSize={13}>
          Machine
        </text>
        <text x={b.x + 14} y={b.y + 48} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          tries to pass as human
        </text>

        <text x={a.x + a.w} y={b.y + b.h + 20} textAnchor="end" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          the judge does not know which is which
        </text>
      </svg>
    </Figure>
  );
}

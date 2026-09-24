import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 318;

const TABLES = [
  { name: "PersonalData", cols: ["RNo", "Name", "Contact"], rows: [["1", "Ali Faisal", "5647899"], ["2", "Athar Aslam", "6545442"]] },
  { name: "ResultData", cols: ["RNo", "Term-1-Marks", "Term-2-Marks"], rows: [["1", "344", "510"], ["2", "430", "375"]] },
  { name: "FeeData", cols: ["RNo", "Installment-1", "Installment-2"], rows: [["1", "40000", "55000"], ["2", "58000", "47000"]] },
];

const EVENTS = [
  { t: "Ali Faisal enrols", sub: "gives his phone number" },
  { t: "Ali sits term 1", sub: "scores 344" },
  { t: "Ali pays a fee", sub: "instalment 1: 40,000" },
];

/** Static figure: the lecture's "An Example Database", with the miniworld it models on the left. */
export function MiniworldDiagram() {
  const lx = 16;
  const lw = 176;
  const tx = 262;
  const tw = W - tx - 16;
  const colW = tw / 3;
  const rowH = 17;
  const tH = 20 + rowH * 3;

  return (
    <Figure
      title="A miniworld and the database that models it"
      caption={
        <>
          The lecture&apos;s example database: three tables about the same students, tied together by <span className="text-blue-600">RNo</span>. Each event in the
          miniworld on the left becomes a recorded fact on the right, which is what &quot;changes to the miniworld are reflected in the database&quot; means.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="University miniworld events mapped to three student tables">
        <defs>
          <marker id="mw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={P.lineStrong} />
          </marker>
        </defs>

        <text x={lx} y={18} fill={P.text} fontSize={10} fontFamily={P.mono}>
          miniworld (universe of discourse)
        </text>
        <rect x={lx} y={28} width={lw} height={H - 44} rx={8} fill="none" stroke={P.lineStrong} strokeDasharray="4 4" />

        <text x={tx} y={18} fill={P.text} fontSize={10} fontFamily={P.mono}>
          Student database
        </text>

        {TABLES.map((t, i) => {
          const y = 28 + i * (tH + 14);
          const ev = EVENTS[i];
          const ey = y + tH / 2 - 20;
          return (
            <g key={t.name}>
              {/* Miniworld event */}
              <rect x={lx + 12} y={ey} width={lw - 24} height={40} rx={6} fill={P.panel} stroke={P.lineStrong} />
              <text x={lx + 22} y={ey + 17} fill={P.textStrong} fontSize={11}>
                {ev.t}
              </text>
              <text x={lx + 22} y={ey + 31} fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {ev.sub}
              </text>
              <line x1={lx + lw - 10} y1={ey + 20} x2={tx - 6} y2={y + tH / 2} stroke={P.lineStrong} markerEnd="url(#mw-arrow)" />

              {/* Table */}
              <rect x={tx} y={y} width={tw} height={tH} rx={5} fill={P.panel} stroke={P.lineStrong} />
              <text x={tx + 8} y={y + 14} fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
                {t.name}
              </text>
              {t.cols.map((c, j) => (
                <text key={c} x={tx + 8 + j * colW} y={y + 14 + rowH} fill={j === 0 ? P.blueSoft : P.text} fontSize={9} fontFamily={P.mono}>
                  {c}
                </text>
              ))}
              <line x1={tx} x2={tx + tw} y1={y + 20 + rowH - 1} y2={y + 20 + rowH - 1} stroke={P.line} />
              {t.rows.map((r, k) =>
                r.map((v, j) => (
                  <text
                    key={`${k}-${j}`}
                    x={tx + 8 + j * colW}
                    y={y + 14 + rowH * (k + 2)}
                    fill={j === 0 ? P.blueSoft : k === 0 ? P.amberSoft : P.textStrong}
                    fontSize={10}
                    fontFamily={P.mono}
                  >
                    {v}
                  </text>
                )),
              )}
            </g>
          );
        })}
        <text x={tx} y={H - 6} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          amber row = Ali, whose events are on the left
        </text>
      </svg>
    </Figure>
  );
}

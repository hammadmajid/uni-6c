import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 310;

const CELLS = [
  { row: 0, col: 0, title: "Thinking humanly", tag: "cognitive modelling", body: ["Model how people actually", "think; test against brains", "and psychology experiments."] },
  { row: 0, col: 1, title: "Thinking rationally", tag: "laws of thought", body: ["Reason by correct logic:", "premises in, valid", "conclusions out."] },
  { row: 1, col: 0, title: "Acting humanly", tag: "the Turing test", body: ["Behave so that people", "cannot tell you from", "a human."] },
  { row: 1, col: 1, title: "Acting rationally", tag: "rational agent (R&N)", body: ["Do whatever maximises the", "expected performance", "measure. The book's choice."] },
];

/** Static figure: Russell and Norvig's 2×2 of definitions of AI, with the lecture's definition and the textbook's choice marked. */
export function AiFourApproaches() {
  const left = 110;
  const top = 58;
  const cw = (W - left - 16) / 2;
  const ch = 108;

  return (
    <Figure
      title="Four ways to define AI (Russell & Norvig, ch. 1)"
      caption={
        <>
          Two questions split the definitions: is AI about <strong>thought</strong> or <strong>behaviour</strong>, and is it measured against{" "}
          <strong>humans</strong> or against an ideal of <strong>rationality</strong>? The lecture&apos;s definition (&quot;simulation of human
          intelligence&quot;) sits in the amber column. The textbook builds on the blue cell, and so does the rest of this course: from lecture 2 on, AI means
          designing rational agents.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Two by two grid: thinking or acting, humanly or rationally">
        {/* column headers */}
        <text x={left + cw / 2} y={22} textAnchor="middle" fill={P.amberSoft} fontSize={12} fontFamily={P.mono}>
          measured against humans
        </text>
        <text x={left + cw + cw / 2} y={22} textAnchor="middle" fill={P.text} fontSize={12} fontFamily={P.mono}>
          measured against rationality
        </text>
        <path d={`M ${left + 6} ${38} h ${cw - 12}`} stroke={P.amber} strokeWidth={1.4} />
        <text x={left + cw / 2} y={52} textAnchor="middle" fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
          the lecture&apos;s definition lives here
        </text>

        {/* row headers */}
        {["thought", "behaviour"].map((r, i) => (
          <g key={r}>
            <text x={left - 14} y={top + i * ch + ch / 2 - 4} textAnchor="end" fill={P.textStrong} fontSize={12}>
              {i === 0 ? "Thinking" : "Acting"}
            </text>
            <text x={left - 14} y={top + i * ch + ch / 2 + 12} textAnchor="end" fill={P.muted} fontSize={10} fontFamily={P.mono}>
              {r}
            </text>
          </g>
        ))}

        {CELLS.map((c) => {
          const x = left + c.col * cw;
          const y = top + c.row * ch;
          const chosen = c.row === 1 && c.col === 1;
          return (
            <g key={c.title}>
              <rect
                x={x + 4}
                y={y + 4}
                width={cw - 8}
                height={ch - 8}
                rx={8}
                fill={chosen ? "rgba(0,112,243,0.12)" : P.panel}
                stroke={chosen ? P.blue : P.lineStrong}
                strokeWidth={chosen ? 1.6 : 1}
              />
              <text x={x + 18} y={y + 26} fill={chosen ? P.blueSoft : P.textStrong} fontSize={13}>
                {c.title}
              </text>
              <text x={x + 18} y={y + 42} fill={chosen ? P.blueSoft : P.muted} fontSize={9} fontFamily={P.mono}>
                {c.tag}
              </text>
              {c.body.map((line, k) => (
                <text key={k} x={x + 18} y={y + 60 + k * 14} fill={P.text} fontSize={11}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        <text x={left + 4} y={H - 12} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          rows: what is judged · columns: the yardstick
        </text>
      </svg>
    </Figure>
  );
}

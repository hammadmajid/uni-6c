import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 250;

type Box = { x: number; y: number; label: string; tone: "root" | "guided" | "unguided" | "leaf" };

function BoxNode({ b }: { b: Box }) {
  const w = b.label.length * 6.6 + 16;
  const stroke = b.tone === "guided" ? P.blue : b.tone === "unguided" ? P.green : b.tone === "root" ? P.lineStrong : P.line;
  const fill = b.tone === "guided" ? "rgba(0,112,243,0.14)" : b.tone === "unguided" ? "rgba(70,167,88,0.14)" : P.panel;
  return (
    <g>
      <rect x={b.x - w / 2} y={b.y - 12} width={w} height={24} rx={4} fill={fill} stroke={stroke} />
      <text x={b.x} y={b.y + 4} textAnchor="middle" fill={P.textStrong} fontSize={11}>
        {b.label}
      </text>
    </g>
  );
}

function Elbow({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const mid = (from.y + 12 + to.y - 12) / 2;
  return <path d={`M ${from.x} ${from.y + 12} V ${mid} H ${to.x} V ${to.y - 12}`} fill="none" stroke={P.lineStrong} />;
}

/** Static figure: the lecture's classification tree of transmission media, with the one-line facts for unguided bands. */
export function MediaTree() {
  const root: Box = { x: 350, y: 22, label: "Transmission media", tone: "root" };
  const guided: Box = { x: 195, y: 78, label: "Guided (wired)", tone: "guided" };
  const unguided: Box = { x: 520, y: 78, label: "Unguided (wireless)", tone: "unguided" };
  const tp: Box = { x: 75, y: 134, label: "Twisted pair", tone: "guided" };
  const coax: Box = { x: 198, y: 134, label: "Coaxial", tone: "guided" };
  const fibre: Box = { x: 318, y: 134, label: "Fibre optic", tone: "guided" };
  const leaves: [Box, Box][] = [
    [tp, { x: 45, y: 190, label: "UTP", tone: "leaf" }],
    [tp, { x: 105, y: 190, label: "STP", tone: "leaf" }],
    [coax, { x: 160, y: 190, label: "baseband", tone: "leaf" }],
    [coax, { x: 240, y: 190, label: "broadband", tone: "leaf" }],
  ];
  const waves = [
    { b: { x: 432, y: 134, label: "Radio waves", tone: "unguided" } as Box, l1: "3 kHz–1 GHz", l2: "omni · FM, TV" },
    { b: { x: 522, y: 134, label: "Microwaves", tone: "unguided" } as Box, l1: "1–300 GHz", l2: "LOS · cell, sat" },
    { b: { x: 602, y: 134, label: "Infrared", tone: "unguided" } as Box, l1: "0.3–400 THz", l2: "one room" },
  ];

  return (
    <Figure
      title="Transmission media, classified as on the slide"
      caption={
        <>
          Guided media carry the signal along a physical path; unguided media radiate it through air or space. Frequency bands follow Forouzan. Wi-Fi
          and cellular sit in the microwave band. The slide does not split fibre, but you will meet single-mode and multimode in the lesson.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Tree: transmission media splits into guided (twisted pair, coaxial, fibre) and unguided (radio, microwave, infrared)">
        <Elbow from={root} to={guided} />
        <Elbow from={root} to={unguided} />
        {[tp, coax, fibre].map((c) => (
          <Elbow key={c.label} from={guided} to={c} />
        ))}
        {waves.map((w) => (
          <Elbow key={w.b.label} from={unguided} to={w.b} />
        ))}
        {leaves.map(([p, c]) => (
          <Elbow key={c.label} from={p} to={c} />
        ))}

        <BoxNode b={root} />
        <BoxNode b={guided} />
        <BoxNode b={unguided} />
        <BoxNode b={tp} />
        <BoxNode b={coax} />
        <BoxNode b={fibre} />
        {leaves.map(([, c]) => (
          <BoxNode key={c.label} b={c} />
        ))}
        <text x={fibre.x} y={180} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          single-mode ·
        </text>
        <text x={fibre.x} y={193} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          multimode
        </text>
        {waves.map((w) => (
          <g key={w.b.label}>
            <BoxNode b={w.b} />
            <text x={w.b.x} y={170} textAnchor="middle" fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
              {w.l1}
            </text>
            <text x={w.b.x} y={184} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
              {w.l2}
            </text>
          </g>
        ))}
        <text x={20} y={H - 14} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          baseband coax: one signal, e.g. old 10BASE2 Ethernet · broadband coax: many FDM channels, e.g. cable TV
        </text>
      </svg>
    </Figure>
  );
}

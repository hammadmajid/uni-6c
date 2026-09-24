import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const ROW = 104;
const H = ROW * 3 + 8;
const X0 = 20;
const NOTE_X = 356;

type Layer = { r: number; end: number; fill: string; stroke: string; label: string; above: boolean };

/** One stepped cutaway: inner layers stick out further to the right, so draw innermost first and let each outer layer cover it. */
function Cutaway({ cy, layers }: { cy: number; layers: Layer[] }) {
  return (
    <g>
      {[...layers].reverse().map((l) => (
        <rect key={l.label} x={X0} y={cy - l.r} width={l.end - X0} height={2 * l.r} rx={Math.min(l.r, 6)} fill={l.fill} stroke={l.stroke} />
      ))}
      {layers.map((l, i) => {
        const start = i === 0 ? X0 : layers[i - 1].end;
        const mid = (start + l.end) / 2;
        const outer = layers[0].r;
        const ly = l.above ? cy - outer - 14 : cy + outer + 20;
        const edge = l.above ? cy - l.r : cy + l.r;
        return (
          <g key={`lab-${l.label}`}>
            <line x1={mid} x2={mid} y1={l.above ? ly + 4 : ly - 11} y2={edge} stroke={P.muted} strokeWidth={0.8} />
            <text x={mid} y={ly} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
              {l.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Notes({ y, title, lines }: { y: number; title: string; lines: string[] }) {
  return (
    <g>
      <text x={NOTE_X} y={y} fill={P.textStrong} fontSize={12}>
        {title}
      </text>
      {lines.map((t, i) => (
        <text key={i} x={NOTE_X} y={y + 18 + i * 15} fill={P.text} fontSize={10}>
          {t}
        </text>
      ))}
    </g>
  );
}

/** Two copper wires twisted around each other, drawn as crossing sine curves. */
function TwistedPair({ cy }: { cy: number }) {
  const x1 = 320;
  const amp = 7;
  const period = 26;
  const wire = (phase: number) => {
    let d = "";
    for (let x = X0 + 6; x <= x1; x += 2) {
      const y = cy + amp * Math.sin(((x - X0) / period) * 2 * Math.PI + phase);
      d += `${d ? "L" : "M"} ${x} ${y.toFixed(1)} `;
    }
    return d;
  };
  return (
    <g>
      <rect x={X0} y={cy - 20} width={x1 - X0 + 10} height={40} rx={8} fill="#1f1f1f" stroke={P.muted} />
      <rect x={176} y={cy - 15} width={x1 - 176 + 6} height={30} rx={5} fill="rgba(143,143,143,0.14)" stroke={P.text} strokeDasharray="3 2" />
      <path d={wire(0)} fill="none" stroke={P.amberSoft} strokeWidth={2.4} />
      <path d={wire(Math.PI)} fill="none" stroke={P.blueSoft} strokeWidth={2.4} />
      <line x1={96} x2={96} y1={cy - 34} y2={cy - 9} stroke={P.muted} strokeWidth={0.8} />
      <text x={96} y={cy - 38} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
        one pair, twisted
      </text>
      <line x1={248} x2={248} y1={cy - 34} y2={cy - 15} stroke={P.muted} strokeWidth={0.8} />
      <text x={248} y={cy - 38} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
        foil shield (STP only)
      </text>
      <line x1={60} x2={60} y1={cy + 20} y2={cy + 30} stroke={P.muted} strokeWidth={0.8} />
      <text x={60} y={cy + 40} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
        jacket
      </text>
      <text x={100} y={cy + 40} fill={P.muted} fontSize={9} fontFamily={P.mono}>
        UTP ←┆→ STP
      </text>
      <line x1={172} x2={172} y1={cy - 22} y2={cy + 22} stroke={P.muted} strokeDasharray="2 2" />
    </g>
  );
}

/** Static figure: cutaways of twisted pair, coax and fibre, with the facts an exam asks about each. */
export function MediaCutaway() {
  const cy = [ROW / 2 + 4, ROW * 1.5 + 4, ROW * 2.5 + 4];
  const coax: Layer[] = [
    { r: 24, end: 130, fill: "#242424", stroke: P.muted, label: "jacket", above: true },
    { r: 20, end: 190, fill: "rgba(143,143,143,0.30)", stroke: P.text, label: "braided shield", above: false },
    { r: 15, end: 255, fill: "#3a3a3a", stroke: P.lineStrong, label: "insulator", above: true },
    { r: 4, end: 322, fill: P.amberSoft, stroke: P.amber, label: "copper core", above: false },
  ];
  const fibre: Layer[] = [
    { r: 22, end: 120, fill: "#242424", stroke: P.muted, label: "jacket", above: true },
    { r: 18, end: 175, fill: "#303030", stroke: P.lineStrong, label: "buffer", above: false },
    { r: 13, end: 245, fill: "rgba(0,112,243,0.12)", stroke: P.blue, label: "cladding (glass)", above: true },
    { r: 6, end: 322, fill: "rgba(50,145,255,0.30)", stroke: P.blueSoft, label: "core (glass)", above: false },
  ];

  // Zigzag ray bouncing inside the fibre core, from the cladding step to the end.
  let ray = "";
  for (let x = 250, up = true; x <= 318; x += 12, up = !up) ray += `${ray ? "L" : "M"} ${x} ${cy[2] + (up ? -4.5 : 4.5)} `;

  return (
    <Figure
      title="Guided media, cut open"
      caption={
        <>
          The copper media differ in how they fight interference. Twisting makes noise hit both wires of a pair equally so it cancels at the receiver; a
          shield blocks it outright. Fibre carries light, so electrical noise cannot touch it at all. Total internal reflection at the core and cladding
          boundary (the blue zigzag) keeps the light in.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cutaway drawings of twisted-pair, coaxial and fibre-optic cable">
        <line x1={0} x2={W} y1={ROW + 4} y2={ROW + 4} stroke={P.line} />
        <line x1={0} x2={W} y1={2 * ROW + 4} y2={2 * ROW + 4} stroke={P.line} />

        <TwistedPair cy={cy[0]} />
        <Notes
          y={cy[0] - 20}
          title="Twisted pair (UTP, STP)"
          lines={["Cat 5e/6 with RJ45 plugs: most LANs", "Cat 6: 1 Gbps to 100 m, 10 Gbps to 55 m", "STP: less EMI, but stiffer, dearer, grounded"]}
        />

        <Cutaway cy={cy[1]} layers={coax} />
        <Notes y={cy[1] - 20} title="Coaxial" lines={["shield blocks EMI; more bandwidth than TP", "cable TV and HFC Internet (broadband)", "old 10BASE2 Ethernet bus (baseband)"]} />

        <Cutaway cy={cy[2]} layers={fibre} />
        <path d={ray} fill="none" stroke={P.blue} strokeWidth={1.4} />
        <Notes y={cy[2] - 20} title="Fibre optic" lines={["light pulses: immune to EMI, hard to tap", "~0.2 dB/km loss: tens of km per span", "costly to splice; the backbone medium"]} />
      </svg>
    </Figure>
  );
}

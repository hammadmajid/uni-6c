import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 262;

function Chip({ x, y, label, tone }: { x: number; y: number; label: string; tone: "blue" | "green" | "gray" }) {
  const c = { blue: P.blue, green: P.green, gray: P.lineStrong }[tone];
  const t = { blue: P.blueSoft, green: P.greenSoft, gray: P.text }[tone];
  const w = label.length * 7 + 20;
  return (
    <g>
      <rect x={x} y={y} width={w} height={24} rx={12} fill={P.bg} stroke={c} />
      <text x={x + w / 2} y={y + 16} textAnchor="middle" fill={t} fontSize={11} fontFamily={P.mono}>
        {label}
      </text>
    </g>
  );
}

/** Static figure: nested sets super key ⊃ candidate key ⊃ primary key, on the STUDENT table from the key-finder lab. */
export function DbKeyHierarchyFigure() {
  return (
    <Figure
      title="Every primary key is a candidate key; every candidate key is a super key"
      caption={
        <>
          The STUDENT table from the lab. Of the 31 non-empty column sets, 28 are super keys, 3 of those are minimal (candidate keys), and the designer promotes one
          to <span className="text-blue-600">primary key</span>. The other candidates become <span className="text-green-600">alternate keys</span>.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Nested sets of keys">
        {/* all attribute sets */}
        <rect x={10} y={10} width={620} height={242} rx={10} fill="none" stroke={P.line} />
        <text x={24} y={30} fill={P.muted} fontSize={11} fontFamily={P.mono}>
          all column sets (31)
        </text>
        {["Does the set contain reg_no,", "cnic or email?", "", "yes → super key (right)", "no  → not a key (below)"].map((t, i) => (
          <text key={i} x={24} y={78 + i * 16} fill={i >= 3 ? P.textStrong : P.text} fontSize={10.5} fontFamily={P.mono}>
            {t}
          </text>
        ))}
        <Chip x={24} y={200} label="name" tone="gray" />
        <Chip x={94} y={200} label="section" tone="gray" />
        <Chip x={178} y={200} label="name, section" tone="gray" />
        <text x={24} y={192} fill={P.redSoft} fontSize={10} fontFamily={P.mono}>
          not keys (3)
        </text>

        {/* super keys */}
        <rect x={290} y={22} width={328} height={220} rx={10} fill="rgba(255,178,36,0.05)" stroke={P.amber} />
        <text x={304} y={42} fill={P.amberSoft} fontSize={11} fontFamily={P.mono}>
          super keys (28)
        </text>
        <text x={304} y={58} fill={P.text} fontSize={10} fontFamily={P.mono}>
          e.g. reg_no, name · cnic, email, section
        </text>

        {/* candidate keys */}
        <rect x={304} y={72} width={300} height={156} rx={10} fill="rgba(70,167,88,0.05)" stroke={P.green} />
        <text x={318} y={92} fill={P.greenSoft} fontSize={11} fontFamily={P.mono}>
          candidate keys (3) = minimal super keys
        </text>

        {/* primary key */}
        <rect x={318} y={106} width={136} height={68} rx={10} fill="rgba(0,112,243,0.08)" stroke={P.blue} />
        <text x={330} y={124} fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
          primary key (1)
        </text>
        <Chip x={330} y={136} label="reg_no" tone="blue" />

        <text x={470} y={124} fill={P.greenSoft} fontSize={11} fontFamily={P.mono}>
          alternate keys
        </text>
        <Chip x={470} y={136} label="cnic" tone="green" />
        <Chip x={528} y={136} label="email" tone="green" />

        <text x={318} y={200} fill={P.text} fontSize={10} fontFamily={P.mono}>
          primary ⊂ candidate ⊂ super
        </text>
        <text x={318} y={215} fill={P.text} fontSize={10} fontFamily={P.mono}>
          alternate = candidate − primary
        </text>
      </svg>
    </Figure>
  );
}

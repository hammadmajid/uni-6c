import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const ROW = 22;
const TOP = 34;
const LX = 16;
const RX = 372;

interface Src {
  name: string;
  depth: number;
  /** index into WAR rows this ends up at, or null if it is not packaged */
  to?: number | null;
  tone?: "blue" | "green" | "amber" | "muted" | "red";
}

const SRC: Src[] = [
  { name: "demo/", depth: 0 },
  { name: "src/main/java/", depth: 1 },
  { name: "com/example/demo/HelloServlet.java", depth: 2, to: 2, tone: "blue" },
  { name: "src/main/resources/", depth: 1, to: 1, tone: "blue" },
  { name: "src/main/webapp/", depth: 1 },
  { name: "WEB-INF/web.xml", depth: 2, to: 3, tone: "amber" },
  { name: "index.jsp", depth: 2, to: 4, tone: "green" },
  { name: "src/test/", depth: 1, to: null, tone: "muted" },
  { name: "pom.xml  (dependencies)", depth: 1, to: 6, tone: "amber" },
  { name: "target/demo.war", depth: 1, tone: "blue" },
];

const WAR: { name: string; depth: number; tone?: "blue" | "green" | "amber" | "muted" }[] = [
  { name: "demo.war  (a zip)", depth: 0 },
  { name: "WEB-INF/classes/", depth: 1, tone: "blue" },
  { name: "com/example/demo/HelloServlet.class", depth: 2, tone: "blue" },
  { name: "WEB-INF/web.xml", depth: 1, tone: "amber" },
  { name: "index.jsp", depth: 1, tone: "green" },
  { name: "WEB-INF/lib/", depth: 1, tone: "amber" },
  { name: "postgresql-42.x.jar", depth: 2, tone: "amber" },
  { name: "META-INF/MANIFEST.MF", depth: 1, tone: "muted" },
];

const col = { blue: P.blueSoft, green: P.greenSoft, amber: P.amberSoft, muted: P.muted, red: P.redSoft };

/** Static figure: what IntelliJ shows you (Maven layout) on the left, what mvn package puts in the WAR on the right. */
export function WarBuild() {
  const H = TOP + Math.max(SRC.length, WAR.length) * ROW + 66;
  const y = (i: number) => TOP + i * ROW + 14;
  return (
    <Figure
      title="Development view → WAR"
      caption={
        <>
          IntelliJ shows the Maven source layout (slides 26 to 27); Tomcat only ever sees the right-hand side. Java is compiled into WEB-INF/classes, the
          contents of src/main/webapp are copied to the WAR&apos;s root, and dependencies with compile scope land in WEB-INF/lib. The servlet API itself is
          scope provided, so it is left out: Tomcat&apos;s own lib/ supplies it at runtime.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Maven project files mapped to WAR entries">
        <text x={LX} y={16} fill={P.text} fontSize={11} fontFamily={P.mono}>
          IntelliJ project (source)
        </text>
        <text x={RX} y={16} fill={P.text} fontSize={11} fontFamily={P.mono}>
          target/demo.war (deployable)
        </text>

        {SRC.map((s, i) =>
          s.to != null ? (
            <path
              key={`l${i}`}
              d={`M ${LX + 12 + s.depth * 14 + s.name.length * 6.3 + 4} ${y(i) - 4} C ${RX - 60} ${y(i) - 4}, ${RX - 60} ${y(s.to) - 4}, ${RX - 6} ${y(s.to) - 4}`}
              fill="none"
              stroke={col[s.tone ?? "blue"]}
              strokeOpacity={0.55}
              strokeDasharray={s.name.startsWith("pom.xml") ? "3 3" : undefined}
            />
          ) : null,
        )}

        {SRC.map((s, i) => (
          <g key={`s${i}`}>
            <text x={LX + s.depth * 14} y={y(i)} fill={s.tone ? col[s.tone] : P.textStrong} fontSize={10.5} fontFamily={P.mono} textDecoration={s.to === null ? "line-through" : undefined}>
              {s.name}
            </text>
          </g>
        ))}
        {WAR.map((w, i) => (
          <text key={`w${i}`} x={RX + w.depth * 14} y={y(i)} fill={w.tone ? col[w.tone] : P.textStrong} fontSize={10.5} fontFamily={P.mono}>
            {w.name}
          </text>
        ))}

        <text x={LX} y={H - 36} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          src/test is never packaged · target/ is build output, not source
        </text>
        <text x={LX} y={H - 20} fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
          dashed: a pom.xml dependency with compile scope is copied to WEB-INF/lib
        </text>
        <text x={LX} y={H - 6} fill={P.amberSoft} fontSize={10} fontFamily={P.mono}>
          jakarta.servlet-api has scope provided, so it is not packaged
        </text>
      </svg>
    </Figure>
  );
}

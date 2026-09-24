import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const ROW = 23;
const TOP = 16;
const INDENT = 16;
const NOTE_X = 250;

type Tone = "plain" | "blue" | "green" | "amber" | "muted";
interface Row {
  depth: number;
  name: string;
  note: string;
  tone?: Tone;
  last?: boolean;
}

const ROWS: Row[] = [
  { depth: 0, name: "apache-tomcat-11.0.x/", note: "CATALINA_HOME: where you unzipped it", tone: "plain" },
  { depth: 1, name: "bin/", note: "startup.sh, shutdown.sh, catalina.sh (.bat on Windows)" },
  { depth: 1, name: "conf/", note: "server.xml: connectors (port 8080), hosts" },
  { depth: 2, name: "server.xml", note: "one file per concern, read once at startup", tone: "muted" },
  { depth: 2, name: "web.xml", note: "defaults for every app: default servlet, *.jsp, welcome files", tone: "muted", last: true },
  { depth: 1, name: "lib/", note: "jars for Tomcat and all apps: servlet-api.jar, jasper.jar" },
  { depth: 1, name: "logs/", note: "catalina.*.log, localhost_access_log.*: read these first" },
  { depth: 1, name: "temp/", note: "JVM scratch space" },
  { depth: 1, name: "webapps/", note: "every child is one app, one context", tone: "blue" },
  { depth: 2, name: "ROOT/", note: "context path \"\"  → http://host:8080/", tone: "blue" },
  { depth: 2, name: "demo.war", note: "dropped here, auto-expanded into demo/", tone: "blue" },
  { depth: 2, name: "demo/", note: "context path /demo → http://host:8080/demo/", tone: "blue", last: true },
  { depth: 3, name: "index.html  index.jsp", note: "public: reachable by URL", tone: "green" },
  { depth: 3, name: "WEB-INF/", note: "private: the container never serves it", tone: "amber", last: true },
  { depth: 4, name: "web.xml", note: "this app's deployment descriptor (optional)", tone: "amber" },
  { depth: 4, name: "classes/", note: "your compiled .class files", tone: "amber" },
  { depth: 4, name: "lib/", note: "your app's own jars (JDBC driver)", tone: "amber", last: true },
  { depth: 1, name: "work/", note: "JSPs translated to .java and compiled", last: true },
];

const color: Record<Tone, string> = {
  plain: P.textStrong,
  blue: P.blueSoft,
  green: P.greenSoft,
  amber: P.amberSoft,
  muted: P.text,
};

/** Static figure: Apache Tomcat 11's directory layout with one deployed webapp opened up. */
export function TomcatTree() {
  const H = TOP + ROWS.length * ROW + 8;

  // For each row, whether its ancestors at each depth still have siblings below (draws the │ rails).
  const rails: boolean[][] = [];
  const open: boolean[] = [];
  ROWS.forEach((r, i) => {
    open[r.depth] = !r.last;
    open.length = r.depth + 1;
    rails[i] = [...open];
  });

  return (
    <Figure
      title="Apache Tomcat 11 on disk"
      caption={
        <>
          Blue: the part you deploy into. Each directory or .war under webapps is one application, and its name becomes the context path, except ROOT, which
          answers at /. Green is public, amber is private: WEB-INF holds the code and config the container reads but never sends. conf/web.xml applies to every
          app; WEB-INF/web.xml applies to one.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Tomcat directory tree">
        {ROWS.map((r, i) => {
          const y = TOP + i * ROW;
          const x = 14 + r.depth * INDENT;
          const tone = r.tone ?? "plain";
          const c = color[tone];
          return (
            <g key={i}>
              {/* vertical rails of ancestors */}
              {Array.from({ length: r.depth - 1 }, (_, d) =>
                rails[i - 1]?.[d + 1] ? <line key={d} x1={14 + d * INDENT + 5} x2={14 + d * INDENT + 5} y1={y - 4} y2={y + ROW - 4} stroke={P.line} /> : null,
              )}
              {r.depth > 0 && (
                <path
                  d={`M ${x - INDENT + 5} ${y - 4} V ${y + 8} H ${x - 3}${r.last ? "" : ` M ${x - INDENT + 5} ${y + 8} V ${y + ROW - 4}`}`}
                  fill="none"
                  stroke={P.lineStrong}
                />
              )}
              {(tone === "blue" || tone === "amber" || tone === "green") && (
                <rect x={x - 1} y={y - 1} width={Math.min(r.name.length * 6.6 + 10, NOTE_X - x - 8)} height={17} rx={3} fill={c} fillOpacity={0.1} />
              )}
              <text x={x + 3} y={y + 12} fill={c} fontSize={11} fontFamily={P.mono}>
                {r.name}
              </text>
              <text x={NOTE_X} y={y + 12} fill={tone === "plain" || tone === "muted" ? P.text : c} fontSize={11.5}>
                {r.note}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

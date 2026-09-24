import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const X0 = 150;
const X1 = 620;

const LANES = ["http-nio-8080-exec-1", "http-nio-8080-exec-2", "http-nio-8080-exec-3"];
// [lane, start, end, method, user]
const CALLS: [number, number, number, string, string][] = [
  [0, 0.12, 0.36, "GET", "ali"],
  [1, 0.2, 0.46, "POST", "sara"],
  [2, 0.28, 0.52, "GET", "omar"],
  [0, 0.44, 0.66, "POST", "zara"],
  [1, 0.56, 0.8, "GET", "ali"],
  [2, 0.62, 0.84, "GET", "hina"],
];

const tx = (f: number) => X0 + f * (X1 - X0);

/** Static figure: one servlet instance over its whole life, with pooled request threads calling service() on it concurrently. */
export function ServletLifecycle() {
  const instY = 60;
  const laneY = (i: number) => 128 + i * 34;
  const H = laneY(LANES.length - 1) + 64;
  return (
    <Figure
      title="Servlet lifecycle: one object, many threads"
      caption={
        <>
          The container builds one instance and calls init() once, then every request borrows a thread from the connector&apos;s pool and calls service() on
          that same object. Look where the blue bars overlap: three requests are inside the same instance at once. destroy() runs once, when the app is
          undeployed or Tomcat stops.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Servlet lifecycle timeline with concurrent request threads">
        <defs>
          <marker id="wt-up" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={P.blue} />
          </marker>
        </defs>

        {/* time axis */}
        <line x1={X0} x2={X1} y1={22} y2={22} stroke={P.lineStrong} />
        {[
          [0, "deploy / first request"],
          [0.5, "time →"],
          [1, "undeploy or shutdown"],
        ].map(([f, l]) => (
          <text
            key={l as string}
            x={tx(f as number)}
            y={14}
            textAnchor={f === 0 ? "start" : f === 1 ? "end" : "middle"}
            fill={P.muted}
            fontSize={10}
            fontFamily={P.mono}
          >
            {l as string}
          </text>
        ))}

        {/* instance bar */}
        <text x={16} y={instY + 12} fill={P.textStrong} fontSize={11}>
          servlet object
        </text>
        <text x={16} y={instY + 26} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          new HelloServlet()
        </text>
        <rect x={tx(0)} y={instY} width={tx(1) - tx(0)} height={30} rx={4} fill={P.panel} stroke={P.lineStrong} />
        <rect x={tx(0)} y={instY} width={62} height={30} rx={4} fill="rgba(70,167,88,0.15)" stroke={P.green} />
        <text x={tx(0) + 31} y={instY + 19} textAnchor="middle" fill={P.greenSoft} fontSize={11} fontFamily={P.mono}>
          init()
        </text>
        <rect x={tx(1) - 74} y={instY} width={74} height={30} rx={4} fill="rgba(255,178,36,0.12)" stroke={P.amber} />
        <text x={tx(1) - 37} y={instY + 19} textAnchor="middle" fill={P.amberSoft} fontSize={11} fontFamily={P.mono}>
          destroy()
        </text>
        <text x={(tx(0) + tx(1)) / 2} y={instY + 19} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
          one instance · fields shared by every thread
        </text>

        {/* thread lanes */}
        {LANES.map((l, i) => (
          <g key={l}>
            <text x={16} y={laneY(i) + 13} fill={P.text} fontSize={9.5} fontFamily={P.mono}>
              {l}
            </text>
            <line x1={X0} x2={X1} y1={laneY(i) + 9} y2={laneY(i) + 9} stroke={P.line} strokeDasharray="2 4" />
          </g>
        ))}
        {CALLS.map(([lane, a], i) => (
          <line key={`up${i}`} x1={tx(a) + 10} x2={tx(a) + 10} y1={laneY(lane)} y2={instY + 33} stroke={P.blue} strokeOpacity={0.5} markerEnd="url(#wt-up)" />
        ))}
        {CALLS.map(([lane, a, b, m, who], i) => {
          const x = tx(a);
          const w = tx(b) - tx(a);
          return (
            <g key={i}>
              <rect x={x} y={laneY(lane)} width={w} height={18} rx={3} fill="#0d1f36" stroke={P.blue} />
              <text x={x + 16} y={laneY(lane) + 13} fill={P.blueSoft} fontSize={9.5} fontFamily={P.mono}>
                {m === "GET" ? "doGet" : "doPost"} · {who}
              </text>
            </g>
          );
        })}

        <text x={16} y={H - 24} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          each bar is one service(req, res) call: it reads the method and calls doGet, doPost, …
        </text>
        <text x={16} y={H - 8} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          req and res are new objects per request; the servlet object is not
        </text>
      </svg>
    </Figure>
  );
}

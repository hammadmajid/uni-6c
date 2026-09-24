import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const LH = 17;
const CODE_X = 28;
const NOTE_X = 402;

type Line = { text: string; note?: string; tone?: "blue" | "amber" | "green" | "muted"; span?: number };

const REQUEST: Line[] = [
  { text: "GET /demo/hello-servlet?name=ali HTTP/1.1", note: "request line: method, target, version", tone: "blue" },
  { text: "Host: localhost:8080", note: "headers: one per line, Name: value", tone: "muted", span: 3 },
  { text: "User-Agent: Mozilla/5.0 (X11; Linux x86_64)" },
  { text: "Accept: text/html" },
  { text: "", note: "empty line (CRLF): headers end here", tone: "amber" },
];

const RESPONSE: Line[] = [
  { text: "HTTP/1.1 200", note: "status line; no reason phrase", tone: "green" },
  { text: "Content-Type: text/html;charset=UTF-8", note: "setContentType() wrote this header", tone: "muted", span: 3 },
  { text: "Content-Length: 39" },
  { text: "Date: Tue, 22 Sep 2026 09:00:00 GMT" },
  { text: "", note: "empty line again", tone: "amber" },
  { text: "<html><body><h1>ali</h1></body></html>", note: "body: whatever out.println() wrote", tone: "blue" },
];

const toneColor = { blue: P.blueSoft, amber: P.amberSoft, green: P.greenSoft, muted: P.text };

function Block({ y, title, lines, color }: { y: number; title: string; lines: Line[]; color: string }) {
  const h = lines.length * LH + 16;
  return (
    <g>
      <text x={16} y={y - 8} fill={color} fontSize={11} fontFamily={P.mono}>
        {title}
      </text>
      <rect x={16} y={y} width={NOTE_X - 26} height={h} rx={4} fill={P.panel} stroke={P.lineStrong} />
      {lines.map((l, i) => {
        const ly = y + 12 + i * LH + 9;
        return (
          <g key={i}>
            <text x={CODE_X} y={ly} fill={l.text ? P.textStrong : P.muted} fontSize={10.5} fontFamily={P.mono}>
              {l.text || "(empty line: just CRLF)"}
            </text>
            {l.note && (
              <>
                {(l.span ?? 1) > 1 ? (
                  <path d={`M ${NOTE_X - 4} ${ly - 11} h 5 v ${(l.span! - 1) * LH + 14} h -5`} fill="none" stroke={toneColor[l.tone ?? "muted"]} />
                ) : (
                  <line x1={NOTE_X - 6} x2={NOTE_X + 2} y1={ly - 4} y2={ly - 4} stroke={toneColor[l.tone ?? "muted"]} />
                )}
                <text x={NOTE_X + 8} y={ly + ((l.span ?? 1) - 1) * (LH / 2)} fill={toneColor[l.tone ?? "muted"]} fontSize={10} fontFamily={P.mono}>
                  {l.note}
                </text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Static figure: the socket pair, then one raw HTTP/1.1 request and response with every part labelled. */
export function HttpExchange() {
  const reqY = 118;
  const resY = reqY + REQUEST.length * LH + 16 + 44;
  const H = resY + RESPONSE.length * LH + 16 + 20;
  return (
    <Figure
      title="One HTTP exchange over one TCP connection"
      caption={
        <>
          Top: the connection is identified by four numbers, the socket pair. The browser&apos;s port is picked by the OS; Tomcat&apos;s 8080 is fixed in
          conf/server.xml. Below: HTTP/1.1 is plain text on that connection. The request line and the status line are the only lines with fixed structure;
          everything else is headers until the empty line, then the body.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Socket pair and a raw HTTP request and response">
        {/* socket pair */}
        <rect x={16} y={14} width={170} height={52} rx={6} fill={P.panel} stroke={P.lineStrong} />
        <text x={28} y={34} fill={P.textStrong} fontSize={12}>
          browser
        </text>
        <text x={28} y={54} fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
          192.168.1.7:51834
        </text>
        <rect x={W - 186} y={14} width={170} height={52} rx={6} fill={P.panel} stroke={P.lineStrong} />
        <text x={W - 174} y={34} fill={P.textStrong} fontSize={12}>
          Tomcat 11
        </text>
        <text x={W - 174} y={54} fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
          192.168.1.20:8080
        </text>
        <line x1={190} x2={W - 190} y1={32} y2={32} stroke={P.blue} strokeWidth={1.5} markerEnd="url(#wt-arr)" />
        <line x1={W - 190} x2={190} y1={48} y2={48} stroke={P.green} strokeWidth={1.5} markerEnd="url(#wt-arr-g)" />
        <text x={W / 2} y={27} textAnchor="middle" fill={P.blueSoft} fontSize={10} fontFamily={P.mono}>
          request bytes
        </text>
        <text x={W / 2} y={62} textAnchor="middle" fill={P.greenSoft} fontSize={10} fontFamily={P.mono}>
          response bytes
        </text>
        <text x={W / 2} y={86} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
          one TCP connection = (src IP, src port, dst IP, dst port)
        </text>
        <defs>
          <marker id="wt-arr" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={P.blue} />
          </marker>
          <marker id="wt-arr-g" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={P.green} />
          </marker>
        </defs>

        <Block y={reqY} title="request (browser → Tomcat)" lines={REQUEST} color={P.blueSoft} />
        <Block y={resY} title="response (Tomcat → browser)" lines={RESPONSE} color={P.greenSoft} />
      </svg>
    </Figure>
  );
}

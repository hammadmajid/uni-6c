import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 250;
const CX = 110;
const SX = 530;

/** Static figure: FTP's persistent control connection beside its per-file data connections (active mode). */
export function FtpConnections() {
  const files = [
    { y: 150, label: "data conn 1 · RETR notes.pdf", closed: true },
    { y: 186, label: "data conn 2 · LIST", closed: true },
  ];
  return (
    <Figure
      title="FTP: one control connection, a new data connection per transfer"
      caption={
        <>
          Commands and replies travel on the control connection, which stays open for the whole session: that is FTP&apos;s{" "}
          <span className="text-gray-1000">out-of-band</span> control. Every file (and every directory listing) gets its own short-lived data connection,
          closed when the transfer ends. Contrast HTTP, which sends headers and body down the same connection (in-band), and FTP&apos;s server remembering who
          you are and which directory you are in (stateful), where HTTP forgets (stateless).
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="FTP control connection on port 21 and data connections on port 20">
        {[
          { x: CX, name: "FTP client", sub: "ephemeral ports" },
          { x: SX, name: "FTP server", sub: "keeps state: user, cwd" },
        ].map((n) => (
          <g key={n.name}>
            <rect x={n.x - 70} y={30} width={140} height={200} rx={6} fill={P.panel} stroke={P.lineStrong} />
            <text x={n.x} y={52} textAnchor="middle" fill={P.textStrong} fontSize={12}>
              {n.name}
            </text>
            <text x={n.x} y={68} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
              {n.sub}
            </text>
          </g>
        ))}

        {/* Control connection */}
        <line x1={CX + 70} x2={SX - 70} y1={104} y2={104} stroke={P.blue} strokeWidth={3} />
        <text x={(CX + SX) / 2} y={96} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
          control · TCP port 21 · open all session
        </text>
        <text x={(CX + SX) / 2} y={120} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          USER · PASS · LIST · RETR · STOR
        </text>
        <text x={SX - 60} y={108} fill={P.blueSoft} fontSize={9} fontFamily={P.mono}>
          :21
        </text>

        {/* Data connections */}
        {files.map((f) => (
          <g key={f.y}>
            <line x1={CX + 70} x2={SX - 70} y1={f.y} y2={f.y} stroke={P.green} strokeWidth={1.6} strokeDasharray="6 3" />
            <text x={(CX + SX) / 2} y={f.y - 6} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
              {f.label}
            </text>
            <text x={SX - 60} y={f.y + 4} fill={P.greenSoft} fontSize={9} fontFamily={P.mono}>
              :20
            </text>
            <text x={(CX + SX) / 2} y={f.y + 13} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
              one transfer, then closed
            </text>
          </g>
        ))}
        <text x={(CX + SX) / 2} y={H - 8} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          blue = control · green = data, opened by the server in active mode
        </text>
      </svg>
    </Figure>
  );
}

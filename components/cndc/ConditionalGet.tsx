import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 360;
const X = { b: 90, c: 320, o: 550 };

type End = keyof typeof X;

const MSGS: { y: number; from: End; to: End; label: string; sub: string; tone: string }[] = [
  { y: 84, from: "b", to: "c", label: "1  GET /logo.png", sub: "browser is configured to use the cache", tone: P.blueSoft },
  { y: 118, from: "c", to: "o", label: "2  GET /logo.png", sub: "miss: cache has no copy", tone: P.amber },
  { y: 152, from: "o", to: "c", label: "3  200 OK + 48 kB body", sub: "Last-Modified: Mon, 05 Oct", tone: P.amber },
  { y: 186, from: "c", to: "b", label: "4  200 OK + 48 kB body", sub: "cache keeps a copy", tone: P.blueSoft },
  { y: 244, from: "b", to: "c", label: "5  GET /logo.png", sub: "a day later", tone: P.blueSoft },
  { y: 278, from: "c", to: "o", label: "6  GET, If-Modified-Since:", sub: "Mon, 05 Oct   (is my copy stale?)", tone: P.amber },
  { y: 312, from: "o", to: "c", label: "7  304 Not Modified", sub: "headers only, no body", tone: P.green },
  { y: 346, from: "c", to: "b", label: "8  200 OK + 48 kB body", sub: "served from the cache's copy", tone: P.blueSoft },
];

/** Static sequence diagram: a proxy cache miss, then a conditional GET that returns 304. */
export function ConditionalGet() {
  return (
    <Figure
      title="A web cache, then a conditional GET"
      caption={
        <>
          Amber messages cross the institution&apos;s access link, the slow and expensive part. On the miss, the 48 kB body crosses the access link once (step 3)
          and the fast LAN once (step 4). The second time, the cache asks the origin whether its copy is still current, and the origin answers
          with a <span className="text-gray-1000">304</span> and no body. Same freshness guarantee, a few hundred bytes on the access link instead of 48 kB.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H + 12}`} className="h-auto w-full" role="img" aria-label="Sequence diagram of a cache miss followed by a conditional GET answered with 304 Not Modified">
        {(
          [
            ["b", "browser"],
            ["c", "proxy cache"],
            ["o", "origin server"],
          ] as [End, string][]
        ).map(([k, name]) => (
          <g key={k}>
            <rect x={X[k] - 56} y={16} width={112} height={24} rx={4} fill={P.panel} stroke={k === "c" ? P.blue : P.lineStrong} />
            <text x={X[k]} y={32} textAnchor="middle" fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
              {name}
            </text>
            <line x1={X[k]} x2={X[k]} y1={40} y2={H + 6} stroke={P.line} strokeDasharray="2 4" />
          </g>
        ))}
        <text x={(X.c + X.o) / 2} y={58} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          ↔ access link (slow, paid for)
        </text>
        <line x1={20} x2={W - 20} y1={214} y2={214} stroke={P.lineStrong} strokeDasharray="6 4" />
        <text x={(X.c + X.o) / 2} y={208} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          one day later
        </text>

        {MSGS.map((m, i) => {
          const x1 = X[m.from];
          const x2 = X[m.to];
          const dir = x2 > x1 ? 1 : -1;
          const mid = (x1 + x2) / 2;
          return (
            <g key={i}>
              <line x1={x1} y1={m.y} x2={x2 - dir * 8} y2={m.y} stroke={m.tone} strokeWidth={1.5} />
              <polygon points={`${x2},${m.y} ${x2 - dir * 9},${m.y - 4} ${x2 - dir * 9},${m.y + 4}`} fill={m.tone} />
              <text x={mid} y={m.y - 6} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
                {m.label}
              </text>
              <text x={mid} y={m.y + 12} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {m.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

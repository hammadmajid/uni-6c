import { Figure, P } from "@/components/learning/Figure";
import { GET_NO, OK_NO, T_GET, T_OK, timeOfDay } from "./capture";

/**
 * The same two rows (the GET and the 200 OK) under the three Time Display Formats the lab question needs.
 * Shows that the answer to "how long from GET to OK" is a subtraction in the first two formats,
 * and is read straight off the second row in the third, provided the http filter is applied.
 */
export function TimeFormats() {
  const W = 640;
  const H = 262;
  const mono = P.mono;
  const delta = T_OK - T_GET;
  const rows = [
    {
      title: "Seconds since beginning of capture (default)",
      get: T_GET.toFixed(6),
      ok: T_OK.toFixed(6),
      note: `${T_OK.toFixed(6)} − ${T_GET.toFixed(6)} = ${delta.toFixed(6)} s`,
    },
    {
      title: "Time of day (View › Time Display Format)",
      get: timeOfDay(T_GET),
      ok: timeOfDay(T_OK),
      note: "same subtraction; only the seconds and fraction differ",
    },
    {
      title: "Seconds since previous displayed packet, with filter http",
      get: "0.000000",
      ok: delta.toFixed(6),
      note: "no arithmetic: the OK row is the answer",
    },
  ];

  return (
    <Figure
      title="One question, three time formats"
      caption={
        <>
          The manual's question 2 in each format. The third row only works because the <span className="font-mono text-gray-1000">http</span> filter makes the GET the
          previous <span className="text-gray-1000">displayed</span> packet. Without the filter, "previous displayed" would be the TCP ACK that arrived one millisecond
          before the OK, and the number would be wrong by two hundred milliseconds.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="The GET and 200 OK rows shown under three Wireshark time display formats">
        {/* header row */}
        <text x={16} y={22} fill={P.muted} fontSize={9} fontFamily={mono}>
          No.
        </text>
        <text x={56} y={22} fill={P.muted} fontSize={9} fontFamily={mono}>
          Time
        </text>
        <text x={200} y={22} fill={P.muted} fontSize={9} fontFamily={mono}>
          Info
        </text>

        {rows.map((r, i) => {
          const y = 40 + i * 74;
          return (
            <g key={r.title}>
              <text x={16} y={y} fill={P.textStrong} fontSize={10} fontFamily={mono}>
                {r.title}
              </text>
              {/* GET row */}
              <rect x={10} y={y + 8} width={W - 20} height={20} rx={2} fill="rgba(70,167,88,0.10)" />
              <rect x={10} y={y + 8} width={3} height={20} fill={P.green} />
              <text x={20} y={y + 22} fill={P.text} fontSize={10} fontFamily={mono}>
                {GET_NO}
              </text>
              <text x={56} y={y + 22} fill={i === 2 ? P.muted : P.textStrong} fontSize={10.5} fontFamily={mono}>
                {r.get}
              </text>
              <text x={200} y={y + 22} fill={P.text} fontSize={10} fontFamily={mono}>
                GET /wireshark-labs/INTRO-wireshark-file1.html HTTP/1.1
              </text>
              {/* OK row */}
              <rect x={10} y={y + 30} width={W - 20} height={20} rx={2} fill="rgba(70,167,88,0.10)" />
              <rect x={10} y={y + 30} width={3} height={20} fill={P.green} />
              <text x={20} y={y + 44} fill={P.text} fontSize={10} fontFamily={mono}>
                {OK_NO}
              </text>
              <text x={56} y={y + 44} fill={i === 2 ? P.blueSoft : P.textStrong} fontSize={10.5} fontFamily={mono} fontWeight={i === 2 ? 600 : 400}>
                {r.ok}
              </text>
              <text x={200} y={y + 44} fill={P.text} fontSize={10} fontFamily={mono}>
                HTTP/1.1 200 OK  (text/html)
              </text>
              {/* bracket + note */}
              {i < 2 ? (
                <>
                  <path d={`M 150 ${y + 12} h 6 v 34 h -6`} fill="none" stroke={P.blue} strokeWidth={1.2} />
                  <text x={W - 14} y={y + 63} textAnchor="end" fill={P.blueSoft} fontSize={9.5} fontFamily={mono}>
                    {r.note}
                  </text>
                </>
              ) : (
                <>
                  <rect x={52} y={y + 32} width={64} height={16} rx={2} fill="none" stroke={P.blue} strokeWidth={1.2} />
                  <text x={W - 14} y={y + 63} textAnchor="end" fill={P.blueSoft} fontSize={9.5} fontFamily={mono}>
                    {r.note}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

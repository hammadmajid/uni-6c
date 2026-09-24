import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const padL = 76;
const padR = 12;
const padT = 12;
const CW = (W - padL - padR) / 3;
const CH = 74;
const H = padT + 3 * CH + 46;

// Rows top to bottom: high, medium, low bandwidth. Columns: short, medium, long range.
const CELLS: string[][][] = [
  [["802.11ad"], ["802.11ac", "802.11n", "802.11a/b/g"], ["4G", "5G"]],
  [["Bluetooth", "BLE"], ["ZigBee", "802.15.4"], ["2G", "3G", "VSAT"]],
  [["RFID", "NFC", "WBAN 802.15.6"], ["WPAN"], []],
];
const LPWAN = ["LoRaWAN", "Sigfox", "NB-IoT", "LTE-M"];

function Chips({ x, y, items, tone }: { x: number; y: number; items: string[]; tone: "gray" | "blue" }) {
  let cx = x + 8;
  let cy = y + 10;
  return (
    <g>
      {items.map((t) => {
        const w = t.length * 6 + 12;
        if (cx + w > x + CW - 6) {
          cx = x + 8;
          cy += 22;
        }
        const el = (
          <g key={t}>
            <rect x={cx} y={cy} width={w} height={17} rx={8.5} fill={tone === "blue" ? "rgba(0,112,243,0.25)" : P.panel} stroke={tone === "blue" ? P.blueSoft : P.lineStrong} />
            <text x={cx + w / 2} y={cy + 12} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
              {t}
            </text>
          </g>
        );
        cx += w + 5;
        return el;
      })}
    </g>
  );
}

/** Static figure: wireless technologies by range and bandwidth, showing the long-range, low-rate gap LPWAN fills. */
export function RangeBandwidthMap() {
  const rows = ["high rate", "medium rate", "low rate"];
  const cols = [
    { l: "short range", s: "cm to ~10 m" },
    { l: "medium range", s: "~10 to 100 m" },
    { l: "long range", s: "km and more" },
  ];
  return (
    <Figure
      title="Wireless technologies by range and data rate"
      caption={
        <>
          Redrawn from the lecture&apos;s chart. Before LPWAN, long range meant cellular (power-hungry, paid per SIM) and low power meant short range
          (Bluetooth, ZigBee). The blue cell was empty. A soil sensor that sends 12 bytes an hour from a field 10 km away needs exactly that cell,
          with a battery that lasts years.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Grid of wireless technologies by range and data rate, with LPWAN in the long range low rate cell">
        {rows.map((r, i) => (
          <text key={r} x={padL - 8} y={padT + i * CH + CH / 2 + 4} textAnchor="end" fill={P.text} fontSize={10} fontFamily={P.mono}>
            {r}
          </text>
        ))}
        {CELLS.map((row, i) =>
          row.map((items, j) => {
            const x = padL + j * CW;
            const y = padT + i * CH;
            const isLp = i === 2 && j === 2;
            return (
              <g key={`${i}-${j}`}>
                <rect x={x + 2} y={y + 2} width={CW - 4} height={CH - 4} rx={5} fill={isLp ? "rgba(0,112,243,0.10)" : "transparent"} stroke={isLp ? P.blue : P.line} />
                {isLp ? (
                  <>
                    <text x={x + 10} y={y + 18} fill={P.blueSoft} fontSize={11} fontFamily={P.mono}>
                      LPWAN
                    </text>
                    <Chips x={x} y={y + 14} items={LPWAN} tone="blue" />
                  </>
                ) : (
                  <Chips x={x} y={y} items={items} tone="gray" />
                )}
              </g>
            );
          }),
        )}
        {cols.map((c, j) => (
          <g key={c.l}>
            <text x={padL + j * CW + CW / 2} y={padT + 3 * CH + 16} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
              {c.l}
            </text>
            <text x={padL + j * CW + CW / 2} y={padT + 3 * CH + 30} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
              {c.s}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  );
}

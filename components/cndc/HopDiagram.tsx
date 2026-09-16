import { Figure, P } from "@/components/learning/Figure";

const LAYERS = ["App", "Trans", "Net", "Link", "Phy"]; // top to bottom
const ROW = 22;
const BOX_W = 74;
const TOP = 30;
const W = 640;
const H = TOP + 5 * ROW + 96;

interface Device {
  name: string;
  layers: number; // how many layers from the bottom
  x: number;
}

const DEVICES: Device[] = [
  { name: "Host A", layers: 5, x: 20 },
  { name: "Switch", layers: 2, x: 20 + 1 * 118 },
  { name: "Router", layers: 3, x: 20 + 2 * 118 },
  { name: "Switch", layers: 2, x: 20 + 3 * 118 },
  { name: "Host B", layers: 5, x: 20 + 4 * 118 },
];

const yOfLayer = (fromBottom: number) => TOP + (5 - fromBottom) * ROW; // top edge of that layer's box
const wireY = TOP + 5 * ROW + 6;

/** Static figure: which layers each device on a path implements, with the packet's path stepping through them. */
export function HopDiagram() {
  // Packet path: start at top of host A, down to phy, along wire, up to top implemented layer of each device, down, ... up to top of host B.
  const pts: string[] = [];
  DEVICES.forEach((d, i) => {
    const cx = d.x + BOX_W / 2;
    const top = yOfLayer(d.layers) + ROW / 2;
    if (i === 0) {
      pts.push(`${cx},${top}`);
      pts.push(`${cx},${wireY}`);
    } else {
      pts.push(`${cx},${wireY}`);
      pts.push(`${cx},${top}`);
      if (i < DEVICES.length - 1) pts.push(`${cx},${wireY}`);
    }
  });

  return (
    <Figure
      title="Who reads what along one path"
      caption={
        <>
          The blue line is one packet. It is built top to bottom at host A and taken apart bottom to top at host B. In between, a switch only climbs
          to the link layer (it reads MAC addresses in the frame), a router climbs to the network layer (it reads the destination IP, picks a link, and
          builds a new frame). Neither ever opens the segment, so ports and application data are invisible to them. The hub in the corner does not
          even know what a frame is.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Host, switch, router, switch, host with the layers each implements">
        {DEVICES.map((d) => (
          <g key={d.x}>
            <text x={d.x + BOX_W / 2} y={18} textAnchor="middle" fill={P.textStrong} fontSize={11}>
              {d.name}
            </text>
            {LAYERS.map((l, i) => {
              const fromBottom = 5 - i;
              const on = fromBottom <= d.layers;
              const y = yOfLayer(fromBottom);
              return (
                <g key={l}>
                  <rect x={d.x} y={y + 1} width={BOX_W} height={ROW - 2} rx={3} fill={on ? P.panel : "none"} stroke={on ? P.lineStrong : P.line} strokeDasharray={on ? undefined : "2 3"} />
                  <text x={d.x + 8} y={y + ROW / 2 + 4} fill={on ? P.textStrong : P.muted} fontSize={10} fontFamily={P.mono} opacity={on ? 1 : 0.5}>
                    {l}
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        {/* wires */}
        {DEVICES.slice(0, -1).map((d, i) => {
          const x1 = d.x + BOX_W;
          const x2 = DEVICES[i + 1].x;
          return (
            <g key={i}>
              <line x1={x1} y1={wireY} x2={x2} y2={wireY} stroke={P.lineStrong} strokeWidth={2} />
              <text x={(x1 + x2) / 2} y={wireY + 14} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
                frame
              </text>
            </g>
          );
        })}

        {/* packet path */}
        <polyline points={pts.join(" ")} fill="none" stroke={P.blue} strokeWidth={2} strokeLinejoin="round" opacity={0.9} />
        {DEVICES.map((d) => {
          const cx = d.x + BOX_W / 2;
          const top = yOfLayer(d.layers) + ROW / 2;
          return <circle key={d.x} cx={cx} cy={top} r={3.5} fill={P.blue} />;
        })}

        {/* reads-what labels */}
        {[
          { x: DEVICES[1].x, t: "reads MAC" },
          { x: DEVICES[2].x, t: "reads IP" },
          { x: DEVICES[3].x, t: "reads MAC" },
        ].map((l) => (
          <text key={l.x} x={l.x + BOX_W / 2} y={wireY + 32} textAnchor="middle" fill={P.blueSoft} fontSize={10} fontFamily={P.mono}>
            {l.t}
          </text>
        ))}
        <text x={DEVICES[0].x + BOX_W / 2} y={wireY + 32} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
          builds all
        </text>
        <text x={DEVICES[4].x + BOX_W / 2} y={wireY + 32} textAnchor="middle" fill={P.text} fontSize={10} fontFamily={P.mono}>
          opens all
        </text>

        {/* hub inset */}
        {(() => {
          const ix = W - 150;
          const iy = wireY + 44;
          return (
            <g>
              <rect x={ix} y={iy} width={134} height={40} rx={4} fill="none" stroke={P.line} />
              <rect x={ix + 8} y={iy + 10} width={44} height={20} rx={3} fill={P.panel} stroke={P.lineStrong} />
              <text x={ix + 30} y={iy + 24} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
                Phy
              </text>
              <text x={ix + 60} y={iy + 18} fill={P.text} fontSize={9}>
                Hub / repeater
              </text>
              <text x={ix + 60} y={iy + 30} fill={P.muted} fontSize={9}>
                copies signals only
              </text>
            </g>
          );
        })()}
      </svg>
    </Figure>
  );
}

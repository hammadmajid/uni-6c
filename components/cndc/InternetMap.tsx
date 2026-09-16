import { Figure, P } from "@/components/learning/Figure";

/** Small router/switch box. */
function Sw({ x, y, label, hot }: { x: number; y: number; label?: string; hot?: boolean }) {
  return (
    <g>
      <rect x={x - 9} y={y - 9} width={18} height={18} rx={3} fill={hot ? P.blue : P.panel} stroke={hot ? P.blueSoft : P.lineStrong} strokeWidth={1.2} />
      <circle cx={x - 3} cy={y} r={1.4} fill={hot ? "#fff" : P.muted} />
      <circle cx={x + 3} cy={y} r={1.4} fill={hot ? "#fff" : P.muted} />
      {label && (
        <text x={x} y={y + 21} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
          {label}
        </text>
      )}
    </g>
  );
}

/** Host: a circle. */
function Host({ x, y, label, hot, below = true }: { x: number; y: number; label: string; hot?: boolean; below?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={7} fill={hot ? P.blue : P.panel} stroke={hot ? P.blueSoft : P.lineStrong} strokeWidth={1.2} />
      <text x={x} y={below ? y + 19 : y - 11} textAnchor="middle" fill={hot ? P.textStrong : P.text} fontSize={9} fontFamily={P.mono}>
        {label}
      </text>
    </g>
  );
}

/** ISP cloud: a rounded region. */
function Cloud({ x, y, w, h, label, sub, tone = "gray" }: { x: number; y: number; w: number; h: number; label: string; sub?: string; tone?: "gray" | "green" }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={tone === "green" ? "rgba(70,167,88,0.06)" : "rgba(255,255,255,0.025)"} stroke={tone === "green" ? P.green : P.lineStrong} strokeWidth={1} strokeDasharray={tone === "green" ? "3 3" : undefined} />
      <text x={x + 8} y={y + 13} fill={tone === "green" ? P.greenSoft : P.textStrong} fontSize={10} fontFamily={P.mono}>
        {label}
      </text>
      {sub && (
        <text x={x + 8} y={y + 24} fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Link({ a, b, hot, dashed }: { a: [number, number]; b: [number, number]; hot?: boolean; dashed?: boolean }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={hot ? P.blue : P.lineStrong} strokeWidth={hot ? 2.2 : 1} strokeDasharray={dashed ? "4 3" : undefined} />;
}

/**
 * The nuts-and-bolts view: hosts at the edge, access ISP, regional ISP, tier-1 ISPs, an IXP, a content provider network.
 * The blue path is one packet's journey from a home in Islamabad to a server in Frankfurt.
 */
export function InternetMap() {
  const W = 640;
  const H = 400;

  // Node coordinates
  const home1: [number, number] = [40, 350];
  const home2: [number, number] = [40, 300];
  const phone: [number, number] = [90, 372];
  const accessR: [number, number] = [120, 325]; // access ISP edge router
  const accessCore: [number, number] = [175, 300];
  const regional1: [number, number] = [240, 250];
  const regional2: [number, number] = [275, 205];
  const tier1a: [number, number] = [225, 120];
  const tier1aB: [number, number] = [290, 95];
  const tier1bA: [number, number] = [400, 95];
  const tier1bB: [number, number] = [470, 120];
  const ixp: [number, number] = [320, 250];
  const cpA: [number, number] = [432, 292];
  const cpB: [number, number] = [482, 308];
  const dcSw: [number, number] = [545, 330];
  const dcServer: [number, number] = [600, 330];
  const dcHost2: [number, number] = [600, 360];
  const regionalEU: [number, number] = [510, 200];
  const accessEU: [number, number] = [575, 240];
  
  return (
    <Figure
      title="The Internet, nuts-and-bolts view"
      caption={
        <>
          Circles are end systems, boxes are packet switches (routers and switches), lines are communication links, dashed regions are ISPs. The blue path is
          your SSH session from a home in Islamabad to a VPS in Frankfurt: up through an access ISP and a regional ISP to a tier-1 backbone, across a tier-1
          peering link, then down the hierarchy again on the other side. Google-style content providers bypass most of that by connecting straight to
          access ISPs at Internet exchange points.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Diagram of the Internet's ISP hierarchy with one highlighted path">
        {/* Regions */}
        <Cloud x={18} y={270} w={200} h={120} label="Access ISP" sub="e.g. Nayatel, PTCL" />
        <Cloud x={215} y={180} w={110} h={95} label="Regional ISP" />
        <Cloud x={195} y={60} w={130} h={90} label="Tier-1 ISP A" sub="no upstream, peers for free" />
        <Cloud x={375} y={60} w={130} h={90} label="Tier-1 ISP B" />
        <Cloud x={395} y={245} w={120} h={80} label="Content provider" sub="private global network" tone="green" />
        <Cloud x={525} y={305} w={100} h={80} label="Data center" />
        <Cloud x={485} y={170} w={135} h={100} label="Regional + access ISP" sub="Frankfurt" />

        {/* IXP */}
        <rect x={ixp[0] - 22} y={ixp[1] - 12} width={44} height={24} rx={4} fill="rgba(255,178,36,0.12)" stroke={P.amber} strokeWidth={1} />
        <text x={ixp[0]} y={ixp[1] + 4} textAnchor="middle" fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
          IXP
        </text>

        {/* Links: edge */}
        <Link a={home1} b={accessR} hot />
        <Link a={home2} b={accessR} />
        <Link a={phone} b={accessR} dashed />
        <Link a={accessR} b={accessCore} hot />
        <Link a={accessCore} b={regional1} hot />
        <Link a={accessCore} b={ixp} />
        <Link a={regional1} b={regional2} hot />
        <Link a={regional2} b={tier1a} hot />
        <Link a={regional2} b={ixp} />
        <Link a={tier1a} b={tier1aB} hot />
        {/* Peering between tier-1s */}
        <Link a={tier1aB} b={tier1bA} hot />
        <text x={(tier1aB[0] + tier1bA[0]) / 2} y={tier1aB[1] + 18} textAnchor="middle" fill={P.blueSoft} fontSize={9} fontFamily={P.mono}>
          peering (settlement free)
        </text>
        <Link a={tier1bA} b={tier1bB} hot />
        <Link a={tier1bB} b={regionalEU} hot />
        <Link a={regionalEU} b={accessEU} hot />
        <Link a={accessEU} b={dcSw} hot />
        <Link a={dcSw} b={dcServer} hot />
        <Link a={dcSw} b={dcHost2} />
        {/* Content provider */}
        <Link a={ixp} b={cpA} />
        <Link a={cpA} b={cpB} />
        <Link a={cpB} b={dcSw} />
        <Link a={cpA} b={tier1bB} dashed />

        {/* Packet switches */}
        <Sw x={accessR[0]} y={accessR[1]} label="edge router" hot />
        <Sw x={accessCore[0]} y={accessCore[1]} hot />
        <Sw x={regional1[0]} y={regional1[1]} hot />
        <Sw x={regional2[0]} y={regional2[1]} hot />
        <Sw x={tier1a[0]} y={tier1a[1]} hot />
        <Sw x={tier1aB[0]} y={tier1aB[1]} hot />
        <Sw x={tier1bA[0]} y={tier1bA[1]} hot />
        <Sw x={tier1bB[0]} y={tier1bB[1]} hot />
        <Sw x={regionalEU[0]} y={regionalEU[1]} hot />
        <Sw x={accessEU[0]} y={accessEU[1]} hot />
        <Sw x={dcSw[0]} y={dcSw[1]} label="switch" hot />
        <Sw x={cpA[0]} y={cpA[1]} />
        <Sw x={cpB[0]} y={cpB[1]} />

        {/* Hosts */}
        <Host x={home1[0]} y={home1[1]} label="your laptop" hot />
        <Host x={home2[0]} y={home2[1]} label="neighbour" />
        <Host x={phone[0]} y={phone[1]} label="phone" />
        <Host x={dcServer[0]} y={dcServer[1]} label="your VPS" hot />
        <Host x={dcHost2[0]} y={dcHost2[1]} label="" />

        {/* Legend */}
        <g transform="translate(24, 22)">
          <circle cx={6} cy={6} r={5} fill={P.panel} stroke={P.lineStrong} />
          <text x={16} y={10} fill={P.text} fontSize={9} fontFamily={P.mono}>
            host / end system
          </text>
          <rect x={112} y={0} width={12} height={12} rx={2} fill={P.panel} stroke={P.lineStrong} />
          <text x={130} y={10} fill={P.text} fontSize={9} fontFamily={P.mono}>
            packet switch
          </text>
          <line x1={210} y1={6} x2={236} y2={6} stroke={P.lineStrong} />
          <text x={242} y={10} fill={P.text} fontSize={9} fontFamily={P.mono}>
            link
          </text>
          <line x1={278} y1={6} x2={304} y2={6} stroke={P.blue} strokeWidth={2.2} />
          <text x={310} y={10} fill={P.text} fontSize={9} fontFamily={P.mono}>
            one packet&apos;s path, Islamabad to Frankfurt
          </text>
        </g>
        <text x={24} y={48} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          ≈ 15 to 20 hops · each box looks at the packet, decides, forwards
        </text>
      </svg>
    </Figure>
  );
}

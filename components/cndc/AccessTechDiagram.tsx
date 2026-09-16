"use client";

import { useState } from "react";
import { SegmentRow } from "@/components/learning/Controls";
import { Figure, P } from "@/components/learning/Figure";

type Tech = "dsl" | "cable" | "pon" | "fwa" | "sat";

interface Spec {
  name: string;
  medium: string;
  shared: string;
  symmetric: string;
  down: string;
  ispBox: string;
  ispBoxSub: string;
  /** Where the segments split: [homes..] --dedicated--> (split point) --shared--> ISP box, or the reverse. */
  layout: "dedicated" | "shared-from-home" | "split-in-field" | "radio";
  midLabel?: string;
  note: string;
}

const SPECS: Record<Tech, Spec> = {
  dsl: {
    name: "DSL",
    medium: "existing telephone twisted pair",
    shared: "no, dedicated pair per home",
    symmetric: "no (FDM: wide down, narrow up)",
    down: "up to ≈50 Mbps, falls with distance",
    ispBox: "DSLAM",
    ispBoxSub: "telco central office",
    layout: "dedicated",
    note: "Each home has its own copper pair all the way to the DSLAM. Sharing only starts behind it.",
  },
  cable: {
    name: "Cable (HFC)",
    medium: "fiber to the node, coax to homes",
    shared: "yes, all homes on the coax segment",
    symmetric: "no (upstream band is narrow)",
    down: "hundreds of Mbps to 1 Gbps+",
    ispBox: "CMTS",
    ispBoxSub: "cable head end",
    layout: "split-in-field",
    midLabel: "fiber node",
    note: "Every downstream frame reaches every modem on the coax; each keeps only its own. Upstream needs a medium access protocol.",
  },
  pon: {
    name: "Fiber (PON)",
    medium: "one fiber, split passively",
    shared: "yes, ≈32 homes per OLT port",
    symmetric: "GPON no (2.5 / 1.25 Gbps); XGS-PON yes",
    down: "100 Mbps to 10 Gbps",
    ispBox: "OLT",
    ispBoxSub: "central office",
    layout: "split-in-field",
    midLabel: "passive splitter",
    note: "The splitter is dumb glass: no power, no logic. The OLT schedules upstream; downstream is broadcast.",
  },
  fwa: {
    name: "5G fixed wireless",
    medium: "radio to a nearby base station",
    shared: "yes, the whole cell",
    symmetric: "no",
    down: "tens to hundreds of Mbps",
    ispBox: "base station",
    ispBoxSub: "cellular provider",
    layout: "radio",
    note: "The cell is a shared radio channel. Rate depends on distance, obstacles and how many neighbours are on the same sector.",
  },
  sat: {
    name: "Satellite",
    medium: "radio via GEO or LEO satellite",
    shared: "yes, the beam",
    symmetric: "no",
    down: "tens to hundreds of Mbps; GEO adds ≈250 ms one way",
    ispBox: "ground station",
    ispBoxSub: "then the ISP core",
    layout: "radio",
    note: "The satellite is a repeater in the sky. GEO orbits at 36,000 km, so propagation delay dominates everything.",
  },
};

const TECH_OPTIONS: { value: Tech; label: string }[] = [
  { value: "dsl", label: "DSL" },
  { value: "cable", label: "Cable" },
  { value: "pon", label: "PON" },
  { value: "fwa", label: "5G" },
  { value: "sat", label: "Satellite" },
];

function House({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <polygon points={`${x - 12},${y} ${x},${y - 11} ${x + 12},${y}`} fill={P.panel} stroke={P.lineStrong} strokeWidth={1.2} strokeLinejoin="round" />
      <rect x={x - 9} y={y} width={18} height={13} fill={P.panel} stroke={P.lineStrong} strokeWidth={1.2} />
      <rect x={x - 2.5} y={y + 5} width={5} height={8} fill={P.lineStrong} />
    </g>
  );
}

export function AccessTechDiagram() {
  const [tech, setTech] = useState<Tech>("cable");
  const s = SPECS[tech];

  const W = 640;
  const H = 210;
  const homesX = 50;
  const homesY = [40, 82, 124, 166];
  const midX = 300;
  const ispX = 540;
  const ispY = 103;

  const dedicated = { stroke: P.green, dash: undefined as string | undefined };
  const shared = { stroke: P.amber, dash: undefined as string | undefined };
  const radio = { stroke: P.amber, dash: "5 4" };

  return (
    <Figure
      title={`Home access: ${s.name}`}
      controls={
        <div className="w-72">
          <SegmentRow label="" value={tech} options={TECH_OPTIONS} onChange={setTech} />
        </div>
      }
      caption={
        <>
          Green links are yours alone; amber links carry your neighbours&apos; traffic too. The box on the right is the one exams want named: DSLAM, CMTS, OLT,
          base station, ground station. {s.note}
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Diagram of ${s.name} access from homes to the ISP`}>
        {/* Homes */}
        {homesX &&
          homesY.map((y, i) => (
            <g key={y}>
              <House x={homesX} y={y - 6} />
              {i === 0 && (
                <text x={homesX - 18} y={y + 3} textAnchor="end" fill={P.blueSoft} fontSize={9} fontFamily={P.mono}>
                  you
                </text>
              )}
            </g>
          ))}
        <text x={homesX} y={H - 6} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          homes
        </text>

        {/* Links */}
        {s.layout === "dedicated" &&
          homesY.map((y) => <line key={y} x1={homesX + 14} y1={y} x2={ispX - 30} y2={ispY + (y - ispY) * 0.15} stroke={dedicated.stroke} strokeWidth={1.8} />)}

        {s.layout === "split-in-field" && (
          <>
            {homesY.map((y) => (
              <line key={y} x1={homesX + 14} y1={y} x2={midX - 12} y2={ispY + (y - ispY) * 0.25} stroke={shared.stroke} strokeWidth={1.8} />
            ))}
            <line x1={midX + 12} y1={ispY} x2={ispX - 30} y2={ispY} stroke={tech === "cable" ? P.blueSoft : shared.stroke} strokeWidth={2.4} />
            <text x={(midX + ispX) / 2 - 8} y={ispY - 8} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
              {tech === "cable" ? "fiber (shared, but huge)" : "one fiber, shared"}
            </text>
            <text x={(homesX + midX) / 2} y={ispY + 46} textAnchor="middle" fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
              {tech === "cable" ? "coax: broadcast to every home" : "split fiber: broadcast downstream"}
            </text>
            <rect x={midX - 12} y={ispY - 12} width={24} height={24} rx={tech === "pon" ? 12 : 3} fill={P.panel} stroke={P.lineStrong} strokeWidth={1.2} />
            <text x={midX} y={ispY + 28} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
              {s.midLabel}
            </text>
            {tech === "pon" && (
              <text x={midX} y={ispY + 39} textAnchor="middle" fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
                no power, no logic
              </text>
            )}
          </>
        )}

        {s.layout === "radio" && (
          <>
            {homesY.map((y) => (
              <line key={y} x1={homesX + 14} y1={y} x2={tech === "sat" ? midX : ispX - 30} y2={tech === "sat" ? 24 : ispY + (y - ispY) * 0.15} stroke={radio.stroke} strokeWidth={1.6} strokeDasharray={radio.dash} />
            ))}
            {tech === "sat" && (
              <>
                <line x1={midX} y1={24} x2={ispX - 30} y2={ispY} stroke={radio.stroke} strokeWidth={1.6} strokeDasharray={radio.dash} />
                <rect x={midX - 14} y={12} width={28} height={12} rx={2} fill={P.panel} stroke={P.lineStrong} strokeWidth={1.2} />
                <line x1={midX - 30} y1={18} x2={midX - 14} y2={18} stroke={P.lineStrong} strokeWidth={3} />
                <line x1={midX + 14} y1={18} x2={midX + 30} y2={18} stroke={P.lineStrong} strokeWidth={3} />
                <text x={midX} y={40} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
                  satellite · GEO 36,000 km
                </text>
              </>
            )}
            <text x={(homesX + ispX) / 2} y={ispY + 50} textAnchor="middle" fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
              shared radio channel
            </text>
          </>
        )}

        {/* ISP box */}
        <rect x={ispX - 30} y={ispY - 22} width={60} height={44} rx={4} fill={P.panel} stroke={P.textStrong} strokeWidth={1.4} />
        <text x={ispX} y={ispY + 4} textAnchor="middle" fill={P.textStrong} fontSize={10.5} fontFamily={P.mono} fontWeight={600}>
          {s.ispBox}
        </text>
        <text x={ispX} y={ispY + 34} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
          {s.ispBoxSub}
        </text>
        {/* Uplink to the ISP core */}
        <line x1={ispX + 30} y1={ispY} x2={W - 14} y2={ispY} stroke={P.lineStrong} strokeWidth={2} />
        <text x={ispX + 32} y={ispY - 8} fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
          ISP core →
        </text>
        <text x={ispX + 32} y={ispY + 16} fill={P.muted} fontSize={8.5} fontFamily={P.mono}>
          shared by all
        </text>

        {/* DSL FDM inset */}
        {tech === "dsl" && (
          <g transform="translate(300, 142)">
            <rect x={0} y={0} width={230} height={54} rx={4} fill={P.bg} stroke={P.line} />
            <text x={8} y={12} fill={P.text} fontSize={8.5} fontFamily={P.mono}>
              FDM on the copper pair
            </text>
            <rect x={8} y={20} width={16} height={20} fill={P.green} opacity={0.8} />
            <rect x={26} y={20} width={38} height={20} fill={P.amber} opacity={0.8} />
            <rect x={66} y={20} width={156} height={20} fill={P.blue} opacity={0.8} />
            <text x={16} y={49} textAnchor="middle" fill={P.muted} fontSize={7.5} fontFamily={P.mono}>
              voice
            </text>
            <text x={45} y={49} textAnchor="middle" fill={P.muted} fontSize={7.5} fontFamily={P.mono}>
              up
            </text>
            <text x={144} y={49} textAnchor="middle" fill={P.muted} fontSize={7.5} fontFamily={P.mono}>
              downstream (wide) → asymmetric
            </text>
          </g>
        )}
      </svg>

      <div className="text-copy-13 mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2">
        <div>
          <span className="text-gray-600">medium: </span>
          <span className="text-gray-1000">{s.medium}</span>
        </div>
        <div>
          <span className="text-gray-600">shared last mile: </span>
          <span className={s.shared.startsWith("no") ? "text-green-600" : "text-amber-600"}>{s.shared}</span>
        </div>
        <div>
          <span className="text-gray-600">symmetric: </span>
          <span className="text-gray-1000">{s.symmetric}</span>
        </div>
        <div>
          <span className="text-gray-600">typical downstream: </span>
          <span className="text-gray-1000">{s.down}</span>
        </div>
      </div>
    </Figure>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Lab, SegmentRow, SliderRow, Stat, ToggleRow, useExplorationState } from "@/components/learning/Controls";
import { P } from "@/components/learning/Figure";

type Topo = "bus" | "star" | "ring" | "mesh";
const defaults = { topo: "star" as Topo, n: 6, dual: false };

interface Node {
  id: string;
  x: number;
  y: number;
  kind: "host" | "hub" | "tap" | "end";
  label?: string;
}
interface Edge {
  id: string;
  a: string;
  b: string;
  kind: "trunk" | "drop" | "link";
}

const W = 640;
const H = 290;
const CX = 320;
const CY = 140;

function circle(n: number, r: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  });
}

function layout(topo: Topo, n: number): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const host = (i: number, x: number, y: number) => nodes.push({ id: `h${i}`, x, y, kind: "host", label: `PC${i + 1}` });

  if (topo === "bus") {
    const x0 = 70;
    const x1 = 570;
    const step = (x1 - x0) / Math.max(n - 1, 1);
    nodes.push({ id: "e0", x: 30, y: CY, kind: "end" }, { id: "e1", x: 610, y: CY, kind: "end" });
    for (let i = 0; i < n; i++) {
      const x = x0 + i * step;
      nodes.push({ id: `t${i}`, x, y: CY, kind: "tap" });
      host(i, x, i % 2 === 0 ? 62 : 218);
      edges.push({ id: `d${i}`, a: `t${i}`, b: `h${i}`, kind: "drop" });
    }
    edges.push({ id: "s0", a: "e0", b: "t0", kind: "trunk" });
    for (let i = 0; i < n - 1; i++) edges.push({ id: `s${i + 1}`, a: `t${i}`, b: `t${i + 1}`, kind: "trunk" });
    edges.push({ id: `s${n}`, a: `t${n - 1}`, b: "e1", kind: "trunk" });
  } else if (topo === "star") {
    nodes.push({ id: "hub", x: CX, y: CY, kind: "hub", label: "hub" });
    circle(n, 108).forEach((p, i) => {
      host(i, p.x, p.y);
      edges.push({ id: `l${i}`, a: "hub", b: `h${i}`, kind: "link" });
    });
  } else {
    const pts = circle(n, 110);
    pts.forEach((p, i) => host(i, p.x, p.y));
    if (topo === "ring") {
      for (let i = 0; i < n; i++) edges.push({ id: `l${i}`, a: `h${i}`, b: `h${(i + 1) % n}`, kind: "link" });
    } else {
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push({ id: `l${i}-${j}`, a: `h${i}`, b: `h${j}`, kind: "link" });
    }
  }
  return { nodes, edges };
}

/** For every host, the set of other hosts it can reach. */
function reachability(topo: Topo, dual: boolean, nodes: Node[], edges: Edge[], failed: Set<string>) {
  const hosts = nodes.filter((n) => n.kind === "host");
  const reach = new Map<string, Set<string>>();
  hosts.forEach((h) => reach.set(h.id, new Set()));

  const trunkCut = topo === "bus" && edges.some((e) => e.kind === "trunk" && failed.has(e.id));
  const ringBroken = topo === "ring" && !dual && failed.size > 0;
  if (trunkCut || ringBroken) return { reach, collapse: trunkCut ? "trunk" : "ring" };

  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  for (const e of edges) {
    if (failed.has(e.id) || failed.has(e.a) || failed.has(e.b)) continue;
    adj.get(e.a)!.push(e.b);
    adj.get(e.b)!.push(e.a);
  }
  for (const h of hosts) {
    if (failed.has(h.id)) continue;
    const seen = new Set([h.id]);
    const q = [h.id];
    while (q.length) {
      const cur = q.shift()!;
      for (const nx of adj.get(cur)!) {
        if (seen.has(nx) || failed.has(nx)) continue;
        seen.add(nx);
        q.push(nx);
      }
    }
    for (const o of hosts) if (o.id !== h.id && seen.has(o.id)) reach.get(h.id)!.add(o.id);
  }
  return { reach, collapse: null as null | "trunk" | "ring" };
}

type Fact = [value: string, note: string];
const FACTS: Record<Topo, { cables: (n: number, dual: boolean) => Fact; ports: (n: number, dual: boolean) => Fact; send: string }> = {
  bus: { cables: (n) => [`${n + 1}`, "1 trunk + n drop cables"], ports: () => ["1", "a tap on the trunk"], send: "one at a time: every PC hears every frame" },
  star: { cables: (n) => [`${n}`, "one per PC"], ports: (n) => ["1", `the hub needs ${n}`], send: "hub: one at a time · switch: many at once" },
  ring: { cables: (n, d) => [`${d ? 2 * n : n}`, d ? "two loops, opposite directions" : "PC to PC in a loop"], ports: (_, d) => [d ? "4" : "2", d ? "in and out on each ring" : "in and out"], send: "only the token holder" },
  mesh: { cables: (n) => [`${(n * (n - 1)) / 2}`, "n(n − 1)/2"], ports: (n) => [`${n - 1}`, "n − 1"], send: "every pair at once, dedicated link" },
};

export function TopologyLab() {
  const { values: v, set, reset } = useExplorationState(defaults);
  const sig = `${v.topo}-${v.n}`;
  const [fail, setFail] = useState<{ sig: string; ids: string[] }>({ sig: "", ids: [] });
  const failed = useMemo(() => new Set(fail.sig === sig ? fail.ids : []), [fail, sig]);

  const { nodes, edges } = useMemo(() => layout(v.topo, v.n), [v.topo, v.n]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const { reach, collapse } = reachability(v.topo, v.dual, nodes, edges, failed);

  const hosts = nodes.filter((n) => n.kind === "host");
  const totalPairs = (v.n * (v.n - 1)) / 2;
  let pairs = 0;
  for (const h of hosts) pairs += reach.get(h.id)!.size;
  pairs /= 2;
  const alive = hosts.filter((h) => !failed.has(h.id)).length;
  const alivePairs = (alive * (alive - 1)) / 2;

  function toggle(id: string) {
    const cur = fail.sig === sig ? fail.ids : [];
    setFail({ sig, ids: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  }

  const edgeColor = (e: Edge) => {
    if (failed.has(e.id)) return P.red;
    if (collapse) return P.redSoft;
    if (failed.has(e.a) || failed.has(e.b)) return P.lineStrong;
    if (e.kind === "drop") return P.lineStrong;
    if (v.topo === "bus" || v.topo === "ring") return P.amber;
    if (v.topo === "mesh") return P.green;
    return P.blueSoft;
  };

  const f = FACTS[v.topo];
  let note: string;
  if (collapse === "trunk") note = "A cut trunk leaves two unterminated ends. Signals reflect off them and collide with themselves, so the whole bus goes quiet, even between PCs on the same side of the cut.";
  else if (collapse === "ring") note = "Every PC in a ring repeats the signal to the next one. One dead PC or cable and the token never comes back: the whole ring stops. Turn on the dual ring to see how FDDI survives a single fault.";
  else if (failed.has("hub")) note = "The hub is the single point of failure. Every PC is fine and none of them can talk.";
  else if (failed.size === 0) note = "Click any PC, cable or the hub to break it and watch who can still reach whom.";
  else if (pairs === alivePairs) note = "Everything still alive can still talk. This topology tolerated what you broke.";
  else note = "Part of the network is cut off. Green PCs reach every live PC, amber reach some, red reach none.";

  return (
    <Lab
      title="Break a topology"
      subtitle="Pick a topology, then click PCs, cables or the hub to fail them."
      onReset={() => {
        reset();
        setFail({ sig: "", ids: [] });
      }}
      controls={
        <>
          <SegmentRow
            label="Topology"
            value={v.topo}
            options={[
              { value: "bus", label: "Bus" },
              { value: "star", label: "Star" },
              { value: "ring", label: "Ring" },
              { value: "mesh", label: "Mesh" },
            ]}
            onChange={(x) => set("topo", x)}
          />
          <SliderRow label="PCs" value={v.n} min={4} max={8} onChange={(x) => set("n", x)} />
          {v.topo === "ring" && <ToggleRow label="Dual counter-rotating ring (FDDI)" value={v.dual} onChange={(x) => set("dual", x)} />}
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Cables" value={f.cables(v.n, v.dual)[0]} note={f.cables(v.n, v.dual)[1]} />
        <Stat label="Ports per PC" value={f.ports(v.n, v.dual)[0]} note={f.ports(v.n, v.dual)[1]} />
        <Stat label="Pairs that can talk" value={`${pairs} / ${totalPairs}`} tone={pairs === totalPairs ? "green" : pairs === 0 ? "red" : "amber"} />
        <Stat label="Who sends at once" value={v.topo === "mesh" ? "all pairs" : v.topo === "star" ? "depends" : "one"} note={f.send} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full select-none" role="img" aria-label={`${v.topo} topology with ${v.n} PCs`}>
        {edges.map((e) => {
          const a = byId.get(e.a)!;
          const b = byId.get(e.b)!;
          const isFailed = failed.has(e.id);
          const dualRing = v.topo === "ring" && v.dual;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ox = (-dy / len) * 3;
          const oy = (dx / len) * 3;
          return (
            <g key={e.id} onClick={() => toggle(e.id)} className="cursor-pointer">
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={14} />
              {dualRing ? (
                <>
                  <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke={edgeColor(e)} strokeWidth={1.4} strokeDasharray={isFailed ? "4 3" : undefined} />
                  <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke={edgeColor(e)} strokeWidth={1.4} strokeDasharray={isFailed ? "4 3" : undefined} />
                </>
              ) : (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={edgeColor(e)}
                  strokeWidth={e.kind === "trunk" ? 3 : v.topo === "mesh" ? 1.1 : 1.6}
                  strokeOpacity={v.topo === "mesh" && !isFailed ? 0.6 : 1}
                  strokeDasharray={isFailed ? "4 3" : undefined}
                />
              )}
              {isFailed && (
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 4} textAnchor="middle" fill={P.redSoft} fontSize={12} fontFamily={P.mono}>
                  ✕
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((n) => {
          if (n.kind === "tap") return <circle key={n.id} cx={n.x} cy={n.y} r={3} fill={P.amber} />;
          if (n.kind === "end")
            return (
              <g key={n.id}>
                <rect x={n.x - 7} y={n.y - 7} width={14} height={14} rx={2} fill={P.panel} stroke={P.muted} />
                <text x={n.x} y={n.y + 3} textAnchor="middle" fill={P.text} fontSize={9} fontFamily={P.mono}>
                  T
                </text>
              </g>
            );
          const isFailed = failed.has(n.id);
          if (n.kind === "hub")
            return (
              <g key={n.id} onClick={() => toggle(n.id)} className="cursor-pointer">
                <rect x={n.x - 30} y={n.y - 15} width={60} height={30} rx={5} fill={P.panel} />
                <rect x={n.x - 30} y={n.y - 15} width={60} height={30} rx={5} fill={isFailed ? "rgba(229,72,77,0.18)" : "rgba(0,112,243,0.18)"} stroke={isFailed ? P.red : P.blue} />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fill={isFailed ? P.redSoft : P.textStrong} fontSize={11} fontFamily={P.mono}>
                  {isFailed ? "hub ✕" : "hub"}
                </text>
              </g>
            );
          const r = reach.get(n.id)!.size;
          const others = alive - 1;
          const tone = isFailed ? "dead" : r === 0 && others > 0 ? "cut" : r === others ? "ok" : "partial";
          const stroke = { dead: P.red, cut: P.red, ok: P.green, partial: P.amber }[tone];
          const fill = { dead: "rgba(229,72,77,0.18)", cut: P.panel, ok: P.panel, partial: P.panel }[tone];
          return (
            <g key={n.id} onClick={() => toggle(n.id)} className="cursor-pointer">
              <rect x={n.x - 20} y={n.y - 12} width={40} height={24} rx={4} fill={P.panel} />
              <rect x={n.x - 20} y={n.y - 12} width={40} height={24} rx={4} fill={fill} stroke={stroke} strokeWidth={1.4} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fill={isFailed ? P.redSoft : P.textStrong} fontSize={10} fontFamily={P.mono}>
                {isFailed ? `${n.label} ✕` : n.label}
              </text>
            </g>
          );
        })}
        {v.topo === "bus" && (
          <text x={30} y={H - 6} fill={P.muted} fontSize={9} fontFamily={P.mono}>
            T = terminator: absorbs the signal at each end of the trunk
          </text>
        )}
      </svg>
      <p className="text-copy-13 mt-1 text-gray-600">{note}</p>
    </Lab>
  );
}

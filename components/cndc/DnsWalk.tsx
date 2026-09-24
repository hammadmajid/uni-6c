"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Figure, P } from "@/components/learning/Figure";
import { SegmentRow } from "@/components/learning/Controls";

type NodeId = "host" | "local" | "root" | "tld" | "auth";
type Mode = "iterative" | "recursive";
type Cache = "cold" | "tld" | "answer";

const NODES: Record<NodeId, { x: number; y: number; name: string; sub: string }> = {
  host: { x: 80, y: 160, name: "your laptop", sub: "stub resolver" },
  local: { x: 270, y: 160, name: "local DNS server", sub: "ISP or 1.1.1.1" },
  root: { x: 520, y: 52, name: "root server", sub: "a.root-servers.net" },
  tld: { x: 520, y: 160, name: ".edu TLD server", sub: "a.edu-servers.net" },
  auth: { x: 520, y: 268, name: "authoritative", sub: "ns1.umass.edu" },
};
const NW = 132;
const NH = 40;

// One-way latencies, ms, for the time readout. The authoritative server is in Massachusetts.
const LAT: Record<string, number> = { "host-local": 3, "local-root": 15, "local-tld": 20, "local-auth": 110, "root-tld": 40, "tld-auth": 90 };
function lat(a: NodeId, b: NodeId) {
  return LAT[`${a}-${b}`] ?? LAT[`${b}-${a}`] ?? 50;
}

interface Msg {
  from: NodeId;
  to: NodeId;
  answer: boolean;
  text: string;
}

function steps(mode: Mode, cache: Cache): Msg[] {
  const q = (from: NodeId, to: NodeId, text: string): Msg => ({ from, to, answer: false, text });
  const a = (from: NodeId, to: NodeId, text: string): Msg => ({ from, to, answer: true, text });
  const first = q("host", "local", "Your laptop asks its local DNS server for gaia.cs.umass.edu, type A. This one query is recursive: 'give me the final answer, do the work yourself'.");
  const last = a("local", "host", "The local server returns A 128.119.245.12 to your laptop and caches it for the record's TTL. Your browser can now open a TCP connection.");
  if (cache === "answer") {
    return [first, a("local", "host", "The local server already has gaia.cs.umass.edu in its cache from an earlier lookup (someone on your ISP asked within the TTL). It answers immediately. No root, TLD or authoritative server is contacted.")];
  }
  if (mode === "iterative") {
    const out: Msg[] = [first];
    if (cache === "cold") {
      out.push(
        q("local", "root", "The local server asks a root server. Root does not know gaia, but it knows who runs .edu."),
        a("root", "local", "Referral: 'I don't know, but the .edu TLD servers are a.edu-servers.net and friends; here are their addresses.' This is an iterative reply."),
      );
    }
    out.push(
      q("local", "tld", cache === "tld" ? "The .edu TLD servers' addresses are already cached (their TTL is two days), so the local server skips the root entirely and asks .edu directly." : "The local server asks the .edu TLD server."),
      a("tld", "local", "Referral: 'umass.edu is served by ns1.umass.edu; here is its address.' Another iterative reply."),
      q("local", "auth", "The local server asks the authoritative server for umass.edu, which holds the actual record."),
      a("auth", "local", "Answer: gaia.cs.umass.edu A 128.119.245.12, TTL 3600. The authoritative server is the one place this record is defined."),
      last,
    );
    return out;
  }
  // Recursive all the way: each server does the work for the one that asked it.
  const out: Msg[] = [first];
  if (cache === "cold") {
    out.push(
      q("local", "root", "The local server asks the root, recursively: 'find it for me'."),
      q("root", "tld", "The root, instead of referring, asks the .edu TLD server itself. Root servers do not actually do this; that is why real DNS is iterative from the local server on."),
      q("tld", "auth", "The TLD server asks the authoritative server itself."),
      a("auth", "tld", "The authoritative server answers the TLD server."),
      a("tld", "root", "The TLD server passes the answer back to the root."),
      a("root", "local", "The root passes it back to the local server. Every server in the chain held state for this query while it waited."),
      last,
    );
  } else {
    out.push(
      q("local", "tld", "The .edu servers are cached, so the local server asks the TLD recursively."),
      q("tld", "auth", "The TLD server asks the authoritative server itself."),
      a("auth", "tld", "The authoritative server answers the TLD server."),
      a("tld", "local", "The TLD server passes it back."),
      last,
    );
  }
  return out;
}

/** Clip the segment between two node centres to the node boxes, then shift it sideways. */
function seg(a: NodeId, b: NodeId, offset: number) {
  const A = NODES[a];
  const B = NODES[b];
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const len = Math.hypot(dx, dy);
  const clip = (ddx: number, ddy: number) => Math.min(ddx === 0 ? Infinity : (NW / 2 + 6) / Math.abs(ddx), ddy === 0 ? Infinity : (NH / 2 + 6) / Math.abs(ddy));
  const t = clip(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  return {
    x1: A.x + dx * t + nx * offset,
    y1: A.y + dy * t + ny * offset,
    x2: B.x - dx * t + nx * offset,
    y2: B.y - dy * t + ny * offset,
    nx,
    ny,
  };
}

export function DnsWalk() {
  const [mode, setMode] = useState<Mode>("iterative");
  const [cache, setCache] = useState<Cache>("cold");
  const [i, setI] = useState(0);
  const msgs = steps(mode, cache);
  const cur = Math.min(i, msgs.length - 1);
  const shown = msgs.slice(0, cur + 1);
  const elapsed = shown.reduce((s, m) => s + lat(m.from, m.to), 0);
  const total = msgs.reduce((s, m) => s + lat(m.from, m.to), 0);
  const W = 640;
  const H = 300;

  function pick<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setI(0);
    };
  }

  return (
    <Figure
      title="Resolving gaia.cs.umass.edu, one message at a time"
      controls={
        <div className="flex items-center gap-1.5">
          <button onClick={() => setI(Math.max(0, cur - 1))} disabled={cur === 0} aria-label="Previous message" className="rounded-md border border-gray-500 p-1.5 text-gray-800 hover:text-gray-1000 disabled:opacity-30">
            <ChevronLeft size={14} />
          </button>
          <span className="text-label-12-mono w-12 text-center text-gray-900">
            {cur + 1}/{msgs.length}
          </span>
          <button onClick={() => setI(Math.min(msgs.length - 1, cur + 1))} disabled={cur === msgs.length - 1} aria-label="Next message" className="rounded-md border border-gray-500 p-1.5 text-gray-800 hover:text-gray-1000 disabled:opacity-30">
            <ChevronRight size={14} />
          </button>
          <button onClick={() => setI(0)} aria-label="Restart" className="rounded-md p-1.5 text-gray-700 hover:text-gray-1000">
            <RotateCcw size={13} />
          </button>
        </div>
      }
      caption={
        <>
          Step through with the arrows. Blue arrows are queries, green are replies. Then switch to recursive and count how many servers have to hold the query
          open, and switch the cache setting to see why most lookups never reach a root server at all.
        </>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <SegmentRow
          label="Queries after the first"
          value={mode}
          onChange={pick(setMode)}
          options={[
            { value: "iterative", label: "Iterative (real DNS)" },
            { value: "recursive", label: "Recursive" },
          ]}
        />
        <SegmentRow
          label="Local server's cache"
          value={cache}
          onChange={pick(setCache)}
          options={[
            { value: "cold", label: "Cold" },
            { value: "tld", label: ".edu cached" },
            { value: "answer", label: "Answer cached" },
          ]}
        />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="DNS resolution message sequence">
        {msgs.map((m, k) => {
          const s = seg(m.from, m.to, m.answer ? 7 : -7);
          const done = k <= cur;
          const now = k === cur;
          const tone = !done ? P.line : m.answer ? P.green : P.blue;
          const dir = { x: s.x2 - s.x1, y: s.y2 - s.y1 };
          const L = Math.hypot(dir.x, dir.y);
          const ux = dir.x / L;
          const uy = dir.y / L;
          const mx = (s.x1 + s.x2) / 2 + s.nx * (m.answer ? 13 : -13);
          const my = (s.y1 + s.y2) / 2 + s.ny * (m.answer ? 13 : -13);
          return (
            <g key={k} opacity={done ? 1 : 0.5}>
              <line x1={s.x1} y1={s.y1} x2={s.x2 - ux * 6} y2={s.y2 - uy * 6} stroke={tone} strokeWidth={now ? 2.4 : 1.4} />
              <polygon points={`${s.x2},${s.y2} ${s.x2 - ux * 9 - uy * 4},${s.y2 - uy * 9 + ux * 4} ${s.x2 - ux * 9 + uy * 4},${s.y2 - uy * 9 - ux * 4}`} fill={tone} />
              {done && (
                <g>
                  <circle cx={mx} cy={my} r={8} fill={now ? tone : P.bg} stroke={tone} />
                  <text x={mx} y={my + 3.5} textAnchor="middle" fill={now ? "#fff" : P.textStrong} fontSize={9} fontFamily={P.mono}>
                    {k + 1}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        {(Object.keys(NODES) as NodeId[]).map((id) => {
          const n = NODES[id];
          const active = msgs[cur].from === id || msgs[cur].to === id;
          return (
            <g key={id}>
              <rect x={n.x - NW / 2} y={n.y - NH / 2} width={NW} height={NH} rx={5} fill={active ? "rgba(0,112,243,0.12)" : P.panel} stroke={active ? P.blue : P.lineStrong} />
              <text x={n.x} y={n.y - 3} textAnchor="middle" fill={P.textStrong} fontSize={11}>
                {n.name}
              </text>
              <text x={n.x} y={n.y + 12} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
                {n.sub}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 rounded-md border border-gray-400 bg-background-100 px-3 py-2.5">
        <p className="text-label-12 text-gray-700">
          Message {cur + 1} · {NODES[msgs[cur].from].name} → {NODES[msgs[cur].to].name} · {msgs[cur].answer ? "reply" : "query"}
        </p>
        <p className="text-copy-14 mt-1 text-gray-1000">{msgs[cur].text}</p>
      </div>
      <p className="text-label-12-mono mt-2 text-gray-700">
        {msgs.length} messages · elapsed ≈ {elapsed} ms of ≈ {total} ms (illustrative one-way latencies)
      </p>
    </Figure>
  );
}

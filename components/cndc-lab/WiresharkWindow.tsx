"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Play, RotateCcw, Square } from "lucide-react";
import { CAPTURE, rowTone, timeOfDay, type Node, type Packet } from "./capture";
import { applyFilter } from "./filter";

export type TimeFormat = "relative" | "tod" | "delta" | "delta-displayed";

const TIME_FORMATS: { value: TimeFormat; label: string }[] = [
  { value: "relative", label: "Seconds Since Beginning of Capture" },
  { value: "tod", label: "Time of Day" },
  { value: "delta", label: "Seconds Since Previous Captured Packet" },
  { value: "delta-displayed", label: "Seconds Since Previous Displayed Packet" },
];

export interface WiresharkWindowProps {
  packets?: Packet[];
  /** Controlled display filter. Leave undefined to let the window own it. */
  filter?: string;
  onFilterChange?: (f: string) => void;
  initialFilter?: string;
  /** Number the five regions and show a legend that explains each. */
  annotate?: boolean;
  /** Start empty with a Start button; packets appear at their real timestamps. */
  replay?: boolean;
  /** Frame number to select initially. */
  initialSelected?: number;
  /** Which panes to show. Default: all three. */
  panes?: { list?: boolean; details?: boolean; bytes?: boolean };
  /** Top-level tree nodes to expand initially, matched by label prefix (e.g. "Hypertext"). */
  expand?: string[];
  listRows?: number;
  title?: string;
  /** Shown under the window; use for a one-line "what to look at". */
  caption?: ReactNode;
  initialTimeFormat?: TimeFormat;
}

const REGIONS = [
  { n: 1, name: "Command menus", what: "Standard pull-down menus. File saves or opens a capture; Capture starts and stops capturing; View changes how the Time column is shown." },
  { n: 2, name: "Display filter", what: "Type a protocol name or field expression here to hide every packet that does not match. Green means the filter parses; red means it does not. Filtering changes what is displayed, not what was captured." },
  { n: 3, name: "Packet list", what: "One line per captured frame: Wireshark's own frame number (not a field of any protocol), capture time, source and destination, the highest-layer protocol it could decode, length, and a summary. Click a column header to sort." },
  { n: 4, name: "Packet details", what: "The selected packet dissected layer by layer, outermost first: Frame, Ethernet, IP, TCP or UDP, then the application protocol. Expand a layer to see its header fields." },
  { n: 5, name: "Packet bytes", what: "Every byte of the selected frame, in hexadecimal and ASCII. Click a field in the details pane and its bytes light up here. This is what actually went on the wire." },
];

function fmtTime(p: Packet, fmt: TimeFormat, prevCaptured: Packet | undefined, prevDisplayed: Packet | undefined) {
  if (fmt === "tod") return timeOfDay(p.time);
  if (fmt === "delta") return (p.time - (prevCaptured?.time ?? p.time)).toFixed(6);
  if (fmt === "delta-displayed") return (p.time - (prevDisplayed?.time ?? p.time)).toFixed(6);
  return p.time.toFixed(6);
}

type SortKey = "no" | "time" | "src" | "dst" | "proto" | "len";

export function WiresharkWindow({
  packets = CAPTURE,
  filter: controlledFilter,
  onFilterChange,
  initialFilter = "",
  annotate = false,
  replay = false,
  initialSelected,
  panes = { list: true, details: true, bytes: true },
  expand = [],
  listRows = 9,
  title = "Wireshark · wlp0s20f3",
  caption,
  initialTimeFormat = "relative",
}: WiresharkWindowProps) {
  const [ownFilter, setOwnFilter] = useState(initialFilter);
  const filter = controlledFilter ?? ownFilter;
  const setFilter = (f: string) => {
    setOwnFilter(f);
    onFilterChange?.(f);
  };
  const [timeFmt, setTimeFmt] = useState<TimeFormat>(initialTimeFormat);
  const [menu, setMenu] = useState<null | "view" | "capture">(null);
  const [selected, setSelected] = useState<number | null>(initialSelected ?? null);
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set(expand.map((e) => `label:${e}`)));
  const [selNode, setSelNode] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "no", dir: 1 });
  const [region, setRegion] = useState<number | null>(null);

  // Replay: reveal packets as their timestamps arrive.
  const [elapsed, setElapsed] = useState<number | null>(replay ? null : Infinity);
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      const e = (performance.now() - startRef.current) / 1000;
      setElapsed(e);
      if (e > packets[packets.length - 1].time + 0.3) {
        setRunning(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, packets]);

  const captured = useMemo(() => (elapsed === null ? [] : packets.filter((p) => p.time <= elapsed)), [packets, elapsed]);
  const result = useMemo(() => applyFilter(filter, captured), [filter, captured]);
  const displayed = useMemo(() => {
    const rows = [...result.matches];
    const k = sort.key;
    rows.sort((a, b) => {
      const va = k === "no" ? a.no : k === "time" ? a.time : k === "len" ? a.bytes.length : k === "src" ? a.src : k === "dst" ? a.dst : a.proto;
      const vb = k === "no" ? b.no : k === "time" ? b.time : k === "len" ? b.bytes.length : k === "src" ? b.src : k === "dst" ? b.dst : b.proto;
      return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
    });
    return rows;
  }, [result, sort]);

  const pkt = selected !== null ? packets.find((p) => p.no === selected) ?? null : null;
  const showPkt = pkt && captured.includes(pkt) ? pkt : null;

  // Find the node currently selected in the tree, for byte highlighting.
  const selRange = useMemo<[number, number] | null>(() => {
    if (!showPkt || !selNode) return null;
    let found: Node | null = null;
    const walk = (nodes: Node[], path: string) => {
      nodes.forEach((n, i) => {
        const p = `${path}/${i}`;
        if (p === selNode) found = n;
        if (n.children) walk(n.children, p);
      });
    };
    walk(showPkt.tree, "");
    const f = found as Node | null;
    return f?.range ?? null;
  }, [showPkt, selNode]);

  function toggleNode(path: string, n: Node) {
    setSelNode(path);
    if (!n.children) return;
    setOpenNodes((s) => {
      const next = new Set(s);
      if (isOpen(path, n)) {
        next.delete(path);
        next.add(`closed:${path}`);
      } else {
        next.add(path);
        next.delete(`closed:${path}`);
      }
      return next;
    });
  }
  function isOpen(path: string, n: Node) {
    if (openNodes.has(`closed:${path}`)) return false;
    if (openNodes.has(path)) return true;
    return expand.some((e) => n.label.startsWith(e)) && path.split("/").length === 2;
  }

  function byteClick(offset: number) {
    if (!showPkt) return;
    let best: { path: string; len: number } | null = null;
    const walk = (nodes: Node[], path: string) => {
      nodes.forEach((n, i) => {
        const p = `${path}/${i}`;
        if (n.range && offset >= n.range[0] && offset < n.range[0] + n.range[1] && (!best || n.range[1] <= best.len)) best = { path: p, len: n.range[1] };
        if (n.children) walk(n.children, p);
      });
    };
    walk(showPkt.tree, "");
    if (best) {
      const b = best as { path: string; len: number };
      setSelNode(b.path);
      // open every ancestor
      setOpenNodes((s) => {
        const next = new Set(s);
        const parts = b.path.split("/").filter(Boolean);
        for (let i = 1; i < parts.length; i++) {
          const anc = "/" + parts.slice(0, i).join("/");
          next.add(anc);
          next.delete(`closed:${anc}`);
        }
        return next;
      });
    }
  }

  const regionCls = (n: number) => (annotate && region === n ? "ring-2 ring-blue-700 ring-inset" : "");
  const Badge = ({ n }: { n: number }) =>
    annotate ? (
      <button
        onClick={() => setRegion(region === n ? null : n)}
        className={`absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold ${
          region === n ? "border-blue-700 bg-blue-700 text-white" : "border-blue-700/60 bg-background-100 text-blue-600"
        }`}
        aria-label={`Region ${n}`}
      >
        {n}
      </button>
    ) : null;

  const lineH = 22;

  return (
    <div className="my-6">
      <div className="overflow-hidden rounded-lg border border-gray-500 bg-[#141414] font-mono text-[11px] leading-[18px] text-gray-900">
        {/* window title */}
        <div className="flex items-center gap-2 border-b border-gray-500 bg-[#1d1d1d] px-3 py-1.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="text-label-12 mx-auto text-gray-800">{replay && elapsed === null ? "The Wireshark Network Analyzer" : title}</span>
        </div>

        {/* 1: menus */}
        <div className={`relative border-b border-gray-500 bg-[#181818] ${regionCls(1)}`}>
          <Badge n={1} />
          <div className="flex flex-wrap items-center gap-x-3 px-3 py-1 text-[11px] text-gray-800">
            {["File", "Edit", "View", "Go", "Capture", "Analyze", "Statistics", "Telephony", "Wireless", "Tools", "Help"].map((m) => {
              const key = m === "View" ? "view" : m === "Capture" ? "capture" : null;
              const active = key && menu === key;
              return (
                <button
                  key={m}
                  onClick={() => key && setMenu(active ? null : key)}
                  className={`rounded px-1 ${key ? "hover:bg-gray-100 hover:text-gray-1000" : "cursor-default"} ${active ? "bg-gray-100 text-gray-1000" : ""}`}
                >
                  {m}
                </button>
              );
            })}
          </div>
          {menu === "view" && (
            <div className="absolute left-14 top-7 z-20 w-72 rounded-md border border-gray-500 bg-[#1d1d1d] p-1 shadow-xl">
              <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-600">Time Display Format</p>
              {TIME_FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setTimeFmt(f.value);
                    setMenu(null);
                  }}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-gray-100 ${timeFmt === f.value ? "text-blue-600" : "text-gray-900"}`}
                >
                  <span className="w-3">{timeFmt === f.value ? "•" : ""}</span>
                  {f.label}
                </button>
              ))}
            </div>
          )}
          {menu === "capture" && (
            <div className="absolute left-36 top-7 z-20 w-56 rounded-md border border-gray-500 bg-[#1d1d1d] p-1 shadow-xl">
              <button
                onClick={() => {
                  setMenu(null);
                  if (!replay) return;
                  startRef.current = performance.now();
                  setElapsed(0);
                  setRunning(true);
                  setSelected(null);
                }}
                disabled={!replay || running}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-gray-900 hover:bg-gray-100 disabled:opacity-40"
              >
                <Play size={11} /> Start
              </button>
              <button
                onClick={() => {
                  setMenu(null);
                  setRunning(false);
                }}
                disabled={!running}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-gray-900 hover:bg-gray-100 disabled:opacity-40"
              >
                <Square size={11} /> Stop
              </button>
              <button
                onClick={() => {
                  setMenu(null);
                  if (!replay) return;
                  startRef.current = performance.now();
                  setElapsed(0);
                  setRunning(true);
                  setSelected(null);
                }}
                disabled={!replay}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-gray-900 hover:bg-gray-100 disabled:opacity-40"
              >
                <RotateCcw size={11} /> Restart
              </button>
            </div>
          )}
        </div>

        {/* toolbar + 2: filter */}
        {panes.list !== false && (
        <div className={`relative border-b border-gray-500 bg-[#161616] ${regionCls(2)}`}>
          <Badge n={2} />
          <div className="flex items-center gap-2 px-3 py-1.5">
            {replay && (
              <span className="flex items-center gap-1 border-r border-gray-500 pr-2">
                <button
                  onClick={() => {
                    startRef.current = performance.now();
                    setElapsed(0);
                    setRunning(true);
                    setSelected(null);
                  }}
                  disabled={running}
                  title="Start capturing packets"
                  className="rounded p-0.5 text-blue-600 hover:bg-gray-100 disabled:opacity-30"
                >
                  <Play size={13} />
                </button>
                <button onClick={() => setRunning(false)} disabled={!running} title="Stop capturing packets" className="rounded p-0.5 text-red-600 hover:bg-gray-100 disabled:opacity-30">
                  <Square size={13} />
                </button>
              </span>
            )}
            <div
              className={`flex flex-1 items-center gap-2 rounded border px-2 py-1 ${
                filter.trim() === "" ? "border-gray-500 bg-[#101010]" : result.ok ? "border-green-700/60 bg-green-700/10" : "border-red-700/60 bg-red-700/10"
              }`}
            >
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Apply a display filter … <Ctrl-/>"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="w-full bg-transparent text-[12px] text-gray-1000 outline-none placeholder:text-gray-600"
                aria-label="Display filter"
              />
              {filter && (
                <button onClick={() => setFilter("")} className="text-gray-600 hover:text-gray-1000" aria-label="Clear filter">
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() => setFilter(filter)}
              className="rounded border border-gray-500 px-2 py-0.5 text-[11px] text-gray-900 hover:border-gray-700"
            >
              Apply
            </button>
          </div>
          {!result.ok && <p className="px-3 pb-1.5 text-[11px] text-red-600">{result.error}</p>}
        </div>
        )}

        {/* 3: packet list */}
        {panes.list !== false && (
          <div className={`relative border-b border-gray-500 ${regionCls(3)}`}>
            <Badge n={3} />
            {replay && elapsed === null ? (
              <div className="px-4 py-6">
                <p className="text-label-12 mb-2 text-gray-700">Capture · using this filter: <span className="text-green-600">none</span></p>
                <ul className="list-none space-y-1 pl-0">
                  {[
                    { name: "wlp0s20f3", note: "Wi-Fi, 192.168.1.7", pick: true },
                    { name: "enp0s31f6", note: "Ethernet, no carrier" },
                    { name: "docker0", note: "172.17.0.1" },
                    { name: "lo", note: "Loopback" },
                    { name: "any", note: "Linux cooked capture" },
                  ].map((i) => (
                    <li key={i.name} className="mt-0">
                      <button
                        onClick={() => {
                          if (!i.pick) return;
                          startRef.current = performance.now();
                          setElapsed(0);
                          setRunning(true);
                        }}
                        className={`flex w-full items-center gap-3 rounded px-2 py-1 text-left ${i.pick ? "text-gray-1000 hover:bg-blue-700/15" : "text-gray-600"}`}
                      >
                        <span className="w-24">{i.name}</span>
                        <span className="text-gray-700">{i.note}</span>
                        {i.pick && <span className="ml-auto text-[10px] text-blue-600">double-click → start</span>}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] text-gray-600">Pick the interface that has your IP address. Or Capture › Start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-[#1b1b1b] text-left text-[10.5px] text-gray-700">
                      {(
                        [
                          ["no", "No.", "w-11"],
                          ["time", "Time", "w-[88px]"],
                          ["src", "Source", "w-[118px]"],
                          ["dst", "Destination", "w-[118px]"],
                          ["proto", "Protocol", "w-[62px]"],
                          ["len", "Length", "w-[50px]"],
                          [null, "Info", ""],
                        ] as const
                      ).map(([key, label, w]) => (
                        <th
                          key={label}
                          className={`${w} border-r border-b-0 border-gray-500/60 px-1.5 py-0.5 font-normal normal-case tracking-normal last:border-r-0 ${key ? "cursor-pointer select-none hover:text-gray-1000" : ""}`}
                          onClick={() => key && setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }))}
                        >
                          {label}
                          {key && sort.key === key ? (sort.dir === 1 ? " ▲" : " ▼") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
                <div style={{ height: listRows * lineH }} className="overflow-y-auto">
                  <table className="w-full table-fixed border-collapse">
                    <tbody>
                      {displayed.map((p, i) => {
                        const tone = rowTone(p);
                        const isSel = selected === p.no;
                        const prevCaptured = captured[captured.indexOf(p) - 1];
                        return (
                          <tr
                            key={p.no}
                            onClick={() => {
                              setSelected(p.no);
                              setSelNode(null);
                            }}
                            style={isSel ? undefined : { background: tone.bg, boxShadow: `inset 3px 0 0 ${tone.border}` }}
                            className={`cursor-pointer whitespace-nowrap ${isSel ? "bg-blue-700 text-white" : "text-gray-1000 hover:brightness-125"}`}
                          >
                            <td className="w-11 border-0 px-1.5 py-0 text-inherit text-right align-middle" style={{ height: lineH }}>
                              {p.no}
                            </td>
                            <td className="w-[88px] border-0 px-1.5 py-0 text-inherit align-middle">{fmtTime(p, timeFmt, prevCaptured, displayed[i - 1])}</td>
                            <td className="w-[118px] truncate border-0 px-1.5 py-0 text-inherit align-middle">{p.src}</td>
                            <td className="w-[118px] truncate border-0 px-1.5 py-0 text-inherit align-middle">{p.dst}</td>
                            <td className="w-[62px] border-0 px-1.5 py-0 text-inherit align-middle">{p.proto}</td>
                            <td className="w-[50px] border-0 px-1.5 py-0 text-inherit text-right align-middle">{p.bytes.length}</td>
                            <td className="truncate border-0 px-1.5 py-0 text-inherit align-middle">{p.info}</td>
                          </tr>
                        );
                      })}
                      {displayed.length === 0 && (
                        <tr>
                          <td colSpan={7} className="border-0 px-3 py-4 text-center text-gray-600" style={{ height: lineH * 3 }}>
                            {running ? "Capturing…" : result.ok ? "No packets match this filter." : "Fix the filter to see packets."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4: details */}
        {panes.details !== false && (
          <div className={`relative border-b border-gray-500 ${regionCls(4)}`}>
            <Badge n={4} />
            <div className="h-[196px] overflow-auto px-2 py-1.5">
              {!showPkt ? (
                <p className="px-1 py-2 text-gray-600">Select a packet in the list to dissect it.</p>
              ) : (
                <Tree nodes={showPkt.tree} path="" depth={0} isOpen={isOpen} onToggle={toggleNode} selNode={selNode} />
              )}
            </div>
          </div>
        )}

        {/* 5: bytes */}
        {panes.bytes !== false && (
          <div className={`relative ${regionCls(5)}`}>
            <Badge n={5} />
            <div className="h-[150px] overflow-auto px-3 py-1.5">
              {!showPkt ? (
                <p className="py-2 text-gray-600">Bytes of the selected packet appear here.</p>
              ) : (
                <HexDump bytes={showPkt.bytes} range={selRange} onByteClick={byteClick} />
              )}
            </div>
          </div>
        )}

        {/* status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-500 bg-[#181818] px-3 py-1 text-[10.5px] text-gray-700">
          <span>
            {selRange && showPkt ? `Selected bytes ${selRange[0]}–${selRange[0] + selRange[1] - 1} (${selRange[1]} bytes)` : showPkt ? `Frame ${showPkt.no}: ${showPkt.bytes.length} bytes` : replay && running ? "Capturing on wlp0s20f3" : "Ready to load or capture"}
          </span>
          <span>
            Packets: {captured.length} · Displayed: {result.ok ? result.matches.length : 0}
            {captured.length > 0 && result.ok ? ` (${((result.matches.length / captured.length) * 100).toFixed(1)}%)` : ""}
            {replay && elapsed !== null ? ` · ${Math.min(elapsed, packets[packets.length - 1].time).toFixed(1)} s` : ""}
          </span>
        </div>
      </div>

      {annotate && (
        <ol className="mt-3 grid list-none gap-1.5 pl-0 sm:grid-cols-2">
          {REGIONS.map((r) => (
            <li key={r.n} className="mt-0">
              <button
                onClick={() => setRegion(region === r.n ? null : r.n)}
                className={`w-full rounded-md border p-2.5 text-left transition-colors ${region === r.n ? "border-blue-700 bg-blue-700/10" : "border-gray-400 hover:border-gray-600"}`}
              >
                <span className="text-label-12 flex items-center gap-2 text-gray-1000">
                  <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border text-[10px] ${region === r.n ? "border-blue-700 bg-blue-700 text-white" : "border-blue-700/60 text-blue-600"}`}>{r.n}</span>
                  {r.name}
                </span>
                {region === r.n && <span className="text-copy-13 mt-1.5 block text-gray-800">{r.what}</span>}
              </button>
            </li>
          ))}
        </ol>
      )}
      {caption && <p className="text-copy-13 mt-2 text-gray-700">{caption}</p>}
    </div>
  );
}

function Tree({
  nodes,
  path,
  depth,
  isOpen,
  onToggle,
  selNode,
}: {
  nodes: Node[];
  path: string;
  depth: number;
  isOpen: (path: string, n: Node) => boolean;
  onToggle: (path: string, n: Node) => void;
  selNode: string | null;
}) {
  return (
    <ul className="list-none pl-0">
      {nodes.map((n, i) => {
        const p = `${path}/${i}`;
        const open = n.children ? isOpen(p, n) : false;
        const sel = selNode === p;
        return (
          <li key={p} className="mt-0">
            <button
              onClick={() => onToggle(p, n)}
              className={`flex w-full items-center gap-1 whitespace-nowrap rounded px-1 text-left ${sel ? "bg-blue-700 text-white" : depth === 0 ? "text-gray-1000 hover:bg-gray-100" : "text-gray-900 hover:bg-gray-100"}`}
              style={{ paddingLeft: 4 + depth * 14 }}
            >
              <span className="w-3 shrink-0 text-gray-600">{n.children ? open ? <ChevronDown size={11} /> : <ChevronRight size={11} /> : ""}</span>
              <span className="truncate">{n.label}</span>
            </button>
            {open && n.children && <Tree nodes={n.children} path={p} depth={depth + 1} isOpen={isOpen} onToggle={onToggle} selNode={selNode} />}
          </li>
        );
      })}
    </ul>
  );
}

function HexDump({ bytes, range, onByteClick }: { bytes: Uint8Array; range: [number, number] | null; onByteClick: (offset: number) => void }) {
  const rows: number[] = [];
  for (let i = 0; i < bytes.length; i += 16) rows.push(i);
  const inRange = (o: number) => !!range && o >= range[0] && o < range[0] + range[1];
  return (
    <div className="whitespace-pre text-[11px] leading-[18px]">
      {rows.map((start) => (
        <div key={start} className="flex gap-3">
          <span className="text-gray-600">{start.toString(16).padStart(4, "0")}</span>
          <span>
            {Array.from({ length: 16 }, (_, k) => {
              const o = start + k;
              if (o >= bytes.length) return <span key={k}>{"   "}</span>;
              return (
                <button key={k} onClick={() => onByteClick(o)} className={`${inRange(o) ? "bg-blue-700 text-white" : range ? "text-gray-700" : "text-gray-1000"} ${k === 8 ? "ml-2" : ""}`}>
                  {bytes[o].toString(16).padStart(2, "0")}{" "}
                </button>
              );
            })}
          </span>
          <span>
            {Array.from({ length: 16 }, (_, k) => {
              const o = start + k;
              if (o >= bytes.length) return null;
              const ch = bytes[o] >= 0x20 && bytes[o] < 0x7f ? String.fromCharCode(bytes[o]) : "·";
              return (
                <button key={k} onClick={() => onByteClick(o)} className={inRange(o) ? "bg-blue-700 text-white" : range ? "text-gray-700" : "text-gray-900"}>
                  {ch}
                </button>
              );
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

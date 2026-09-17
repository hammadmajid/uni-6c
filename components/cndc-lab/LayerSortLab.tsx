"use client";

import { useEffect, useRef, useState } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey } from "@/components/learning/LessonContext";
import { Button, Feedback } from "@/components/learning/ui";

type Layer = "Application" | "Transport" | "Network" | "Link";
const LAYERS: Layer[] = ["Application", "Transport", "Network", "Link"];

interface Proto {
  name: string;
  layer: Layer;
  /** What it was doing in the capture, and why it sits where it sits. */
  note: string;
  /** Shown when placed wrongly. */
  trap?: string;
}

const PROTOS: Proto[] = [
  { name: "HTTP", layer: "Application", note: "The GET and the 200 OK. Carried inside TCP." },
  { name: "DNS", layer: "Application", note: "Name to address, before the browser could open a TCP connection. Carried in UDP.", trap: "DNS runs over UDP port 53 and is used by applications; being 'infrastructure' does not move it down the stack." },
  { name: "TLS", layer: "Application", note: "The encrypted traffic from another tab. In the five-layer model it lives in the application layer (OSI would say presentation).", trap: "TLS sits on top of TCP, not beside it. It is not a transport protocol." },
  { name: "mDNS", layer: "Application", note: "Multicast DNS: your laptop asking the LAN for Chromecasts. UDP port 5353." },
  { name: "SSDP", layer: "Application", note: "Simple Service Discovery Protocol, the TV announcing itself. HTTP-shaped text over UDP 1900." },
  { name: "NTP", layer: "Application", note: "Clock sync. UDP port 123." },
  { name: "DHCP", layer: "Application", note: "How your laptop got 192.168.1.7 in the first place. UDP 67/68. Not in this capture because the lease was already held.", trap: "DHCP hands out IP addresses, but it is itself an application-layer protocol running over UDP." },
  { name: "TCP", layer: "Transport", note: "Ports 51834 and 80, sequence numbers, the handshake, the FIN." },
  { name: "UDP", layer: "Transport", note: "Ports for DNS, mDNS, SSDP, NTP. No handshake, no sequence numbers." },
  { name: "IPv4", layer: "Network", note: "Source and destination addresses, TTL, the thing routers look at." },
  { name: "IPv6", layer: "Network", note: "Same job, 128-bit addresses. Your machine asked for an AAAA record and got none, so it stayed on IPv4 for gaia." },
  { name: "ICMP", layer: "Network", note: "ping and traceroute messages. Carried inside IP, but part of the network layer, not above it.", trap: "ICMP is encapsulated in IP like TCP is, but it exists to report on IP itself. Kurose files it with the network layer." },
  { name: "ARP", layer: "Link", note: "Who has 192.168.1.1? Maps an IP address to a MAC address on the local link. Kurose treats it as a link-layer protocol.", trap: "ARP carries IP addresses but never leaves the local link and has no IP header. The textbook puts it at the link layer; some texts say it straddles link and network. In the assignment, write Link and note the ambiguity." },
  { name: "Ethernet II", layer: "Link", note: "The 14-byte header with MAC addresses on every frame in the capture." },
  { name: "IEEE 802.11", layer: "Link", note: "Wi-Fi. On wlp0s20f3 the capture shows Ethernet-style frames because the driver translates; a monitor-mode capture would show 802.11 headers." },
];

export function LayerSortLab({ id = "layer-sort" }: { id?: string }) {
  const key = useActivityKey(id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const ready = useProgressStore((s) => s.hydrated && s.sync !== "checking");
  const saved = useProgressStore((s) => s.activities[key]);

  const [placed, setPlaced] = useState<Record<string, Layer>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const seeded = useRef(false);

  useEffect(() => {
    if (!ready || seeded.current) return;
    seeded.current = true;
    if (!saved || saved.attempts === 0 || !saved.lastAnswer) return;
    try {
      const parsed = JSON.parse(saved.lastAnswer) as Record<string, Layer>;
      setPlaced(parsed);
      setAttempts(saved.attempts);
      setChecked(true);
    } catch {
      /* ignore */
    }
  }, [ready, saved]);

  const unplaced = PROTOS.filter((p) => !placed[p.name]);
  const allPlaced = unplaced.length === 0;
  const wrong = PROTOS.filter((p) => placed[p.name] && placed[p.name] !== p.layer);
  const allCorrect = checked && allPlaced && wrong.length === 0;

  function place(layer: Layer) {
    if (!picked) return;
    setPlaced((m) => ({ ...m, [picked]: layer }));
    setPicked(null);
    setChecked(false);
  }
  function unplace(name: string) {
    if (allCorrect) return;
    setPlaced((m) => {
      const n = { ...m };
      delete n[name];
      return n;
    });
    setChecked(false);
  }
  function check() {
    setChecked(true);
    setAttempts((a) => a + 1);
    recordAttempt(key, allPlaced && wrong.length === 0, JSON.stringify(placed));
  }

  const chipCls = (p: Proto) => {
    const isPicked = picked === p.name;
    if (checked && placed[p.name]) return placed[p.name] === p.layer ? "border-green-700/60 bg-green-700/10 text-green-600" : "border-red-700/60 bg-red-700/10 text-red-600";
    return isPicked ? "border-blue-700 bg-blue-700/15 text-blue-600" : "border-gray-500 text-gray-1000 hover:border-gray-700";
  };

  return (
    <div className="my-6 rounded-lg border border-gray-400 bg-background-200 p-5">
      <p className="text-label-12 mb-2 text-blue-600">Assignment 1 · sort the protocols by layer</p>
      <p className="text-copy-16 font-medium text-gray-1000">Every protocol below appeared in a browsing capture. Put each one at the layer it belongs to in the five-layer Internet stack.</p>
      <p className="text-copy-13 mt-1 text-gray-700">Tap a protocol, then tap a layer. Tap a placed protocol to send it back. Physical has no protocols in a capture, so it is not a target.</p>

      <div className="mt-4 rounded-md border border-dashed border-gray-500 p-3">
        <p className="text-label-12 mb-2 text-gray-600">Unsorted · {unplaced.length}</p>
        <div className="flex flex-wrap gap-1.5">
          {unplaced.map((p) => (
            <button key={p.name} onClick={() => setPicked(picked === p.name ? null : p.name)} className={`text-label-12-mono rounded-md border px-2.5 py-1 transition-colors ${chipCls(p)}`}>
              {p.name}
            </button>
          ))}
          {unplaced.length === 0 && <span className="text-copy-13 text-gray-600">All placed.</span>}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {LAYERS.map((layer, i) => (
          <button
            key={layer}
            onClick={() => place(layer)}
            disabled={!picked}
            className={`min-h-[76px] rounded-md border p-3 text-left transition-colors ${picked ? "cursor-pointer border-blue-700/60 hover:bg-blue-700/10" : "border-gray-400"} disabled:cursor-default`}
          >
            <span className="text-label-12 flex items-center gap-2 text-gray-1000">
              <span className="text-label-12-mono text-gray-600">{5 - i}</span>
              {layer}
              {picked && <span className="ml-auto text-[11px] text-blue-600">drop {picked} here</span>}
            </span>
            <span className="mt-2 flex flex-wrap gap-1.5">
              {PROTOS.filter((p) => placed[p.name] === layer).map((p) => (
                <span
                  key={p.name}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    unplace(p.name);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && unplace(p.name)}
                  className={`text-label-12-mono rounded-md border px-2 py-0.5 ${chipCls(p)}`}
                >
                  {p.name}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>

      {!allCorrect && (
        <div className="mt-4 flex items-center gap-3">
          <Button variant="primary" onClick={check} disabled={!allPlaced}>
            Check
          </Button>
          {!allPlaced && <span className="text-label-12 text-gray-600">{unplaced.length} left to place</span>}
          {attempts > 0 && <span className="text-label-12 text-gray-600">{attempts} {attempts === 1 ? "attempt" : "attempts"}</span>}
        </div>
      )}

      {checked && wrong.length > 0 && (
        <Feedback tone="incorrect" title={`${PROTOS.length - wrong.length} of ${PROTOS.length} in the right layer.`}>
          <ul className="list-disc space-y-1 pl-5">
            {wrong.map((p) => (
              <li key={p.name}>
                <span className="font-mono text-gray-1000">{p.name}</span> is not {placed[p.name]}. {p.trap ?? p.note}
              </li>
            ))}
          </ul>
        </Feedback>
      )}

      {allCorrect && (
        <Feedback tone="correct" title={attempts === 1 ? "All fifteen placed correctly, first try." : `All fifteen placed correctly after ${attempts} attempts.`}>
          <p>This is the table Assignment 1 asks for. Copy it, and add the protocols your own capture showed that are not here (QUIC, LLMNR, ICMPv6, NBNS are common).</p>
          <div className="overflow-x-auto">
            <table className="text-copy-13 mt-2 w-full border-collapse">
              <thead>
                <tr className="text-left text-gray-700">
                  <th className="border-b border-gray-400 py-1 pr-3 font-normal normal-case tracking-normal">Layer</th>
                  <th className="border-b border-gray-400 py-1 pr-3 font-normal normal-case tracking-normal">Protocols seen</th>
                  <th className="border-b border-gray-400 py-1 font-normal normal-case tracking-normal">What they were doing</th>
                </tr>
              </thead>
              <tbody>
                {LAYERS.map((layer) => (
                  <tr key={layer} className="align-top">
                    <td className="border-b border-gray-400/60 py-1.5 pr-3 text-gray-1000">{layer}</td>
                    <td className="border-b border-gray-400/60 py-1.5 pr-3 font-mono text-gray-1000">{PROTOS.filter((p) => p.layer === layer).map((p) => p.name).join(", ")}</td>
                    <td className="border-b border-gray-400/60 py-1.5 text-gray-800">
                      {PROTOS.filter((p) => p.layer === layer)
                        .map((p) => p.note.split(".")[0])
                        .join(". ")}
                      .
                    </td>
                  </tr>
                ))}
                <tr className="align-top">
                  <td className="py-1.5 pr-3 text-gray-1000">Physical</td>
                  <td className="py-1.5 pr-3 font-mono text-gray-600">—</td>
                  <td className="py-1.5 text-gray-800">Wireshark captures frames from the driver, above the physical layer. Nothing to list; say so in the report rather than leaving it blank.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Feedback>
      )}
    </div>
  );
}

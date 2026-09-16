"use client";

import { useState } from "react";
import { SegmentRow } from "@/components/learning/Controls";

interface Layer {
  id: string;
  name: string;
  pdu: string;
  adds: string;
  examples: string;
  job: string;
  devices: string;
}

const INTERNET: Layer[] = [
  { id: "app", name: "Application", pdu: "message", adds: "application headers (e.g. HTTP request line, DNS query)", examples: "HTTP, SMTP, FTP, DNS, SSH", job: "The thing you actually wanted: a web page, an email, a name lookup.", devices: "hosts only" },
  { id: "tra", name: "Transport", pdu: "segment", adds: "source/destination ports, sequence numbers, checksum", examples: "TCP, UDP", job: "Process-to-process delivery. Multiplexing by port; TCP adds reliability and congestion control.", devices: "hosts only" },
  { id: "net", name: "Network", pdu: "datagram", adds: "source/destination IP addresses, TTL", examples: "IP, ICMP, routing protocols (OSPF, BGP)", job: "Host-to-host delivery across many networks. Routers forward on the destination IP.", devices: "hosts and routers" },
  { id: "lnk", name: "Link", pdu: "frame", adds: "MAC addresses, frame check sequence (trailer)", examples: "Ethernet, Wi-Fi (802.11), PPP", job: "Move a frame across one physical link to the next node. Error detection, medium access.", devices: "hosts, routers, switches" },
  { id: "phy", name: "Physical", pdu: "bit", adds: "nothing logical: voltages, light pulses, radio symbols", examples: "1000BASE-T, 802.11ax PHY, OTN", job: "Turn bits into signals on a specific medium and back.", devices: "everything, including hubs and repeaters" },
];

const OSI: Layer[] = [
  INTERNET[0],
  { id: "pre", name: "Presentation", pdu: "message", adds: "encoding, compression, encryption framing", examples: "TLS (arguably), MIME, ASN.1", job: "Agree on how data is represented so both ends interpret bytes the same way.", devices: "hosts only" },
  { id: "ses", name: "Session", pdu: "message", adds: "session tokens, checkpoints", examples: "RPC session handling, NetBIOS", job: "Open, checkpoint, and recover dialogues between applications.", devices: "hosts only" },
  ...INTERNET.slice(1),
];

const DEVICES: { name: string; top: number; note: string }[] = [
  { name: "Host", top: 5, note: "Runs the full stack. Your laptop, a server, your phone." },
  { name: "Router", top: 3, note: "Strips the frame, reads the IP header, picks the next hop, builds a new frame. Never looks at ports or payload." },
  { name: "Switch", top: 2, note: "Reads MAC addresses in the frame and forwards within one LAN. Blind to IP." },
  { name: "Hub / repeater", top: 1, note: "Regenerates signals. Has no idea what a frame is." },
];

export function EncapsulationExplorer() {
  const [model, setModel] = useState<"internet" | "osi">("internet");
  const [active, setActive] = useState<string>("net");
  const layers = model === "internet" ? INTERNET : OSI;
  const cur = layers.find((l) => l.id === active) ?? layers[0];
  const activeIndex = layers.findIndex((l) => l.id === cur.id);
  const nesting = INTERNET.slice(0, 4); // physical has no header

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-400 bg-background-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-400 px-4 py-3">
        <p className="text-label-14 text-gray-1000">
          <span className="text-gray-600">Explorer · </span>Layers, PDUs, and who implements what
        </p>
        <div className="w-48">
          <SegmentRow
            label=""
            value={model}
            options={[
              { value: "internet", label: "TCP/IP (5)" },
              { value: "osi", label: "OSI (7)" },
            ]}
            onChange={setModel}
          />
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[200px_1fr]">
        <ol className="space-y-1">
          {layers.map((l, i) => (
            <li key={l.id}>
              <button
                onClick={() => setActive(l.id)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${
                  l.id === cur.id ? "border-blue-700 bg-blue-700/10 text-blue-600" : "border-gray-500 text-gray-900 hover:border-gray-700"
                }`}
              >
                <span className="text-label-14">
                  <span className="text-label-12-mono mr-2 text-gray-600">{layers.length - i}</span>
                  {l.name}
                </span>
                <span className="text-label-12-mono text-gray-600">{l.pdu}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="min-w-0 space-y-4">
          <div className="rounded-md border border-gray-400 bg-background-100 p-4">
            <p className="text-label-12 text-blue-600">{cur.name} layer</p>
            <p className="text-copy-14 mt-1 text-gray-1000">{cur.job}</p>
            <dl className="text-copy-13 mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-[110px_1fr]">
              <dt className="text-gray-600">PDU name</dt>
              <dd className="font-mono text-gray-1000">{cur.pdu}</dd>
              <dt className="text-gray-600">Header adds</dt>
              <dd className="text-gray-900">{cur.adds}</dd>
              <dt className="text-gray-600">Protocols</dt>
              <dd className="text-gray-900">{cur.examples}</dd>
              <dt className="text-gray-600">Implemented on</dt>
              <dd className="text-gray-900">{cur.devices}</dd>
            </dl>
          </div>

          <div>
            <p className="text-label-12 mb-2 text-gray-700">Encapsulation on the sending host (each layer wraps the one above)</p>
            <div className="overflow-x-auto">
              <div className="flex min-w-[520px] items-stretch font-mono text-[11px]">
                {nesting
                  .slice()
                  .reverse()
                  .map((l) => {
                    const isActive = l.id === cur.id || (model === "osi" && (cur.id === "pre" || cur.id === "ses") && l.id === "app");
                    return (
                      <div key={l.id} className={`flex items-center border px-2 py-2 ${isActive ? "border-blue-700 bg-blue-700/15 text-blue-600" : "border-gray-500 text-gray-800"}`}>
                        {l.pdu === "frame" ? "Eth hdr" : l.pdu === "datagram" ? "IP hdr" : l.pdu === "segment" ? "TCP hdr" : "HTTP"}
                      </div>
                    );
                  })}
                <div className="flex flex-1 items-center border border-gray-500 bg-gray-100 px-3 py-2 text-gray-1000">payload (your data)</div>
                <div className={`flex items-center border px-2 py-2 ${cur.id === "lnk" ? "border-blue-700 bg-blue-700/15 text-blue-600" : "border-gray-500 text-gray-800"}`}>FCS</div>
              </div>
            </div>
            <p className="text-copy-13 mt-2 text-gray-600">
              Message → segment → datagram → frame → bits. The receiving host peels them off in reverse. Only the link layer adds a trailer.
            </p>
          </div>

          <div>
            <p className="text-label-12 mb-2 text-gray-700">How far up the stack each device looks</p>
            <div className="grid grid-cols-4 gap-2">
              {DEVICES.map((d) => (
                <div key={d.name} className="rounded-md border border-gray-400 bg-background-100 p-2">
                  <p className="text-label-12 mb-1.5 text-gray-1000">{d.name}</p>
                  <div className="flex flex-col-reverse gap-0.5">
                    {INTERNET.slice()
                      .reverse()
                      .map((l, i) => {
                        const on = i < d.top;
                        const highlight = on && (INTERNET.length - 1 - i === activeIndex || (model === "osi" && l.id === "app" && activeIndex <= 2));
                        return (
                          <div
                            key={l.id}
                            title={l.name}
                            className={`h-3 rounded-sm ${highlight ? "bg-blue-700" : on ? "bg-gray-600" : "bg-gray-300"}`}
                          />
                        );
                      })}
                  </div>
                  <p className="text-[11px] leading-4 mt-1.5 text-gray-600">{d.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

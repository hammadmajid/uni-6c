/**
 * A synthetic but byte-accurate capture of the Lab 01 exercise: a laptop on a home LAN fetching
 * http://gaia.cs.umass.edu/wireshark-labs/INTRO-wireshark-file1.html, with the usual background noise
 * (ARP, mDNS, SSDP, NTP, another tab's TLS). Every frame is assembled byte by byte, with real checksums,
 * so the bytes pane, the details tree and the packet list are all views of the same data.
 *
 * Addresses: laptop 192.168.1.7 (private, behind NAT), router 192.168.1.1 (also the DNS forwarder),
 * gaia.cs.umass.edu 128.119.245.12 (real). Server headers copied from a real fetch on 2026-09-17.
 */

export interface Node {
  label: string;
  /** [offset, length] of the bytes this node covers. */
  range?: [number, number];
  children?: Node[];
}

export type FieldValue = string | number | boolean;

export interface Packet {
  no: number;
  /** Seconds since the start of the capture. */
  time: number;
  src: string;
  dst: string;
  proto: string;
  info: string;
  bytes: Uint8Array;
  tree: Node[];
  /** Lower-case protocol names present, outermost first, as Wireshark's frame.protocols. */
  layers: string[];
  /** Field values for the display-filter engine. Multi-valued fields (ip.addr) hold both. */
  fields: Record<string, FieldValue[]>;
}

/* ---------- byte writer ---------- */

class Writer {
  buf: number[] = [];
  get pos() {
    return this.buf.length;
  }
  u8(v: number) {
    this.buf.push(v & 0xff);
  }
  u16(v: number) {
    this.u8(v >> 8);
    this.u8(v);
  }
  u32(v: number) {
    this.u16(v >>> 16);
    this.u16(v & 0xffff);
  }
  raw(b: number[]) {
    for (const x of b) this.u8(x);
  }
  ascii(s: string) {
    for (let i = 0; i < s.length; i++) this.u8(s.charCodeAt(i));
  }
  patch16(at: number, v: number) {
    this.buf[at] = (v >> 8) & 0xff;
    this.buf[at + 1] = v & 0xff;
  }
}

function mac(s: string) {
  return s.split(":").map((h) => parseInt(h, 16));
}
function ip4(s: string) {
  return s.split(".").map(Number);
}
function checksum(bytes: number[]): number {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 2) sum += (bytes[i] << 8) + (bytes[i + 1] ?? 0);
  while (sum >> 16) sum = (sum & 0xffff) + (sum >> 16);
  return ~sum & 0xffff;
}
const hex = (n: number, w = 4) => "0x" + n.toString(16).padStart(w, "0");

/* ---------- hosts ---------- */

export const HOSTS = {
  laptop: { ip: "192.168.1.7", mac: "3c:e9:f7:2b:41:9a", vendor: "Intel" },
  router: { ip: "192.168.1.1", mac: "c8:3a:35:19:0e:d4", vendor: "Tenda" },
  tv: { ip: "192.168.1.23", mac: "7c:2e:bd:5f:a0:11", vendor: "Google" },
  gaia: { ip: "128.119.245.12", name: "gaia.cs.umass.edu" },
  google: { ip: "142.250.185.78" },
  ntp: { ip: "162.159.200.1" },
};
const MAC_BCAST = "ff:ff:ff:ff:ff:ff";
const MAC_MDNS = "01:00:5e:00:00:fb";
const MAC_SSDP = "01:00:5e:7f:ff:fa";

/* ---------- protocol builders ---------- */

interface Ctx {
  w: Writer;
  tree: Node[];
  layers: string[];
  fields: Record<string, FieldValue[]>;
}
function field(c: Ctx, name: string, v: FieldValue) {
  (c.fields[name] ??= []).push(v);
}

function ethernet(c: Ctx, src: string, dst: string, type: number) {
  const start = c.w.pos;
  c.w.raw(mac(dst));
  c.w.raw(mac(src));
  c.w.u16(type);
  c.layers.push("eth");
  field(c, "eth.src", src);
  field(c, "eth.dst", dst);
  field(c, "eth.addr", src);
  field(c, "eth.addr", dst);
  field(c, "eth.type", type);
  const typeName = type === 0x0800 ? "IPv4" : type === 0x0806 ? "ARP" : "IPv6";
  c.tree.push({
    label: `Ethernet II, Src: ${src}, Dst: ${dst}`,
    range: [start, 14],
    children: [
      { label: `Destination: ${dst}${dst === MAC_BCAST ? " (Broadcast)" : ""}`, range: [start, 6] },
      { label: `Source: ${src}`, range: [start + 6, 6] },
      { label: `Type: ${typeName} (${hex(type)})`, range: [start + 12, 2] },
    ],
  });
}

function arp(c: Ctx, op: 1 | 2, senderMac: string, senderIp: string, targetMac: string, targetIp: string) {
  const s = c.w.pos;
  c.w.u16(1); // hardware type ethernet
  c.w.u16(0x0800);
  c.w.u8(6);
  c.w.u8(4);
  c.w.u16(op);
  c.w.raw(mac(senderMac));
  c.w.raw(ip4(senderIp));
  c.w.raw(mac(targetMac));
  c.w.raw(ip4(targetIp));
  c.layers.push("arp");
  field(c, "arp.opcode", op);
  field(c, "arp.src.proto_ipv4", senderIp);
  field(c, "arp.dst.proto_ipv4", targetIp);
  c.tree.push({
    label: `Address Resolution Protocol (${op === 1 ? "request" : "reply"})`,
    range: [s, 28],
    children: [
      { label: "Hardware type: Ethernet (1)", range: [s, 2] },
      { label: "Protocol type: IPv4 (0x0800)", range: [s + 2, 2] },
      { label: "Hardware size: 6", range: [s + 4, 1] },
      { label: "Protocol size: 4", range: [s + 5, 1] },
      { label: `Opcode: ${op === 1 ? "request" : "reply"} (${op})`, range: [s + 6, 2] },
      { label: `Sender MAC address: ${senderMac}`, range: [s + 8, 6] },
      { label: `Sender IP address: ${senderIp}`, range: [s + 14, 4] },
      { label: `Target MAC address: ${targetMac}`, range: [s + 20, 6] },
      { label: `Target IP address: ${targetIp}`, range: [s + 26, 4] },
    ],
  });
}

interface IpOpts {
  src: string;
  dst: string;
  proto: 6 | 17;
  ttl: number;
  id: number;
  df?: boolean;
}
/** Writes the IPv4 header; returns a finaliser to call after the payload is written. */
function ipv4(c: Ctx, o: IpOpts) {
  const s = c.w.pos;
  c.w.u8(0x45);
  c.w.u8(0);
  c.w.u16(0); // total length, patched
  c.w.u16(o.id);
  c.w.u16(o.df === false ? 0x0000 : 0x4000);
  c.w.u8(o.ttl);
  c.w.u8(o.proto);
  c.w.u16(0); // checksum, patched
  c.w.raw(ip4(o.src));
  c.w.raw(ip4(o.dst));
  c.layers.push("ip");
  field(c, "ip.src", o.src);
  field(c, "ip.dst", o.dst);
  field(c, "ip.addr", o.src);
  field(c, "ip.addr", o.dst);
  field(c, "ip.ttl", o.ttl);
  field(c, "ip.proto", o.proto);
  field(c, "ip.id", o.id);
  const node: Node = { label: "", range: [s, 20], children: [] };
  c.tree.push(node);
  return () => {
    const total = c.w.pos - s;
    c.w.patch16(s + 2, total);
    c.w.patch16(s + 10, checksum(c.w.buf.slice(s, s + 20)));
    const ck = (c.w.buf[s + 10] << 8) | c.w.buf[s + 11];
    field(c, "ip.len", total);
    node.label = `Internet Protocol Version 4, Src: ${o.src}, Dst: ${o.dst}`;
    node.children = [
      { label: "0100 .... = Version: 4", range: [s, 1] },
      { label: ".... 0101 = Header Length: 20 bytes (5)", range: [s, 1] },
      { label: "Differentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)", range: [s + 1, 1] },
      { label: `Total Length: ${total}`, range: [s + 2, 2] },
      { label: `Identification: ${hex(o.id)} (${o.id})`, range: [s + 4, 2] },
      { label: `${o.df === false ? "000." : "010."} .... = Flags: ${o.df === false ? "0x0" : "0x2, Don't fragment"}`, range: [s + 6, 1] },
      { label: "...0 0000 0000 0000 = Fragment Offset: 0", range: [s + 6, 2] },
      { label: `Time to Live: ${o.ttl}`, range: [s + 8, 1] },
      { label: `Protocol: ${o.proto === 6 ? "TCP (6)" : "UDP (17)"}`, range: [s + 9, 1] },
      { label: `Header Checksum: ${hex(ck)} [validation disabled]`, range: [s + 10, 2] },
      { label: `Source Address: ${o.src}`, range: [s + 12, 4] },
      { label: `Destination Address: ${o.dst}`, range: [s + 16, 4] },
    ];
  };
}

function pseudoHeaderSum(src: string, dst: string, proto: number, len: number, seg: number[]) {
  const ph = [...ip4(src), ...ip4(dst), 0, proto, len >> 8, len & 0xff, ...seg];
  return checksum(ph);
}

interface TcpOpts {
  sport: number;
  dport: number;
  seq: number;
  ack: number;
  flags: { syn?: boolean; ack?: boolean; fin?: boolean; psh?: boolean };
  win: number;
  /** relative seq/ack, shown in brackets like Wireshark */
  relSeq: number;
  relAck: number;
  mss?: number;
  ts: [number, number];
  wscale?: number;
  sackOk?: boolean;
}
function tcp(c: Ctx, ipSrc: string, ipDst: string, o: TcpOpts) {
  const s = c.w.pos;
  const f = o.flags;
  const flagsVal = (f.fin ? 1 : 0) | (f.syn ? 2 : 0) | (f.psh ? 8 : 0) | (f.ack ? 16 : 0);
  const opts: number[] = [];
  if (o.mss) opts.push(2, 4, o.mss >> 8, o.mss & 0xff);
  if (o.sackOk) opts.push(4, 2);
  opts.push(8, 10, ...[o.ts[0] >>> 24, o.ts[0] >>> 16, o.ts[0] >>> 8, o.ts[0]].map((x) => x & 0xff), ...[o.ts[1] >>> 24, o.ts[1] >>> 16, o.ts[1] >>> 8, o.ts[1]].map((x) => x & 0xff));
  if (o.wscale !== undefined) opts.push(1, 3, 3, o.wscale);
  while (opts.length % 4) opts.push(1);
  const hlen = 20 + opts.length;
  c.w.u16(o.sport);
  c.w.u16(o.dport);
  c.w.u32(o.seq);
  c.w.u32(o.ack);
  c.w.u8((hlen / 4) << 4);
  c.w.u8(flagsVal);
  c.w.u16(o.win);
  c.w.u16(0); // checksum, patched
  c.w.u16(0);
  c.w.raw(opts);
  c.layers.push("tcp");
  field(c, "tcp.srcport", o.sport);
  field(c, "tcp.dstport", o.dport);
  field(c, "tcp.port", o.sport);
  field(c, "tcp.port", o.dport);
  field(c, "tcp.seq", o.relSeq);
  field(c, "tcp.ack", o.relAck);
  field(c, "tcp.flags.syn", f.syn ? 1 : 0);
  field(c, "tcp.flags.ack", f.ack ? 1 : 0);
  field(c, "tcp.flags.fin", f.fin ? 1 : 0);
  field(c, "tcp.flags.push", f.psh ? 1 : 0);
  field(c, "tcp.window_size_value", o.win);
  field(c, "tcp.hdr_len", hlen);
  const node: Node = { label: "", range: [s, hlen], children: [] };
  c.tree.push(node);
  const flagNames = [f.fin && "FIN", f.syn && "SYN", f.psh && "PSH", f.ack && "ACK"].filter(Boolean).join(", ");
  return () => {
    const len = c.w.pos - s - hlen;
    const seg = c.w.buf.slice(s);
    c.w.patch16(s + 16, pseudoHeaderSum(ipSrc, ipDst, 6, seg.length, seg));
    const ck = (c.w.buf[s + 16] << 8) | c.w.buf[s + 17];
    field(c, "tcp.len", len);
    const optNodes: Node[] = [];
    let p = s + 20;
    if (o.mss) {
      optNodes.push({ label: `TCP Option - Maximum segment size: ${o.mss} bytes`, range: [p, 4] });
      p += 4;
    }
    if (o.sackOk) {
      optNodes.push({ label: "TCP Option - SACK permitted", range: [p, 2] });
      p += 2;
    }
    optNodes.push({ label: `TCP Option - Timestamps: TSval ${o.ts[0]}, TSecr ${o.ts[1]}`, range: [p, 10] });
    p += 10;
    if (o.wscale !== undefined) {
      optNodes.push({ label: "TCP Option - No-Operation (NOP)", range: [p, 1] });
      optNodes.push({ label: `TCP Option - Window scale: ${o.wscale} (multiply by ${2 ** o.wscale})`, range: [p + 1, 3] });
      p += 4;
    }
    while (p < s + hlen) {
      optNodes.push({ label: "TCP Option - No-Operation (NOP)", range: [p, 1] });
      p += 1;
    }
    node.label = `Transmission Control Protocol, Src Port: ${o.sport}, Dst Port: ${o.dport}, Seq: ${o.relSeq}${f.ack ? `, Ack: ${o.relAck}` : ""}, Len: ${len}`;
    node.children = [
      { label: `Source Port: ${o.sport}`, range: [s, 2] },
      { label: `Destination Port: ${o.dport}`, range: [s + 2, 2] },
      { label: `Sequence Number: ${o.relSeq}    (relative sequence number)`, range: [s + 4, 4] },
      { label: `Sequence Number (raw): ${o.seq >>> 0}`, range: [s + 4, 4] },
      { label: `Acknowledgment Number: ${o.relAck}    (relative ack number)`, range: [s + 8, 4] },
      { label: `${((hlen / 4) >>> 0).toString(2).padStart(4, "0")} .... = Header Length: ${hlen} bytes (${hlen / 4})`, range: [s + 12, 1] },
      { label: `Flags: ${hex(flagsVal, 3)} (${flagNames})`, range: [s + 12, 2] },
      { label: `Window: ${o.win}`, range: [s + 14, 2] },
      { label: `Checksum: ${hex(ck)} [unverified]`, range: [s + 16, 2] },
      { label: "Urgent Pointer: 0", range: [s + 18, 2] },
      { label: `Options: (${opts.length} bytes)`, range: [s + 20, opts.length], children: optNodes },
      { label: `[TCP Segment Len: ${len}]` },
    ];
  };
}

function udp(c: Ctx, ipSrc: string, ipDst: string, sport: number, dport: number) {
  const s = c.w.pos;
  c.w.u16(sport);
  c.w.u16(dport);
  c.w.u16(0);
  c.w.u16(0);
  c.layers.push("udp");
  field(c, "udp.srcport", sport);
  field(c, "udp.dstport", dport);
  field(c, "udp.port", sport);
  field(c, "udp.port", dport);
  const node: Node = { label: "", range: [s, 8], children: [] };
  c.tree.push(node);
  return () => {
    const len = c.w.pos - s;
    c.w.patch16(s + 4, len);
    const seg = c.w.buf.slice(s);
    c.w.patch16(s + 6, pseudoHeaderSum(ipSrc, ipDst, 17, seg.length, seg));
    const ck = (c.w.buf[s + 6] << 8) | c.w.buf[s + 7];
    field(c, "udp.length", len);
    node.label = `User Datagram Protocol, Src Port: ${sport}, Dst Port: ${dport}`;
    node.children = [
      { label: `Source Port: ${sport}`, range: [s, 2] },
      { label: `Destination Port: ${dport}`, range: [s + 2, 2] },
      { label: `Length: ${len}`, range: [s + 4, 2] },
      { label: `Checksum: ${hex(ck)} [unverified]`, range: [s + 6, 2] },
      { label: `UDP payload (${len - 8} bytes)`, range: [s + 8, len - 8] },
    ];
  };
}

function dnsName(w: Writer, name: string) {
  for (const label of name.split(".")) {
    w.u8(label.length);
    w.ascii(label);
  }
  w.u8(0);
}
interface DnsOpts {
  id: number;
  response: boolean;
  name: string;
  qtype: "A" | "AAAA" | "PTR";
  answer?: string; // A record answer
  soa?: boolean; // AAAA with no answer: authority SOA
  layer?: "dns" | "mdns";
}
function dns(c: Ctx, o: DnsOpts) {
  const s = c.w.pos;
  const w = c.w;
  const flags = o.response ? 0x8180 : 0x0100;
  w.u16(o.layer === "mdns" ? 0 : o.id);
  w.u16(o.layer === "mdns" ? 0 : flags);
  w.u16(1);
  w.u16(o.answer ? 1 : 0);
  w.u16(o.soa ? 1 : 0);
  w.u16(0);
  const qs = w.pos;
  dnsName(w, o.name);
  const qtypeNum = o.qtype === "A" ? 1 : o.qtype === "AAAA" ? 28 : 12;
  w.u16(qtypeNum);
  w.u16(1);
  const qLen = w.pos - qs;
  let ansNode: Node | undefined;
  if (o.answer) {
    const as = w.pos;
    w.u16(0xc00c);
    w.u16(1);
    w.u16(1);
    w.u32(1800);
    w.u16(4);
    w.raw(ip4(o.answer));
    ansNode = {
      label: `Answers`,
      range: [as, w.pos - as],
      children: [
        {
          label: `${o.name}: type A, class IN, addr ${o.answer}`,
          range: [as, w.pos - as],
          children: [
            { label: `Name: ${o.name}`, range: [as, 2] },
            { label: "Type: A (1) (Host Address)", range: [as + 2, 2] },
            { label: "Class: IN (0x0001)", range: [as + 4, 2] },
            { label: "Time to live: 1800 (30 minutes)", range: [as + 6, 4] },
            { label: "Data length: 4", range: [as + 10, 2] },
            { label: `Address: ${o.answer}`, range: [as + 12, 4] },
          ],
        },
      ],
    };
    field(c, "dns.a", o.answer);
  }
  let authNode: Node | undefined;
  if (o.soa) {
    const as = w.pos;
    w.u16(0xc011); // pointer to "cs.umass.edu" inside the question name (offset 12 + 5)
    w.u16(6);
    w.u16(1);
    w.u32(600);
    const rdStart = w.pos;
    w.u16(0);
    dnsName(w, "ns1.cs.umass.edu");
    dnsName(w, "hostmaster.cs.umass.edu");
    w.u32(2026091701);
    w.u32(3600);
    w.u32(900);
    w.u32(1209600);
    w.u32(600);
    w.patch16(rdStart, w.pos - rdStart - 2);
    authNode = { label: "Authoritative nameservers", range: [as, w.pos - as], children: [{ label: "cs.umass.edu: type SOA, class IN, mname ns1.cs.umass.edu", range: [as, w.pos - as] }] };
  }
  const layer = o.layer ?? "dns";
  c.layers.push(layer);
  field(c, "dns.id", o.id);
  field(c, "dns.flags.response", o.response ? 1 : 0);
  field(c, "dns.qry.name", o.name);
  field(c, "dns.qry.type", qtypeNum);
  const kids: Node[] = [
    { label: `Transaction ID: ${hex(o.layer === "mdns" ? 0 : o.id)}`, range: [s, 2] },
    { label: `Flags: ${hex(o.layer === "mdns" ? 0 : flags)} Standard query${o.response ? " response, No error" : ""}`, range: [s + 2, 2] },
    { label: "Questions: 1", range: [s + 4, 2] },
    { label: `Answer RRs: ${o.answer ? 1 : 0}`, range: [s + 6, 2] },
    { label: `Authority RRs: ${o.soa ? 1 : 0}`, range: [s + 8, 2] },
    { label: "Additional RRs: 0", range: [s + 10, 2] },
    {
      label: "Queries",
      range: [qs, qLen],
      children: [
        {
          label: `${o.name}: type ${o.qtype}, class IN`,
          range: [qs, qLen],
          children: [
            { label: `Name: ${o.name}`, range: [qs, qLen - 4] },
            { label: `[Name Length: ${o.name.length}]` },
            { label: `Type: ${o.qtype} (${qtypeNum})`, range: [qs + qLen - 4, 2] },
            { label: "Class: IN (0x0001)", range: [qs + qLen - 2, 2] },
          ],
        },
      ],
    },
  ];
  if (ansNode) kids.push(ansNode);
  if (authNode) kids.push(authNode);
  c.tree.push({
    label: `${layer === "mdns" ? "Multicast Domain Name System" : "Domain Name System"} (${o.response ? "response" : "query"})`,
    range: [s, w.pos - s],
    children: kids,
  });
}

function httpText(c: Ctx, text: string, kind: "request" | "response", extra: Record<string, FieldValue>) {
  const s = c.w.pos;
  c.w.ascii(text);
  c.layers.push("http");
  const lines = text.split("\r\n");
  const headerEnd = lines.indexOf("");
  const headerLines = lines.slice(0, headerEnd);
  const body = lines.slice(headerEnd + 1).join("\r\n");
  field(c, kind === "request" ? "http.request" : "http.response", 1);
  for (const [k, v] of Object.entries(extra)) field(c, k, v);
  for (const h of headerLines.slice(1)) {
    const i = h.indexOf(":");
    const name = h.slice(0, i).toLowerCase().replace(/-/g, "_");
    field(c, `http.${name}`, h.slice(i + 1).trim());
  }
  const kids: Node[] = [];
  let p = s;
  for (const line of headerLines) {
    kids.push({ label: line, range: [p, line.length + 2] });
    p += line.length + 2;
  }
  kids.push({ label: "\\r\\n", range: [p, 2] });
  p += 2;
  if (body.length) {
    kids.push({ label: `File Data: ${body.length} bytes`, range: [p, body.length] });
    c.layers.push("data-text-lines");
    c.tree.push({ label: "Hypertext Transfer Protocol", range: [s, text.length], children: kids });
    c.tree.push({ label: `Line-based text data: text/html (${body.split("\n").length - 1} lines)`, range: [p, body.length], children: body.split("\n").filter(Boolean).map((l) => ({ label: l.replace(/\r$/, "") + "\\n" })) });
  } else {
    c.tree.push({ label: "Hypertext Transfer Protocol", range: [s, text.length], children: kids });
  }
}

/* ---------- frame assembly ---------- */

interface Spec {
  time: number;
  src: string;
  dst: string;
  proto: string;
  info: string;
  build: (c: Ctx) => void;
}

function frame(no: number, spec: Spec): Packet {
  const c: Ctx = { w: new Writer(), tree: [], layers: [], fields: {} };
  spec.build(c);
  const len = c.w.pos;
  const fields = c.fields;
  fields["frame.number"] = [no];
  fields["frame.len"] = [len];
  fields["frame.time_relative"] = [spec.time];
  fields["frame.protocols"] = [c.layers.join(":")];
  const frameNode: Node = {
    label: `Frame ${no}: ${len} bytes on wire (${len * 8} bits), ${len} bytes captured (${len * 8} bits) on interface wlp0s20f3, id 0`,
    range: [0, len],
    children: [
      { label: "Interface id: 0 (wlp0s20f3)" },
      { label: "Encapsulation type: Ethernet (1)" },
      { label: `Arrival Time: ${timeOfDay(spec.time)} PKT` },
      { label: `Epoch Arrival Time: ${(EPOCH + spec.time).toFixed(6)}` },
      { label: `[Time since reference or first frame: ${spec.time.toFixed(9)} seconds]` },
      { label: `Frame Number: ${no}` },
      { label: `Frame Length: ${len} bytes (${len * 8} bits)` },
      { label: `Capture Length: ${len} bytes (${len * 8} bits)` },
      { label: `[Protocols in frame: ${c.layers.join(":")}]` },
    ],
  };
  return {
    no,
    time: spec.time,
    src: spec.src,
    dst: spec.dst,
    proto: spec.proto,
    info: spec.info,
    bytes: Uint8Array.from(c.w.buf),
    tree: [frameNode, ...c.tree],
    layers: c.layers,
    fields,
  };
}

/** Capture started 2026-09-17 12:56:44.000000 PKT (07:56:44 UTC). */
export const EPOCH = Date.UTC(2026, 8, 17, 7, 56, 44) / 1000;
export function timeOfDay(rel: number, tz: "PKT" | "UTC" = "PKT"): string {
  const ms = (EPOCH + rel) * 1000;
  const d = new Date(ms + (tz === "PKT" ? 5 * 3600 * 1000 : 0));
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  const frac = (rel % 1).toFixed(6).slice(2);
  return `${hh}:${mm}:${ss}.${frac}`;
}

/* ---------- the capture ---------- */

const L = HOSTS.laptop;
const R = HOSTS.router;
const G = HOSTS.gaia;
const CLIENT_PORT = 51834;
const ISN_C = 0x7a3f91c2;
const ISN_S = 0x1de40b77;
const TS_C = 3049823411;
const TS_S = 1187226054;

export const GET_TEXT =
  "GET /wireshark-labs/INTRO-wireshark-file1.html HTTP/1.1\r\n" +
  "Host: gaia.cs.umass.edu\r\n" +
  "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0\r\n" +
  "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n" +
  "Accept-Language: en-US,en;q=0.5\r\n" +
  "Accept-Encoding: gzip, deflate\r\n" +
  "Connection: keep-alive\r\n" +
  "Upgrade-Insecure-Requests: 1\r\n" +
  "\r\n";

export const OK_BODY = "<html>\nCongratulations!  You've downloaded the first Wireshark lab file!\n</html>\n";
export const OK_TEXT =
  "HTTP/1.1 200 OK\r\n" +
  "Date: Thu, 17 Sep 2026 07:56:46 GMT\r\n" +
  "Server: Apache/2.4.62 (AlmaLinux) OpenSSL/3.5.5 mod_fcgid/2.3.9 mod_perl/2.0.12 Perl/v5.32.1\r\n" +
  "Last-Modified: Tue, 28 Oct 2025 05:59:01 GMT\r\n" +
  'ETag: "51-64231b6715777"\r\n' +
  "Accept-Ranges: bytes\r\n" +
  `Content-Length: ${OK_BODY.length}\r\n` +
  "Keep-Alive: timeout=5, max=100\r\n" +
  "Connection: Keep-Alive\r\n" +
  "Content-Type: text/html; charset=UTF-8\r\n" +
  "\r\n" +
  OK_BODY;

export const T_GET = 2.372105;
export const T_OK = 2.594893;

/** Deterministic pseudo-random bytes for opaque payloads (TLS records). */
function noise(seed: number, n: number): number[] {
  let x = seed >>> 0;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    out.push(x >>> 24);
  }
  return out;
}

function tcpFrame(o: {
  time: number;
  fromClient: boolean;
  seq: number;
  ack: number;
  flags: TcpOpts["flags"];
  win: number;
  relSeq: number;
  relAck: number;
  payload?: (c: Ctx) => void;
  info: string;
  proto?: string;
  id: number;
  syn?: boolean;
  peer?: { ip: string; port: number; ttl: number };
  cport?: number;
}): Spec {
  const peer = o.peer ?? { ip: G.ip, port: 80, ttl: 47 };
  const cport = o.cport ?? CLIENT_PORT;
  const src = o.fromClient ? L.ip : peer.ip;
  const dst = o.fromClient ? peer.ip : L.ip;
  return {
    time: o.time,
    src,
    dst,
    proto: o.proto ?? "TCP",
    info: o.info,
    build: (c) => {
      ethernet(c, o.fromClient ? L.mac : R.mac, o.fromClient ? R.mac : L.mac, 0x0800);
      const endIp = ipv4(c, { src, dst, proto: 6, ttl: o.fromClient ? 64 : peer.ttl, id: o.id });
      const d = Math.round(o.time * 1000);
      const endTcp = tcp(c, src, dst, {
        sport: o.fromClient ? cport : peer.port,
        dport: o.fromClient ? peer.port : cport,
        seq: o.seq,
        ack: o.ack,
        flags: o.flags,
        win: o.win,
        relSeq: o.relSeq,
        relAck: o.relAck,
        mss: o.syn ? 1460 : undefined,
        sackOk: o.syn,
        wscale: o.syn ? 7 : undefined,
        ts: o.fromClient ? [TS_C + d, o.syn ? 0 : TS_S + d - 221] : [TS_S + d, TS_C + d - 221],
      });
      o.payload?.(c);
      endTcp();
      endIp();
    },
  };
}

function udpFrame(o: { time: number; src: { ip: string; mac: string }; dst: { ip: string; mac: string }; sport: number; dport: number; ttl?: number; id: number; proto: string; info: string; payload: (c: Ctx) => void }): Spec {
  return {
    time: o.time,
    src: o.src.ip,
    dst: o.dst.ip,
    proto: o.proto,
    info: o.info,
    build: (c) => {
      ethernet(c, o.src.mac, o.dst.mac, 0x0800);
      const multicast = o.dst.ip.startsWith("2");
      const endIp = ipv4(c, { src: o.src.ip, dst: o.dst.ip, proto: 17, ttl: o.ttl ?? 64, id: o.id, df: !multicast });
      const endUdp = udp(c, o.src.ip, o.dst.ip, o.sport, o.dport);
      o.payload(c);
      endUdp();
      endIp();
    },
  };
}

const SSDP_TEXT = "M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: \"ssdp:discover\"\r\nMX: 1\r\nST: urn:dial-multiscreen-org:service:dial:1\r\nUSER-AGENT: Google Chrome/128.0.0.0 Linux\r\n\r\n";

const SPECS: Spec[] = [
  {
    time: 0,
    src: L.mac,
    dst: "Broadcast",
    proto: "ARP",
    info: `Who has ${R.ip}? Tell ${L.ip}`,
    build: (c) => {
      ethernet(c, L.mac, MAC_BCAST, 0x0806);
      arp(c, 1, L.mac, L.ip, "00:00:00:00:00:00", R.ip);
      c.w.raw(new Array(18).fill(0)); // padding to 60-byte minimum
      c.tree.push({ label: "Padding: 000000000000000000000000000000000000", range: [42, 18] });
    },
  },
  {
    time: 0.000412,
    src: R.mac,
    dst: L.mac,
    proto: "ARP",
    info: `${R.ip} is at ${R.mac}`,
    build: (c) => {
      ethernet(c, R.mac, L.mac, 0x0806);
      arp(c, 2, R.mac, R.ip, L.mac, L.ip);
      c.w.raw(new Array(18).fill(0));
      c.tree.push({ label: "Padding: 000000000000000000000000000000000000", range: [42, 18] });
    },
  },
  udpFrame({
    time: 0.318804,
    src: L,
    dst: { ip: "224.0.0.251", mac: MAC_MDNS },
    sport: 5353,
    dport: 5353,
    ttl: 255,
    id: 0,
    proto: "MDNS",
    info: "Standard query 0x0000 PTR _googlecast._tcp.local, \"QM\" question",
    payload: (c) => dns(c, { id: 0, response: false, name: "_googlecast._tcp.local", qtype: "PTR", layer: "mdns" }),
  }),
  udpFrame({
    time: 0.902117,
    src: HOSTS.tv,
    dst: { ip: "239.255.255.250", mac: MAC_SSDP },
    sport: 42160,
    dport: 1900,
    ttl: 1,
    id: 0x5c1e,
    proto: "SSDP",
    info: "M-SEARCH * HTTP/1.1",
    payload: (c) => {
      const s = c.w.pos;
      c.w.ascii(SSDP_TEXT);
      c.layers.push("ssdp");
      c.tree.push({ label: "Simple Service Discovery Protocol", range: [s, SSDP_TEXT.length], children: SSDP_TEXT.split("\r\n").filter(Boolean).map((l) => ({ label: l })) });
    },
  }),
  tcpFrame({
    time: 1.884330,
    fromClient: true,
    seq: 0x2210aa04,
    ack: 0x9c31e0f2,
    flags: { psh: true, ack: true },
    win: 501,
    relSeq: 3921,
    relAck: 15877,
    id: 0x3a8d,
    proto: "TLSv1.3",
    info: "Application Data",
    peer: { ip: HOSTS.google.ip, port: 443, ttl: 118 },
    cport: CLIENT_PORT - 12,
    payload: (c) => {
      const s = c.w.pos;
      const n = 92;
      c.w.raw([0x17, 0x03, 0x03, 0x00, n]);
      c.w.raw(noise(0xbeef, n));
      c.layers.push("tls");
      field(c, "tls.record.content_type", 23);
      c.tree.push({ label: "Transport Layer Security", range: [s, n + 5], children: [{ label: `TLSv1.3 Record Layer: Application Data Protocol: Application Data`, range: [s, n + 5], children: [{ label: "Opaque Type: Application Data (23)", range: [s, 1] }, { label: "Version: TLS 1.2 (0x0303)", range: [s + 1, 2] }, { label: `Length: ${n}`, range: [s + 3, 2] }, { label: `Encrypted Application Data […]`, range: [s + 5, n] }] }] });
    },
  }),
  tcpFrame({
    time: 1.976541,
    fromClient: false,
    seq: 0x9c31e0f2,
    ack: 0x2210aa04 + 97,
    flags: { ack: true },
    win: 1050,
    relSeq: 15877,
    relAck: 4018,
    id: 0x0000,
    info: `443 → ${CLIENT_PORT - 12} [ACK] Seq=15877 Ack=4018 Win=134400 Len=0`,
    peer: { ip: HOSTS.google.ip, port: 443, ttl: 118 },
    cport: CLIENT_PORT - 12,
  }),
  udpFrame({
    time: 2.104388,
    src: L,
    dst: R,
    sport: 40217,
    dport: 53,
    id: 0x71b3,
    proto: "DNS",
    info: "Standard query 0x3f2a A gaia.cs.umass.edu",
    payload: (c) => dns(c, { id: 0x3f2a, response: false, name: "gaia.cs.umass.edu", qtype: "A" }),
  }),
  udpFrame({
    time: 2.104512,
    src: L,
    dst: R,
    sport: 40217,
    dport: 53,
    id: 0x71b4,
    proto: "DNS",
    info: "Standard query 0x7b11 AAAA gaia.cs.umass.edu",
    payload: (c) => dns(c, { id: 0x7b11, response: false, name: "gaia.cs.umass.edu", qtype: "AAAA" }),
  }),
  udpFrame({
    time: 2.148930,
    src: R,
    dst: L,
    sport: 53,
    dport: 40217,
    id: 0x9e02,
    proto: "DNS",
    info: `Standard query response 0x3f2a A gaia.cs.umass.edu A ${G.ip}`,
    payload: (c) => dns(c, { id: 0x3f2a, response: true, name: "gaia.cs.umass.edu", qtype: "A", answer: G.ip }),
  }),
  udpFrame({
    time: 2.150211,
    src: R,
    dst: L,
    sport: 53,
    dport: 40217,
    id: 0x9e03,
    proto: "DNS",
    info: "Standard query response 0x7b11 AAAA gaia.cs.umass.edu SOA ns1.cs.umass.edu",
    payload: (c) => dns(c, { id: 0x7b11, response: true, name: "gaia.cs.umass.edu", qtype: "AAAA", soa: true }),
  }),
  tcpFrame({
    time: 2.150644,
    fromClient: true,
    seq: ISN_C,
    ack: 0,
    flags: { syn: true },
    win: 64240,
    relSeq: 0,
    relAck: 0,
    id: 0xd4c1,
    syn: true,
    info: `${CLIENT_PORT} → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM TSval=${TS_C + 2151} WS=128`,
  }),
  tcpFrame({
    time: 2.371488,
    fromClient: false,
    seq: ISN_S,
    ack: ISN_C + 1,
    flags: { syn: true, ack: true },
    win: 65160,
    relSeq: 0,
    relAck: 1,
    id: 0x0000,
    syn: true,
    info: `80 → ${CLIENT_PORT} [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460 SACK_PERM TSval=${TS_S + 2371} WS=128`,
  }),
  tcpFrame({
    time: 2.371533,
    fromClient: true,
    seq: ISN_C + 1,
    ack: ISN_S + 1,
    flags: { ack: true },
    win: 502,
    relSeq: 1,
    relAck: 1,
    id: 0xd4c2,
    info: `${CLIENT_PORT} → 80 [ACK] Seq=1 Ack=1 Win=64256 Len=0`,
  }),
  tcpFrame({
    time: T_GET,
    fromClient: true,
    seq: ISN_C + 1,
    ack: ISN_S + 1,
    flags: { psh: true, ack: true },
    win: 502,
    relSeq: 1,
    relAck: 1,
    id: 0xd4c3,
    proto: "HTTP",
    info: "GET /wireshark-labs/INTRO-wireshark-file1.html HTTP/1.1 ",
    payload: (c) =>
      httpText(c, GET_TEXT, "request", {
        "http.request.method": "GET",
        "http.request.uri": "/wireshark-labs/INTRO-wireshark-file1.html",
        "http.request.version": "HTTP/1.1",
        "http.request.full_uri": "http://gaia.cs.umass.edu/wireshark-labs/INTRO-wireshark-file1.html",
      }),
  }),
  tcpFrame({
    time: 2.593702,
    fromClient: false,
    seq: ISN_S + 1,
    ack: ISN_C + 1 + GET_TEXT.length,
    flags: { ack: true },
    win: 507,
    relSeq: 1,
    relAck: 1 + GET_TEXT.length,
    id: 0x8f10,
    info: `80 → ${CLIENT_PORT} [ACK] Seq=1 Ack=${1 + GET_TEXT.length} Win=64896 Len=0`,
  }),
  tcpFrame({
    time: T_OK,
    fromClient: false,
    seq: ISN_S + 1,
    ack: ISN_C + 1 + GET_TEXT.length,
    flags: { psh: true, ack: true },
    win: 507,
    relSeq: 1,
    relAck: 1 + GET_TEXT.length,
    id: 0x8f11,
    proto: "HTTP",
    info: "HTTP/1.1 200 OK  (text/html)",
    payload: (c) =>
      httpText(c, OK_TEXT, "response", {
        "http.response.code": 200,
        "http.response.phrase": "OK",
        "http.response.version": "HTTP/1.1",
        "http.response_for.uri": "http://gaia.cs.umass.edu/wireshark-labs/INTRO-wireshark-file1.html",
        "http.file_data": OK_BODY,
      }),
  }),
  tcpFrame({
    time: 2.594947,
    fromClient: true,
    seq: ISN_C + 1 + GET_TEXT.length,
    ack: ISN_S + 1 + OK_TEXT.length,
    flags: { ack: true },
    win: 501,
    relSeq: 1 + GET_TEXT.length,
    relAck: 1 + OK_TEXT.length,
    id: 0xd4c4,
    info: `${CLIENT_PORT} → 80 [ACK] Seq=${1 + GET_TEXT.length} Ack=${1 + OK_TEXT.length} Win=64128 Len=0`,
  }),
  udpFrame({
    time: 3.411902,
    src: L,
    dst: R,
    sport: 123,
    dport: 123,
    id: 0x0c77,
    proto: "NTP",
    info: "NTP Version 4, client",
    payload: (c) => {
      const s = c.w.pos;
      c.w.raw([0x23, 0, 6, 0xec, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      c.w.raw(new Array(24).fill(0));
      c.w.u32(0xec5c5f0c);
      c.w.u32(0x3a1b2c3d);
      c.layers.push("ntp");
      c.tree.push({ label: "Network Time Protocol (NTP Version 4, client)", range: [s, 48], children: [{ label: "Flags: 0x23, Leap Indicator: no warning, Version number: NTP Version 4, Mode: client", range: [s, 1] }, { label: "Peer Clock Stratum: unspecified or invalid (0)", range: [s + 1, 1] }, { label: "Transmit Timestamp: Sep 17, 2026 07:56:47.226 UTC", range: [s + 40, 8] }] });
    },
  }),
  udpFrame({
    time: 3.418016,
    src: R,
    dst: L,
    sport: 123,
    dport: 123,
    ttl: 64,
    id: 0x2b90,
    proto: "NTP",
    info: "NTP Version 4, server",
    payload: (c) => {
      const s = c.w.pos;
      c.w.raw([0x24, 2, 6, 0xec, 0, 0, 0, 0x1b, 0, 0, 0, 0x2a]);
      c.w.raw(ip4(HOSTS.ntp.ip));
      c.w.raw(new Array(32).fill(0x11));
      c.layers.push("ntp");
      c.tree.push({ label: "Network Time Protocol (NTP Version 4, server)", range: [s, 48], children: [{ label: "Flags: 0x24, Leap Indicator: no warning, Version number: NTP Version 4, Mode: server", range: [s, 1] }, { label: "Peer Clock Stratum: secondary reference (2)", range: [s + 1, 1] }, { label: `Reference ID: ${HOSTS.ntp.ip}`, range: [s + 12, 4] }] });
    },
  }),
  tcpFrame({
    time: 7.596302,
    fromClient: false,
    seq: ISN_S + 1 + OK_TEXT.length,
    ack: ISN_C + 1 + GET_TEXT.length,
    flags: { fin: true, ack: true },
    win: 507,
    relSeq: 1 + OK_TEXT.length,
    relAck: 1 + GET_TEXT.length,
    id: 0x8f12,
    info: `80 → ${CLIENT_PORT} [FIN, ACK] Seq=${1 + OK_TEXT.length} Ack=${1 + GET_TEXT.length} Win=64896 Len=0`,
  }),
  tcpFrame({
    time: 7.596488,
    fromClient: true,
    seq: ISN_C + 1 + GET_TEXT.length,
    ack: ISN_S + 2 + OK_TEXT.length,
    flags: { fin: true, ack: true },
    win: 501,
    relSeq: 1 + GET_TEXT.length,
    relAck: 2 + OK_TEXT.length,
    id: 0xd4c5,
    info: `${CLIENT_PORT} → 80 [FIN, ACK] Seq=${1 + GET_TEXT.length} Ack=${2 + OK_TEXT.length} Win=64128 Len=0`,
  }),
  tcpFrame({
    time: 7.817990,
    fromClient: false,
    seq: ISN_S + 2 + OK_TEXT.length,
    ack: ISN_C + 2 + GET_TEXT.length,
    flags: { ack: true },
    win: 507,
    relSeq: 2 + OK_TEXT.length,
    relAck: 2 + GET_TEXT.length,
    id: 0x8f13,
    info: `80 → ${CLIENT_PORT} [ACK] Seq=${2 + OK_TEXT.length} Ack=${2 + GET_TEXT.length} Win=64896 Len=0`,
  }),
];

export const CAPTURE: Packet[] = SPECS.map((s, i) => frame(i + 1, s));

export const GET_NO = CAPTURE.findIndex((p) => p.fields["http.request.method"]) + 1;
export const OK_NO = CAPTURE.findIndex((p) => p.fields["http.response.code"]) + 1;

/** Wireshark's default row colouring, expressed as a left-border colour and a faint tint. */
export function rowTone(p: Packet): { border: string; bg: string } {
  const has = (l: string) => p.layers.includes(l);
  const syn = p.fields["tcp.flags.syn"]?.[0] === 1;
  const fin = p.fields["tcp.flags.fin"]?.[0] === 1;
  if (has("http")) return { border: "#46a758", bg: "rgba(70,167,88,0.10)" };
  if (has("arp")) return { border: "#c7a94a", bg: "rgba(199,169,74,0.10)" };
  if (has("dns") || has("mdns") || has("ssdp") || has("ntp")) return { border: "#3291ff", bg: "rgba(50,145,255,0.10)" };
  if (has("tcp") && (syn || fin)) return { border: "#8f8f8f", bg: "rgba(143,143,143,0.12)" };
  if (has("tls")) return { border: "#a78bfa", bg: "rgba(167,139,250,0.10)" };
  if (has("tcp")) return { border: "#a78bfa", bg: "rgba(167,139,250,0.06)" };
  return { border: "#454545", bg: "transparent" };
}

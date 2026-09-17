/**
 * A small subset of Wireshark's display-filter language, enough for Lab 01:
 *   protocol names        http, tcp, dns, arp, ...        (lower-case, exactly as Wireshark requires)
 *   comparisons           ip.addr == 10.0.0.1   tcp.port eq 80   frame.len > 100   http.host contains "umass"
 *   logic                 && and, || or, ! not, parentheses
 * Errors mirror Wireshark's wording so the red filter bar in the lab feels familiar.
 */

import type { FieldValue, Packet } from "./capture";

export const PROTOCOLS = new Set(["eth", "arp", "ip", "tcp", "udp", "dns", "mdns", "ssdp", "http", "tls", "ntp", "data-text-lines", "frame"]);

type Tok =
  | { t: "name"; v: string }
  | { t: "num"; v: number }
  | { t: "str"; v: string }
  | { t: "op"; v: string }
  | { t: "lp" }
  | { t: "rp" }
  | { t: "and" }
  | { t: "or" }
  | { t: "not" };

export class FilterError extends Error {}

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "(") {
      out.push({ t: "lp" });
      i++;
      continue;
    }
    if (ch === ")") {
      out.push({ t: "rp" });
      i++;
      continue;
    }
    if (src.startsWith("&&", i)) {
      out.push({ t: "and" });
      i += 2;
      continue;
    }
    if (src.startsWith("||", i)) {
      out.push({ t: "or" });
      i += 2;
      continue;
    }
    if (ch === "!" && src[i + 1] !== "=") {
      out.push({ t: "not" });
      i++;
      continue;
    }
    const op = ["==", "!=", ">=", "<=", ">", "<"].find((o) => src.startsWith(o, i));
    if (op) {
      out.push({ t: "op", v: op });
      i += op.length;
      continue;
    }
    if (ch === '"') {
      const j = src.indexOf('"', i + 1);
      if (j === -1) throw new FilterError("Unterminated string.");
      out.push({ t: "str", v: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    const m = src.slice(i).match(/^[A-Za-z0-9_.:\-\/]+/);
    if (!m) throw new FilterError(`Unexpected character "${ch}".`);
    const w = m[0];
    i += w.length;
    const lw = w.toLowerCase();
    if (lw === "and") out.push({ t: "and" });
    else if (lw === "or") out.push({ t: "or" });
    else if (lw === "not") out.push({ t: "not" });
    else if (["eq", "ne", "gt", "lt", "ge", "le", "contains"].includes(lw)) out.push({ t: "op", v: { eq: "==", ne: "!=", gt: ">", lt: "<", ge: ">=", le: "<=", contains: "contains" }[lw]! });
    else if (/^-?\d+(\.\d+)?$/.test(w)) out.push({ t: "num", v: Number(w) });
    else if (/^0x[0-9a-f]+$/i.test(w)) out.push({ t: "num", v: parseInt(w, 16) });
    else out.push({ t: "name", v: w });
  }
  return out;
}

type Ast =
  | { k: "proto"; name: string }
  | { k: "present"; field: string }
  | { k: "cmp"; field: string; op: string; rhs: FieldValue }
  | { k: "and"; a: Ast; b: Ast }
  | { k: "or"; a: Ast; b: Ast }
  | { k: "not"; a: Ast };

/** Field names this capture knows about (so typos give Wireshark's "neither a field nor a protocol name" error). */
export function knownFields(packets: Packet[]): Set<string> {
  const s = new Set<string>();
  for (const p of packets) for (const k of Object.keys(p.fields)) s.add(k);
  return s;
}

function parse(tokens: Tok[], fields: Set<string>): Ast {
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  function primary(): Ast {
    const t = next();
    if (!t) throw new FilterError("Unexpected end of filter.");
    if (t.t === "lp") {
      const e = expr();
      if (next()?.t !== "rp") throw new FilterError('Expected ")".');
      return e;
    }
    if (t.t === "not") return { k: "not", a: primary() };
    if (t.t === "name") {
      const name = t.v;
      const p = peek();
      if (p && p.t === "op") {
        next();
        const rhsTok = next();
        if (!rhsTok || (rhsTok.t !== "num" && rhsTok.t !== "str" && rhsTok.t !== "name")) throw new FilterError(`"${name}" needs a value on the right of "${p.v}".`);
        if (!fields.has(name)) {
          if (PROTOCOLS.has(name)) throw new FilterError(`"${name}" is a protocol name; it cannot be compared with "${p.v}". Try a field such as ${name}.port or ${name}.addr.`);
          throw new FilterError(`"${name}" is neither a field nor a protocol name.`);
        }
        const rhs: FieldValue = rhsTok.t === "num" ? rhsTok.v : rhsTok.v;
        return { k: "cmp", field: name, op: p.v, rhs };
      }
      if (PROTOCOLS.has(name)) return { k: "proto", name };
      if (fields.has(name)) return { k: "present", field: name };
      throw new FilterError(`"${name}" is neither a field nor a protocol name.`);
    }
    if (t.t === "num" || t.t === "str") throw new FilterError(`"${t.v}" is neither a field nor a protocol name.`);
    throw new FilterError("Syntax error in filter.");
  }
  function andExpr(): Ast {
    let a = primary();
    while (peek()?.t === "and") {
      next();
      a = { k: "and", a, b: primary() };
    }
    return a;
  }
  function expr(): Ast {
    let a = andExpr();
    while (peek()?.t === "or") {
      next();
      a = { k: "or", a, b: andExpr() };
    }
    return a;
  }
  const ast = expr();
  if (i < tokens.length) throw new FilterError("Syntax error in filter: unexpected trailing input.");
  return ast;
}

function cmp(vals: FieldValue[] | undefined, op: string, rhs: FieldValue): boolean {
  if (!vals) return false;
  return vals.some((v) => {
    if (op === "contains") return String(v).toLowerCase().includes(String(rhs).toLowerCase());
    const bothNum = typeof v === "number" && typeof rhs === "number";
    if (bothNum) {
      const a = v as number;
      const b = rhs as number;
      return op === "==" ? a === b : op === "!=" ? a !== b : op === ">" ? a > b : op === "<" ? a < b : op === ">=" ? a >= b : a <= b;
    }
    const a = String(v).toLowerCase();
    const b = String(rhs).toLowerCase();
    if (op === "==") return a === b;
    if (op === "!=") return a !== b;
    return false;
  });
}

function evalAst(ast: Ast, p: Packet): boolean {
  switch (ast.k) {
    case "proto":
      return p.layers.includes(ast.name);
    case "present":
      return !!p.fields[ast.field];
    case "cmp":
      return cmp(p.fields[ast.field], ast.op, ast.rhs);
    case "and":
      return evalAst(ast.a, p) && evalAst(ast.b, p);
    case "or":
      return evalAst(ast.a, p) || evalAst(ast.b, p);
    case "not":
      return !evalAst(ast.a, p);
  }
}

export interface FilterResult {
  ok: boolean;
  error?: string;
  matches: Packet[];
}

export function applyFilter(src: string, packets: Packet[]): FilterResult {
  const trimmed = src.trim();
  if (!trimmed) return { ok: true, matches: packets };
  try {
    const ast = parse(tokenize(trimmed), knownFields(packets));
    return { ok: true, matches: packets.filter((p) => evalAst(ast, p)) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), matches: [] };
  }
}

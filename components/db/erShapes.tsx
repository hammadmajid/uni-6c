import { P } from "@/components/learning/Figure";

/**
 * SVG primitives for Chen-notation ER diagrams (Elmasri's notation, as on the DB lecture 03 slides).
 * Every shape is positioned by its centre. Structure is drawn in gray; pass `hl` to draw the
 * distinguishing part of a symbol (second border, dashes, underline) in blue.
 * Not an MDX component: import these into figures under components/db/.
 */

const STROKE = P.text;
const FILL = P.panel;

/** Approximate rendered width of sans text at the given font size. */
export function textWidth(label: string, size = 11) {
  return label.length * size * 0.56;
}

export function ErEntity({ x, y, label, w, h = 34, weak = false, hl = false }: { x: number; y: number; label: string; w?: number; h?: number; weak?: boolean; hl?: boolean }) {
  const width = w ?? Math.max(84, textWidth(label) + 28);
  const accent = hl ? P.blue : STROKE;
  return (
    <g>
      <rect x={x - width / 2} y={y - h / 2} width={width} height={h} fill={FILL} stroke={weak ? accent : STROKE} strokeWidth={1.2} />
      {weak && <rect x={x - width / 2 + 4} y={y - h / 2 + 4} width={width - 8} height={h - 8} fill="none" stroke={accent} strokeWidth={1.2} />}
      <text x={x} y={y + 4} textAnchor="middle" fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
        {label}
      </text>
    </g>
  );
}

export type AttrKind = "simple" | "key" | "partial" | "multi" | "derived";

export function ErAttr({ x, y, label, kind = "simple", rx, ry = 15, hl = false }: { x: number; y: number; label: string; kind?: AttrKind; rx?: number; ry?: number; hl?: boolean }) {
  const r = rx ?? Math.max(38, textWidth(label) / 2 + 14);
  const accent = hl ? P.blue : STROKE;
  const tw = textWidth(label);
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={ry} fill={FILL} stroke={kind === "derived" ? accent : STROKE} strokeWidth={1.2} strokeDasharray={kind === "derived" ? "4 3" : undefined} />
      {kind === "multi" && <ellipse cx={x} cy={y} rx={r - 4} ry={ry - 4} fill="none" stroke={accent} strokeWidth={1.2} />}
      <text x={x} y={y + 4} textAnchor="middle" fill={P.textStrong} fontSize={11}>
        {label}
      </text>
      {(kind === "key" || kind === "partial") && (
        <line x1={x - tw / 2} y1={y + 7} x2={x + tw / 2} y2={y + 7} stroke={hl ? P.blue : P.textStrong} strokeWidth={1.1} strokeDasharray={kind === "partial" ? "3 2" : undefined} />
      )}
    </g>
  );
}

export function ErRel({ x, y, label, w, h = 44, identifying = false, hl = false }: { x: number; y: number; label: string; w?: number; h?: number; identifying?: boolean; hl?: boolean }) {
  const width = w ?? Math.max(96, textWidth(label, 10) + 44);
  const pts = (inset: number) => {
    const hw = width / 2 - inset * 1.6;
    const hh = h / 2 - inset;
    return `${x},${y - hh} ${x + hw},${y} ${x},${y + hh} ${x - hw},${y}`;
  };
  const accent = hl ? P.blue : STROKE;
  return (
    <g>
      <polygon points={pts(0)} fill={FILL} stroke={identifying ? accent : STROKE} strokeWidth={1.2} />
      {identifying && <polygon points={pts(4)} fill="none" stroke={accent} strokeWidth={1.2} />}
      <text x={x} y={y + 4} textAnchor="middle" fill={P.textStrong} fontSize={10} fontFamily={P.mono}>
        {label}
      </text>
    </g>
  );
}

/** A connecting line. `total` draws Chen's double line for total participation. */
export function ErLink({ x1, y1, x2, y2, total = false, hl = false }: { x1: number; y1: number; x2: number; y2: number; total?: boolean; hl?: boolean }) {
  const color = hl ? P.blue : P.lineStrong;
  if (!total) return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.2} />;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * 2;
  const oy = (dx / len) * 2;
  return (
    <g stroke={color} strokeWidth={1.2}>
      <line x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} />
      <line x1={x1 - ox} y1={y1 - oy} x2={x2 - ox} y2={y2 - oy} />
    </g>
  );
}

/** Cardinality label (1, N, M) placed beside a line. */
export function ErCard({ x, y, label, hl = false }: { x: number; y: number; label: string; hl?: boolean }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill={hl ? P.blueSoft : P.amber} fontSize={11} fontFamily={P.mono}>
      {label}
    </text>
  );
}

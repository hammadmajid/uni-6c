import type { ReactNode } from "react";

/**
 * Shared palette for hand-drawn SVG figures. Matches the Geist tokens in app/globals.css.
 * Use these hex values directly inside SVG attributes (fill, stroke) so figures render identically on every surface.
 *
 * Semantics: blue = the thing being explained / highlighted path, amber = shared or contended or waiting,
 * green = ok / dedicated / delivered, red = loss / error, gray = structure.
 */
export const P = {
  bg: "#121212",
  panel: "#1a1a1a",
  line: "#2e2e2e",
  lineStrong: "#454545",
  muted: "#6b6b6b",
  text: "#8f8f8f",
  textStrong: "#ededed",
  blue: "#0070f3",
  blueSoft: "#3291ff",
  green: "#46a758",
  greenSoft: "#62c073",
  amber: "#ffb224",
  amberSoft: "#ffc85c",
  red: "#e5484d",
  redSoft: "#ff6369",
  mono: "var(--font-mono)",
} as const;

/**
 * Wrapper for a static or lightly interactive diagram inside a lesson.
 * Title reads "Figure · <title>"; caption is one or two sentences telling the learner what to look at.
 * Children should be an <svg viewBox="..." className="h-auto w-full"> so the figure scales to the 2xl article column.
 */
export function Figure({ title, caption, children, controls }: { title: string; caption?: ReactNode; children: ReactNode; controls?: ReactNode }) {
  return (
    <figure className="my-6 overflow-hidden rounded-lg border border-gray-400 bg-background-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-400 px-4 py-2.5">
        <p className="text-label-12 text-gray-700">
          <span className="text-gray-600">Figure · </span>
          <span className="text-gray-1000">{title}</span>
        </p>
        {controls && <div className="min-w-0">{controls}</div>}
      </div>
      <div className="p-4">{children}</div>
      {caption && <figcaption className="text-copy-13 border-t border-gray-400 px-4 py-3 text-gray-700">{caption}</figcaption>}
    </figure>
  );
}

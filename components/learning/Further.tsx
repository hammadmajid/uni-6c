import { BookOpen, ExternalLink, FileText, Globe, PlayCircle, Wrench } from "lucide-react";

type Kind = "docs" | "video" | "blog" | "rfc" | "tool" | "book";

export interface FurtherLink {
  href: string;
  title: string;
  kind: Kind;
  /** One line: why this is worth the learner's time. */
  why: string;
  /** Rough time cost, e.g. "12 min" or "1 h". */
  time?: string;
}

const icons: Record<Kind, typeof Globe> = {
  docs: FileText,
  video: PlayCircle,
  blog: Globe,
  rfc: FileText,
  tool: Wrench,
  book: BookOpen,
};

const labels: Record<Kind, string> = {
  docs: "Docs",
  video: "Video",
  blog: "Blog",
  rfc: "RFC",
  tool: "Tool",
  book: "Book",
};

/**
 * Optional, non-examinable pointers beyond the course: official docs, RFCs, videos, blog posts.
 * Sits at the end of a lesson. Two to four links, each with a one-line reason.
 */
export function Further({ links, title = "Go further" }: { links: FurtherLink[]; title?: string }) {
  return (
    <aside className="my-8 rounded-lg border border-dashed border-gray-500 p-4">
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <span className="text-label-14 text-gray-1000">{title}</span>
        <span className="text-label-12 text-gray-600">optional · not examinable · pick one if you have spare time</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {links.map((l) => {
          const Icon = icons[l.kind];
          return (
            <div key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full rounded-md border border-gray-400 bg-background-200 p-3 !no-underline transition-colors hover:border-gray-600"
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} className="shrink-0 text-blue-600" />
                  <span className="text-label-12 uppercase tracking-wider text-gray-600">{labels[l.kind]}</span>
                  {l.time && <span className="text-label-12-mono text-gray-600">{l.time}</span>}
                  <ExternalLink size={12} className="ml-auto shrink-0 text-gray-500 transition-colors group-hover:text-gray-900" />
                </div>
                <span className="text-label-14 mt-1.5 block text-gray-1000">{l.title}</span>
                <span className="text-copy-13 mt-1 block text-gray-700">{l.why}</span>
              </a>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, GraduationCap, Info, XCircle } from "lucide-react";

type CalloutType = "key-idea" | "pitfall" | "done" | "careful" | "exam";

const config: Record<
  CalloutType,
  { icon: typeof Info; title: string; border: string; bg: string; color: string }
> = {
  "key-idea": { icon: Info, title: "Key idea", border: "border-blue-700/30", bg: "bg-blue-700/5", color: "text-blue-600" },
  pitfall: { icon: AlertTriangle, title: "Common trap", border: "border-amber-700/30", bg: "bg-amber-700/5", color: "text-amber-600" },
  done: { icon: CheckCircle2, title: "Done", border: "border-green-700/30", bg: "bg-green-700/5", color: "text-green-600" },
  careful: { icon: XCircle, title: "Careful", border: "border-red-700/30", bg: "bg-red-700/5", color: "text-red-600" },
  exam: { icon: GraduationCap, title: "Exam angle", border: "border-gray-500", bg: "bg-background-200", color: "text-gray-1000" },
};

export function Callout({ type = "key-idea", title, children }: { type?: CalloutType; title?: string; children: ReactNode }) {
  const c = config[type];
  const Icon = c.icon;
  return (
    <div className={`my-6 rounded-lg border ${c.border} ${c.bg} p-4`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`${c.color} mt-0.5 shrink-0`} />
        <div className="min-w-0 flex-1">
          <p className={`text-label-14 mb-1 ${c.color}`}>{title ?? c.title}</p>
          <div className="text-copy-14 text-gray-900 [&>p+p]:mt-2 [&_strong]:text-gray-1000 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li+li]:mt-1 [&_code]:rounded [&_code]:border [&_code]:border-gray-400 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[12px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60";
  const styles: Record<Variant, string> = {
    primary: "bg-gray-1000 text-black hover:bg-white",
    secondary: "border border-gray-500 text-gray-1000 hover:border-gray-700 hover:bg-gray-100",
    ghost: "text-gray-700 hover:text-gray-1000 hover:bg-gray-100",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function Feedback({
  tone,
  title,
  children,
}: {
  tone: "correct" | "incorrect" | "info";
  title: string;
  children?: ReactNode;
}) {
  const t = {
    correct: "border-green-700/40 bg-green-700/10 text-green-600",
    incorrect: "border-red-700/40 bg-red-700/10 text-red-600",
    info: "border-blue-700/40 bg-blue-700/10 text-blue-600",
  }[tone];
  return (
    <div
      className={`mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-md border p-4 duration-200 ${t}`}
      role="alert"
      aria-live="polite"
    >
      <p className="text-label-14 mb-1">{title}</p>
      {children && <div className="text-copy-14 space-y-2 text-gray-900">{children}</div>}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-gray-500 bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-900">
      {children}
    </kbd>
  );
}

export function Pill({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "blue" | "green" | "amber" }) {
  const t = {
    gray: "border-gray-500 text-gray-800",
    blue: "border-blue-700/50 bg-blue-700/10 text-blue-600",
    green: "border-green-700/50 bg-green-700/10 text-green-600",
    amber: "border-amber-700/50 bg-amber-700/10 text-amber-600",
  }[tone];
  return <span className={`text-label-12 inline-flex items-center rounded-full border px-2 py-0.5 ${t}`}>{children}</span>;
}

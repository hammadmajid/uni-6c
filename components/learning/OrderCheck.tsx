"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { useActivityKey } from "./LessonContext";
import { Button, Feedback } from "./ui";

interface OrderCheckProps {
  id: string;
  prompt: string;
  /** Items in the correct order. */
  items: string[];
  explanation: string;
  topLabel?: string;
  bottomLabel?: string;
}

function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function scramble(items: string[], seed: string): string[] {
  const rnd = seeded(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.every((v, i) => v === items[i])) out.push(out.shift() as string);
  return out;
}

export function OrderCheck({ id, prompt, items, explanation, topLabel, bottomLabel }: OrderCheckProps) {
  const key = useActivityKey(id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  // Ready once localStorage is in and the server pull (if any) has been merged.
  const ready = useProgressStore((s) => s.hydrated && s.sync !== "checking");
  const saved = useProgressStore((s) => s.activities[key]);
  const [order, setOrder] = useState(() => scramble(items, id));
  const [result, setResult] = useState<boolean[] | null>(null);
  const [attempts, setAttempts] = useState(0);
  const seeded = useRef(false);

  // Restore a solved order (or the last attempted one) from the store.
  useEffect(() => {
    if (!ready || seeded.current) return;
    seeded.current = true;
    if (!saved || saved.attempts === 0) return;
    setAttempts(saved.attempts);
    let last: string[] | null = null;
    try {
      const parsed = saved.lastAnswer ? (JSON.parse(saved.lastAnswer) as unknown) : null;
      if (Array.isArray(parsed) && parsed.length === items.length && parsed.every((x) => items.includes(x))) last = parsed as string[];
    } catch {
      last = null;
    }
    if (saved.correct) {
      setOrder([...items]);
      setResult(items.map(() => true));
    } else if (last) {
      setOrder(last);
      setResult(last.map((v, i) => v === items[i]));
    }
  }, [ready, saved, items]);

  const solved = result?.every(Boolean) ?? false;

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setResult(null);
  }

  function check() {
    const r = order.map((v, i) => v === items[i]);
    setResult(r);
    setAttempts((a) => a + 1);
    recordAttempt(key, r.every(Boolean), JSON.stringify(order));
  }

  return (
    <div className="my-6 rounded-lg border border-gray-400 bg-background-200 p-5">
      <p className="text-label-12 mb-2 text-blue-600">Put these in order</p>
      <p className="text-copy-16 font-medium text-gray-1000">{prompt}</p>

      {topLabel && <p className="text-label-12 mt-4 text-gray-600">{topLabel}</p>}
      <ol className="mt-2 space-y-1.5">
        {order.map((item, i) => {
          const state = result ? (result[i] ? "ok" : "bad") : "none";
          return (
            <li
              key={item}
              className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                state === "ok"
                  ? "border-green-700/60 bg-green-700/10"
                  : state === "bad"
                    ? "border-red-700/60 bg-red-700/10"
                    : "border-gray-500"
              }`}
            >
              <span className="text-label-12-mono w-5 text-gray-600">{i + 1}</span>
              <span className="text-copy-14 flex-1 text-gray-1000">{item}</span>
              {!solved && (
                <span className="flex gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded p-1 text-gray-700 hover:bg-gray-100 hover:text-gray-1000 disabled:opacity-20"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === order.length - 1}
                    aria-label="Move down"
                    className="rounded p-1 text-gray-700 hover:bg-gray-100 hover:text-gray-1000 disabled:opacity-20"
                  >
                    <ArrowDown size={14} />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {bottomLabel && <p className="text-label-12 mt-2 text-gray-600">{bottomLabel}</p>}

      {!solved && (
        <div className="mt-4">
          <Button variant="primary" onClick={check}>
            Check order
          </Button>
        </div>
      )}

      {result && solved && (
        <Feedback tone="correct" title={attempts === 1 ? "All in place, first try." : `All in place after ${attempts} tries.`}>
          <p>{explanation}</p>
        </Feedback>
      )}
      {result && !solved && (
        <Feedback tone="incorrect" title={`${result.filter(Boolean).length} of ${items.length} in the right slot.`}>
          <p>Green rows are correct. Move the red ones and check again.</p>
        </Feedback>
      )}
    </div>
  );
}

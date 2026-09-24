"use client";

import { useEffect, useState } from "react";
import { Pause, Play, StepForward } from "lucide-react";
import { Lab, SegmentRow, Stat, useExplorationState } from "@/components/learning/Controls";
import { Button } from "@/components/learning/ui";

type Scenario = "atm" | "phone" | "crash";
type Mode = "serial" | "none" | "dbms";
type Who = "T1" | "T2" | "sys";
type Tone = "plain" | "wait" | "bad" | "ok";

interface Ev {
  who: Who;
  text: string;
  /** Shared state after this step. */
  state: string;
  tone?: Tone;
}

interface Run {
  t1: string;
  t2: string;
  stateLabel: string;
  start: string;
  events: Ev[];
  verdict: { ok: boolean; title: string; note: string; property: string };
}

const RUNS: Record<Scenario, Partial<Record<Mode, Run>>> = {
  atm: {
    serial: {
      t1: "Ali at the ATM: withdraw 3,000",
      t2: "Father on mobile: deposit 5,000",
      stateLabel: "balance on disk",
      start: "10,000",
      events: [
        { who: "T1", text: "BEGIN; read balance → 10,000", state: "10,000" },
        { who: "T1", text: "write 10,000 − 3,000 = 7,000", state: "7,000" },
        { who: "T1", text: "COMMIT", state: "7,000", tone: "ok" },
        { who: "T2", text: "BEGIN; read balance → 7,000", state: "7,000" },
        { who: "T2", text: "write 7,000 + 5,000 = 12,000", state: "12,000" },
        { who: "T2", text: "COMMIT", state: "12,000", tone: "ok" },
      ],
      verdict: { ok: true, title: "12,000: correct", note: "One after the other is always correct. It is also slow: every customer waits for every other customer.", property: "Serial schedule" },
    },
    none: {
      t1: "Ali at the ATM: withdraw 3,000",
      t2: "Father on mobile: deposit 5,000",
      stateLabel: "balance on disk",
      start: "10,000",
      events: [
        { who: "T1", text: "read balance → 10,000", state: "10,000" },
        { who: "T2", text: "read balance → 10,000", state: "10,000", tone: "wait" },
        { who: "T1", text: "write 10,000 − 3,000 = 7,000", state: "7,000" },
        { who: "T2", text: "write 10,000 + 5,000 = 15,000 (from its stale read)", state: "15,000", tone: "bad" },
      ],
      verdict: {
        ok: false,
        title: "15,000: the withdrawal vanished",
        note: "Lost update. T2 computed from a value T1 was about to change, then overwrote T1's write. Ali has 3,000 in cash and the bank still shows it in his account.",
        property: "Isolation violated",
      },
    },
    dbms: {
      t1: "Ali at the ATM: withdraw 3,000",
      t2: "Father on mobile: deposit 5,000",
      stateLabel: "balance on disk",
      start: "10,000",
      events: [
        { who: "T1", text: "BEGIN; SELECT … FOR UPDATE → 10,000 (row locked by T1)", state: "10,000" },
        { who: "T2", text: "BEGIN; SELECT … FOR UPDATE → waits for T1's lock", state: "10,000", tone: "wait" },
        { who: "T1", text: "write 7,000", state: "7,000" },
        { who: "T1", text: "COMMIT; lock released", state: "7,000", tone: "ok" },
        { who: "T2", text: "wakes up; read → 7,000", state: "7,000" },
        { who: "T2", text: "write 7,000 + 5,000 = 12,000; COMMIT", state: "12,000", tone: "ok" },
      ],
      verdict: {
        ok: true,
        title: "12,000: correct, and T2 waited only for one row",
        note: "Concurrency control made the interleaving behave as if it were serial. Other accounts were never blocked.",
        property: "Isolation via locking",
      },
    },
  },
  phone: {
    serial: {
      t1: "Sara orders the phone",
      t2: "Another customer orders it",
      stateLabel: "stock of this model",
      start: "1",
      events: [
        { who: "T1", text: "BEGIN; read stock → 1", state: "1" },
        { who: "T1", text: "stock := 0; insert order #1; COMMIT", state: "0", tone: "ok" },
        { who: "T2", text: "BEGIN; read stock → 0", state: "0" },
        { who: "T2", text: "show “sold out”; ROLLBACK", state: "0", tone: "ok" },
      ],
      verdict: { ok: true, title: "One phone, one order", note: "Correct, but only because the second customer happened to arrive later.", property: "Serial schedule" },
    },
    none: {
      t1: "Sara orders the phone",
      t2: "Another customer orders it",
      stateLabel: "stock of this model",
      start: "1",
      events: [
        { who: "T1", text: "read stock → 1: in stock", state: "1" },
        { who: "T2", text: "read stock → 1: in stock", state: "1", tone: "wait" },
        { who: "T1", text: "stock := 0; insert order #1", state: "0" },
        { who: "T2", text: "stock := 0; insert order #2", state: "0", tone: "bad" },
      ],
      verdict: {
        ok: false,
        title: "One phone, two paid orders",
        note: "Both checks passed because both read before either wrote. Stock reads 0, which looks fine, and hides the double sale.",
        property: "Isolation violated",
      },
    },
    dbms: {
      t1: "Sara orders the phone",
      t2: "Another customer orders it",
      stateLabel: "stock of this model",
      start: "1",
      events: [
        { who: "T1", text: "BEGIN; SELECT stock … FOR UPDATE → 1 (row locked)", state: "1" },
        { who: "T2", text: "BEGIN; SELECT stock … FOR UPDATE → waits", state: "1", tone: "wait" },
        { who: "T1", text: "stock := 0; insert order #1; COMMIT", state: "0", tone: "ok" },
        { who: "T2", text: "wakes up; reads 0; show “sold out”; ROLLBACK", state: "0", tone: "ok" },
      ],
      verdict: { ok: true, title: "One phone, one order", note: "The lecture's “locking inventory until the transaction completes”, exactly.", property: "Isolation via locking" },
    },
  },
  crash: {
    none: {
      t1: "Father transfers 5,000 to Ali",
      t2: "System: power and recovery",
      stateLabel: "father / Ali on disk",
      start: "20,000 / 10,000",
      events: [
        { who: "T1", text: "debit father: write 15,000", state: "15,000 / 10,000" },
        { who: "sys", text: "power failure before the credit is written", state: "15,000 / 10,000", tone: "bad" },
        { who: "sys", text: "restart: nothing knows a transfer was in progress", state: "15,000 / 10,000", tone: "bad" },
      ],
      verdict: { ok: false, title: "5,000 left one account and reached nobody", note: "Half a transfer is on disk. With plain files there is no record that the two writes belonged together.", property: "Atomicity violated" },
    },
    dbms: {
      t1: "Father transfers 5,000 to Ali",
      t2: "System: power and recovery",
      stateLabel: "father / Ali on disk",
      start: "20,000 / 10,000",
      events: [
        { who: "T1", text: "BEGIN; debit father 15,000 (change written to the log first)", state: "15,000 / 10,000" },
        { who: "sys", text: "power failure before COMMIT", state: "15,000 / 10,000", tone: "bad" },
        { who: "sys", text: "restart: recovery reads the log, finds no COMMIT, undoes the debit", state: "20,000 / 10,000", tone: "ok" },
        { who: "T1", text: "retry: BEGIN; debit 15,000; credit 15,000; COMMIT (commit record forced to disk)", state: "15,000 / 15,000", tone: "ok" },
        { who: "sys", text: "power failure again, after COMMIT", state: "15,000 / 15,000", tone: "wait" },
        { who: "sys", text: "restart: log says committed, so both writes stay", state: "15,000 / 15,000", tone: "ok" },
      ],
      verdict: {
        ok: true,
        title: "All or nothing, and done means done",
        note: "Before COMMIT a crash rolls back (atomicity). After COMMIT a crash cannot lose it (durability). Both come from the log.",
        property: "Atomicity + durability",
      },
    },
  },
};

const MODE_LABEL: Record<Mode, string> = { serial: "One at a time", none: "No control", dbms: "DBMS" };

export function TxnInterleaveLab() {
  const { values: v, set, reset: resetUrl } = useExplorationState({ scenario: "atm" as Scenario, mode: "none" as Mode });
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const modes = (Object.keys(RUNS[v.scenario]) as Mode[]).filter((m) => RUNS[v.scenario][m]);
  const mode = modes.includes(v.mode) ? v.mode : modes[0];
  const run = RUNS[v.scenario][mode]!;
  const done = step >= run.events.length;
  const state = step === 0 ? run.start : run.events[step - 1].state;

  useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [playing, step, done]);

  function choose(patch: () => void) {
    patch();
    setStep(0);
    setPlaying(false);
  }

  return (
    <Lab
      title="Two transactions, one row"
      subtitle="Step through the same work with and without the DBMS in charge."
      onReset={() => choose(resetUrl)}
      controls={
        <>
          <SegmentRow
            label="Scenario"
            value={v.scenario}
            options={[
              { value: "atm", label: "ATM + deposit" },
              { value: "phone", label: "Last phone" },
              { value: "crash", label: "Crash mid-transfer" },
            ]}
            onChange={(s) => choose(() => set("scenario", s))}
          />
          <SegmentRow label="Who is in control" value={mode} options={modes.map((m) => ({ value: m, label: m === "dbms" && v.scenario === "crash" ? "DBMS transaction" : m === "none" && v.scenario === "crash" ? "Plain writes" : MODE_LABEL[m] }))} onChange={(m) => choose(() => set("mode", m))} />
          <div className="flex gap-1.5">
            <Button variant="secondary" onClick={() => (done ? setStep(0) : setPlaying((p) => !p))} className="px-2.5! py-1! text-xs">
              {playing ? <Pause size={12} /> : <Play size={12} />} {done ? "replay" : playing ? "pause" : "play"}
            </Button>
            <Button variant="secondary" disabled={done} onClick={() => setStep((s) => s + 1)} className="px-2.5! py-1! text-xs">
              <StepForward size={12} /> step
            </Button>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_1fr_auto] gap-x-3 border-b border-gray-400 pb-2">
        <p className="text-label-12 text-blue-600">T1 · {run.t1}</p>
        <p className="text-label-12 text-amber-600">T2 · {run.t2}</p>
        <p className="text-label-12 text-right text-gray-700">{run.stateLabel}</p>
      </div>
      <div className="mt-1 space-y-1">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-x-3 py-1">
          <span className="text-copy-13 col-span-2 text-gray-600">start</span>
          <span className="text-right font-mono text-[12px] text-gray-1000">{run.start}</span>
        </div>
        {run.events.map((e, i) => {
          const shown = i < step;
          const tone = e.tone ?? "plain";
          const c = { plain: "text-gray-1000", wait: "text-amber-600", bad: "text-red-600", ok: "text-green-600" }[tone];
          const cell = <span className={`text-copy-13 ${c}`}>{e.text}</span>;
          if (!shown)
            return (
              <div key={i} className="flex h-7 items-center px-1">
                <span className="text-label-12-mono text-gray-500">step {i + 1} ·</span>
              </div>
            );
          return (
            <div
              key={i}
              className={`grid grid-cols-[1fr_1fr_auto] items-baseline gap-x-3 rounded px-1 py-1 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"} ${i === step - 1 ? "bg-gray-100" : ""}`}
            >
              {e.who === "sys" ? <span className="col-span-2">{cell}</span> : e.who === "T1" ? <>{cell}<span /></> : <><span />{cell}</>}
              <span className={`text-right font-mono text-[12px] ${tone === "bad" ? "text-red-600" : "text-gray-1000"}`}>{e.state}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Stat label={run.stateLabel} value={state} tone={done ? (run.verdict.ok ? "green" : "red") : "default"} note={done ? run.verdict.title : `step ${step} of ${run.events.length}`} />
        <Stat label="ACID property at stake" value={done ? run.verdict.property : "…"} tone={done ? (run.verdict.ok ? "green" : "red") : "default"} note={done ? run.verdict.note : "step to the end to see the verdict"} />
      </div>
    </Lab>
  );
}

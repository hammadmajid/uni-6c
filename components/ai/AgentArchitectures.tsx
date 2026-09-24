"use client";

import { useState, type ReactNode } from "react";
import { Figure, P } from "@/components/learning/Figure";

type Kind = "reflex" | "model" | "goal" | "utility" | "learning";

const KINDS: { value: Kind; label: string }[] = [
  { value: "reflex", label: "Simple reflex" },
  { value: "model", label: "Model-based" },
  { value: "goal", label: "Goal-based" },
  { value: "utility", label: "Utility-based" },
  { value: "learning", label: "Learning" },
];

const ADDS: Record<Kind, { adds: string; question: string; caption: ReactNode }> = {
  reflex: {
    adds: "condition–action rules on the current percept",
    question: "What do I see right now?",
    caption: (
      <>
        Percept in, rule lookup, action out. No memory: the same percept always gives the same action. Rational only if the environment is{" "}
        <strong>fully observable</strong>, because the current percept is all it ever knows.
      </>
    ),
  },
  model: {
    adds: "internal state + a model of how the world evolves and what my actions do",
    question: "What is the world like now, including what I cannot see?",
    caption: (
      <>
        The amber boxes are new: <strong>internal state</strong> updated from the percept history, using a <strong>model</strong> of how the world
        changes on its own and how the agent&apos;s actions change it. It handles <strong>partial observability</strong>. Still picks actions by rules.
      </>
    ),
  },
  goal: {
    adds: "goals + looking ahead: what happens if I do A?",
    question: "Which action gets me to the goal?",
    caption: (
      <>
        Rules are gone. The agent predicts the result of each action with its model and picks one that leads to a <strong>goal</strong>. Change the goal and
        the behaviour changes with no rewriting of rules. Goals are binary: reached or not. Search and planning (the next weeks) live here.
      </>
    ),
  },
  utility: {
    adds: "a utility function: how good is that state, as a number?",
    question: "Which action gets me the best outcome?",
    caption: (
      <>
        Goals are replaced by <strong>utility</strong>, a score for each state. Needed when goals conflict (speed vs safety) or when success is uncertain
        and likelihood has to be weighed against importance. A rational utility-based agent maximises <strong>expected</strong> utility.
      </>
    ),
  },
  learning: {
    adds: "a critic, a learning element and a problem generator around any of the four",
    question: "How do I get better at this?",
    caption: (
      <>
        Any of the four agents becomes the <strong>performance element</strong> (blue). The <strong>critic</strong> scores behaviour against a fixed
        performance standard, the <strong>learning element</strong> changes the performance element, and the <strong>problem generator</strong> proposes
        exploratory actions that teach something new.
      </>
    ),
  },
};

const W = 640;
const H = 300;

function Box({ x, y, w, h = 34, label, sub, tone = "gray", dashed }: { x: number; y: number; w: number; h?: number; label: string; sub?: string; tone?: "gray" | "blue" | "amber" | "green"; dashed?: boolean }) {
  const stroke = { gray: P.lineStrong, blue: P.blue, amber: P.amber, green: P.green }[tone];
  const fill = { gray: P.panel, blue: "rgba(0,112,243,0.10)", amber: "rgba(255,178,36,0.08)", green: "rgba(70,167,88,0.08)" }[tone];
  const color = { gray: P.textStrong, blue: P.blueSoft, amber: P.amberSoft, green: P.greenSoft }[tone];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={fill} stroke={stroke} strokeDasharray={dashed ? "4 3" : undefined} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 3 : y + h / 2 + 4} textAnchor="middle" fill={color} fontSize={11}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ d, color = P.text, label, lx, ly }: { d: string; color?: string; label?: string; lx?: number; ly?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={1.3} markerEnd={`url(#ai-arch-${color === P.text ? "g" : color === P.amber ? "a" : "b"})`} />
      {label && (
        <text x={lx} y={ly} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          {label}
        </text>
      )}
    </g>
  );
}

/** Interactive figure: the five agent architectures from R&N ch. 2, drawn as one diagram that grows. */
export function AgentArchitectures({ initial = "reflex" }: { initial?: Kind }) {
  const [k, setK] = useState<Kind>(initial);
  const env = { x: 530, y: 16, w: 94, h: 268 };
  const sens = { x: 380, y: 30, w: 120 };
  const actu = { x: 380, y: 244, w: 120 };
  const mid = { x: 196, w: 160 };
  const left = { x: 20, w: 150 };
  const rows = { now: 30, ahead: 90, happy: 150, action: 244 };
  const hasModel = k !== "reflex";
  const lookahead = k === "goal" || k === "utility";

  const controls = (
    <div className="flex flex-wrap gap-1">
      {KINDS.map((o) => (
        <button
          key={o.value}
          onClick={() => setK(o.value)}
          className={`text-label-12 rounded-md border px-2 py-1 transition-colors ${o.value === k ? "border-gray-1000 bg-gray-1000 text-black" : "border-gray-500 text-gray-800 hover:text-gray-1000"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <Figure title="Five agent architectures, one diagram" controls={controls} caption={ADDS[k].caption}>
      <p className="text-label-12-mono mb-2 text-gray-700">
        adds: <span className="text-gray-1000">{ADDS[k].adds}</span>
        <br />
        asks: <span className="text-gray-1000">{ADDS[k].question}</span>
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Architecture of a ${k} agent`}>
        <defs>
          {[
            ["g", P.text],
            ["a", P.amber],
            ["b", P.blueSoft],
          ].map(([id, c]) => (
            <marker key={id} id={`ai-arch-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
            </marker>
          ))}
        </defs>

        {/* environment */}
        <rect x={env.x} y={env.y} width={env.w} height={env.h} rx={8} fill={P.panel} stroke={P.lineStrong} />
        <text x={env.x + env.w / 2} y={env.y + env.h / 2} textAnchor="middle" fill={P.textStrong} fontSize={12} transform={`rotate(-90 ${env.x + env.w / 2} ${env.y + env.h / 2})`}>
          Environment
        </text>
        <rect x={10} y={8} width={510} height={284} rx={10} fill="none" stroke={P.line} strokeDasharray="5 4" />
        <text x={18} y={22} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          agent
        </text>

        <Box x={sens.x} y={rows.now} w={sens.w} label="Sensors" />
        <Box x={actu.x} y={actu.y} w={actu.w} label="Actuators" />
        <Arrow d={`M ${env.x} ${rows.now + 17} H ${sens.x + sens.w + 2}`} label="percepts" lx={env.x + 8} ly={rows.now + 36} />
        <Arrow d={`M ${actu.x + actu.w} ${actu.y + 17} H ${env.x - 2}`} label="actions" lx={env.x + 8} ly={actu.y + 36} />

        {k !== "learning" && (
          <g>
            <Box x={mid.x} y={rows.now} w={mid.w} label="What the world is" sub="like now" tone={hasModel ? "amber" : "gray"} />
            <Arrow d={`M ${sens.x} ${rows.now + 17} H ${mid.x + mid.w + 2}`} />
            <Box x={mid.x} y={rows.action} w={mid.w} label="What action I" sub="should do now" tone="blue" />
            <Arrow d={`M ${mid.x + mid.w} ${rows.action + 17} H ${actu.x - 2}`} color={P.blueSoft} />

            {!lookahead && <Arrow d={`M ${mid.x + mid.w / 2} ${rows.now + 34} V ${rows.action - 2}`} />}
            {!lookahead && (
              <>
                <Box x={left.x} y={rows.action} w={left.w} label="Condition–action" sub="rules" />
                <Arrow d={`M ${left.x + left.w} ${rows.action + 17} H ${mid.x - 2}`} />
              </>
            )}

            {hasModel && (
              <g>
                <Box x={left.x} y={30} w={left.w} label="State" sub="memory of the past" tone="amber" />
                <Box x={left.x} y={72} w={left.w} label="How the world evolves" tone="amber" />
                <Box x={left.x} y={114} w={left.w} label="What my actions do" tone="amber" />
                <path d={`M ${left.x + left.w + 4} 34 h 6 v 110 h -6`} fill="none" stroke={P.amber} />
                <Arrow d={`M ${left.x + left.w + 10} 60 H ${mid.x - 2}`} color={P.amber} />
                {lookahead && <Arrow d={`M ${left.x + left.w + 10} ${rows.ahead + 17} H ${mid.x - 2}`} color={P.amber} />}
              </g>
            )}

            {lookahead && (
              <g>
                <Box x={mid.x} y={rows.ahead} w={mid.w} label="What it will be like" sub="if I do action A" tone="green" />
                <Arrow d={`M ${mid.x + mid.w / 2} ${rows.now + 34} V ${rows.ahead - 2}`} />
              </g>
            )}
            {k === "goal" && (
              <g>
                <Box x={left.x} y={rows.action} w={left.w} label="Goals" sub="reached or not" tone="green" />
                <Arrow d={`M ${left.x + left.w} ${rows.action + 17} H ${mid.x - 2}`} />
                <Arrow d={`M ${mid.x + mid.w / 2} ${rows.ahead + 34} V ${rows.action - 2}`} />
              </g>
            )}
            {k === "utility" && (
              <g>
                <Box x={mid.x} y={rows.happy} w={mid.w} label="How happy I will be" sub="in such a state" tone="green" />
                <Box x={left.x} y={rows.happy} w={left.w} label="Utility" sub="state → number" tone="green" />
                <Arrow d={`M ${left.x + left.w} ${rows.happy + 17} H ${mid.x - 2}`} />
                <Arrow d={`M ${mid.x + mid.w / 2} ${rows.ahead + 34} V ${rows.happy - 2}`} />
                <Arrow d={`M ${mid.x + mid.w / 2} ${rows.happy + 34} V ${rows.action - 2}`} />
              </g>
            )}
          </g>
        )}

        {k === "learning" && (
          <g>
            <Box x={196} y={rows.now} w={160} label="Critic" sub="how well am I doing?" tone="amber" />
            <Arrow d={`M ${sens.x} ${rows.now + 17} H ${356 + 2}`} />
            <Box x={20} y={rows.now} w={150} label="Performance" sub="standard (fixed)" dashed />
            <Arrow d={`M ${170} ${rows.now + 17} H ${196 - 2}`} />
            <Box x={20} y={120} w={140} label="Learning element" sub="makes improvements" tone="green" />
            <Arrow d={`M ${276} ${rows.now + 34} C 276 90, 90 80, 90 118`} color={P.amber} />
            <text x={24} y={96} fill={P.amberSoft} fontSize={9} fontFamily={P.mono}>
              feedback
            </text>
            <Box x={216} y={120} w={284} h={70} label="Performance element" sub="selects actions: any of the four agents" tone="blue" />
            <Arrow d={`M ${160} 130 H ${216 - 2}`} />
            <text x={162} y={124} fill={P.muted} fontSize={9} fontFamily={P.mono}>
              changes
            </text>
            <Arrow d={`M ${216} 146 H ${162}`} />
            <text x={164} y={160} fill={P.muted} fontSize={9} fontFamily={P.mono}>
              knowledge
            </text>
            <Arrow d={`M ${440} ${rows.now + 34} V ${120 - 2}`} />
            <Box x={20} y={rows.action} w={140} label="Problem generator" sub="try something new" tone="green" />
            <Arrow d={`M ${90} ${154} V ${rows.action - 2}`} label="learning goals" lx={96} ly={220} />
            <Arrow d={`M ${160} ${rows.action + 17} H ${actu.x - 2}`} label="exploratory actions" lx={200} ly={rows.action + 10} />
            <Arrow d={`M ${440} ${190} V ${rows.action - 2}`} color={P.blueSoft} />
          </g>
        )}
      </svg>
    </Figure>
  );
}

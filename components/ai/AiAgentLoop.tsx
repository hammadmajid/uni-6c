import { Figure, P } from "@/components/learning/Figure";

const W = 640;
const H = 280;

/** Static figure: the agent–environment loop, with the agent split into architecture (sensors, actuators) and program. */
export function AiAgentLoop() {
  const env = { x: 16, y: 40, w: 190, h: 200 };
  const ag = { x: 300, y: 28, w: 324, h: 224 };
  const sens = { x: ag.x + 16, y: ag.y + 40, w: 136, h: 40 };
  const act = { x: ag.x + 16, y: ag.y + 150, w: 136, h: 40 };
  const prog = { x: ag.x + 170, y: ag.y + 60, w: 136, h: 110 };

  return (
    <Figure
      title="An agent is a loop: percepts in, actions out"
      caption={
        <>
          The environment is everything outside the agent. Sensors turn it into <strong>percepts</strong>, the program picks an <strong>action</strong>, and actuators
          change the environment, which produces the next percept. The dashed box is the <strong>architecture</strong> (the hardware); the blue box is the{" "}
          <strong>program</strong>. Agent = architecture + program.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Agent and environment connected by percepts and actions">
        <defs>
          <marker id="ai-loop-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.text} />
          </marker>
          <marker id="ai-loop-arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={P.blueSoft} />
          </marker>
        </defs>

        {/* Environment */}
        <rect x={env.x} y={env.y} width={env.w} height={env.h} rx={10} fill={P.panel} stroke={P.lineStrong} />
        <text x={env.x + 14} y={env.y + 24} fill={P.textStrong} fontSize={13}>
          Environment
        </text>
        <text x={env.x + 14} y={env.y + 44} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          rooms, roads, a patient,
        </text>
        <text x={env.x + 14} y={env.y + 58} fill={P.muted} fontSize={10} fontFamily={P.mono}>
          a chessboard, a user
        </text>
        {/* two squares, the vacuum world */}
        <rect x={env.x + 24} y={env.y + 100} width={64} height={64} rx={4} fill="rgba(255,178,36,0.10)" stroke={P.amber} />
        <rect x={env.x + 100} y={env.y + 100} width={64} height={64} rx={4} fill={P.bg} stroke={P.lineStrong} />
        <text x={env.x + 56} y={env.y + 136} textAnchor="middle" fill={P.amberSoft} fontSize={11} fontFamily={P.mono}>
          A dirty
        </text>
        <text x={env.x + 132} y={env.y + 136} textAnchor="middle" fill={P.text} fontSize={11} fontFamily={P.mono}>
          B clean
        </text>
        <text x={env.x + 14} y={env.y + 188} fill={P.muted} fontSize={9} fontFamily={P.mono}>
          e.g. the two-square vacuum world
        </text>

        {/* Agent architecture */}
        <rect x={ag.x} y={ag.y} width={ag.w} height={ag.h} rx={10} fill="none" stroke={P.lineStrong} strokeDasharray="5 4" />
        <text x={ag.x + 14} y={ag.y + 20} fill={P.textStrong} fontSize={13}>
          Agent
        </text>
        <text x={ag.x + ag.w - 14} y={ag.y + 20} textAnchor="end" fill={P.muted} fontSize={10} fontFamily={P.mono}>
          architecture (dashed) + program (blue)
        </text>

        <rect x={sens.x} y={sens.y} width={sens.w} height={sens.h} rx={6} fill={P.panel} stroke={P.lineStrong} />
        <text x={sens.x + sens.w / 2} y={sens.y + 18} textAnchor="middle" fill={P.textStrong} fontSize={12}>
          Sensors
        </text>
        <text x={sens.x + sens.w / 2} y={sens.y + 32} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          camera, keyboard
        </text>

        <rect x={act.x} y={act.y} width={act.w} height={act.h} rx={6} fill={P.panel} stroke={P.lineStrong} />
        <text x={act.x + act.w / 2} y={act.y + 18} textAnchor="middle" fill={P.textStrong} fontSize={12}>
          Actuators
        </text>
        <text x={act.x + act.w / 2} y={act.y + 32} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          motors, screen, API
        </text>

        <rect x={prog.x} y={prog.y} width={prog.w} height={prog.h} rx={6} fill="rgba(0,112,243,0.10)" stroke={P.blue} />
        <text x={prog.x + prog.w / 2} y={prog.y + 24} textAnchor="middle" fill={P.blueSoft} fontSize={12}>
          Agent program
        </text>
        <text x={prog.x + prog.w / 2} y={prog.y + 50} textAnchor="middle" fill={P.textStrong} fontSize={12} fontFamily={P.mono}>
          F : P* → A
        </text>
        <text x={prog.x + prog.w / 2} y={prog.y + 74} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          percept history
        </text>
        <text x={prog.x + prog.w / 2} y={prog.y + 88} textAnchor="middle" fill={P.muted} fontSize={9} fontFamily={P.mono}>
          → next action
        </text>

        {/* sensors -> program */}
        <path d={`M ${sens.x + sens.w} ${sens.y + 20} H ${prog.x + 30} V ${prog.y}`} fill="none" stroke={P.blueSoft} strokeWidth={1.4} markerEnd="url(#ai-loop-arrow-blue)" />
        {/* program -> actuators */}
        <path d={`M ${prog.x + 30} ${prog.y + prog.h} V ${act.y + 20} H ${act.x + act.w}`} fill="none" stroke={P.blueSoft} strokeWidth={1.4} markerEnd="url(#ai-loop-arrow-blue)" />

        {/* environment -> sensors : percepts */}
        <path d={`M ${env.x + env.w} ${sens.y + 20} H ${sens.x}`} fill="none" stroke={P.text} strokeWidth={1.4} markerEnd="url(#ai-loop-arrow)" />
        <text x={(env.x + env.w + sens.x) / 2} y={sens.y + 12} textAnchor="middle" fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
          percepts
        </text>
        {/* actuators -> environment : actions */}
        <path d={`M ${act.x} ${act.y + 20} H ${env.x + env.w}`} fill="none" stroke={P.text} strokeWidth={1.4} markerEnd="url(#ai-loop-arrow)" />
        <text x={(env.x + env.w + act.x) / 2} y={act.y + 12} textAnchor="middle" fill={P.textStrong} fontSize={11} fontFamily={P.mono}>
          actions
        </text>

        <text x={W / 2} y={H - 8} textAnchor="middle" fill={P.muted} fontSize={10} fontFamily={P.mono}>
          while (true) &#123; p = sense(); history.push(p); act(F(history)); &#125;
        </text>
      </svg>
    </Figure>
  );
}

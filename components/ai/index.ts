import type { ComponentType } from "react";
import { AiAgentLoop } from "./AiAgentLoop";
import { AiFourApproaches } from "./AiFourApproaches";
import { TuringTestFigure } from "./TuringTestFigure";
import { VacuumWorld } from "./VacuumWorld";
import { AgentArchitectures } from "./AgentArchitectures";

/** MDX components for ai lessons. Spread into lib/mdx-components.tsx. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const aiComponents: Record<string, ComponentType<any>> = {
  AiAgentLoop,
  AiFourApproaches,
  TuringTestFigure,
  VacuumWorld,
  AgentArchitectures,
};

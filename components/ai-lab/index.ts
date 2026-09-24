import type { ComponentType } from "react";
import { PyRangeLab } from "./PyRangeLab";
import { DefaultArgDemo } from "./DefaultArgDemo";
import { CollectionsFigure } from "./CollectionsFigure";
import { AliasFigure } from "./AliasFigure";
import { SetOpsLab } from "./SetOpsLab";
import { AgentTrace } from "./AgentTrace";
import { PySearchLab, SearchGraphFigure } from "./PySearchLab";

/** MDX components for ai-lab lessons. Spread into lib/mdx-components.tsx. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const aiLabComponents: Record<string, ComponentType<any>> = {
  PyRangeLab,
  DefaultArgDemo,
  CollectionsFigure,
  AliasFigure,
  SetOpsLab,
  AgentTrace,
  PySearchLab,
  SearchGraphFigure,
};

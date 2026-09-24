import type { ComponentType } from "react";
import { FileVsDbLab } from "./FileVsDbLab";
import { DbSystemDiagram } from "./DbSystemDiagram";
import { ThreeSchemaDiagram } from "./ThreeSchemaDiagram";
import { TxnInterleaveLab } from "./TxnInterleaveLab";
import { DbActorsSort } from "./DbActorsSort";
import { MiniworldDiagram } from "./MiniworldDiagram";
import { DbActorsDiagram } from "./DbActorsDiagram";

/** MDX components for db lessons. Spread into lib/mdx-components.tsx. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dbComponents: Record<string, ComponentType<any>> = {
  FileVsDbLab,
  DbSystemDiagram,
  ThreeSchemaDiagram,
  TxnInterleaveLab,
  DbActorsSort,
  MiniworldDiagram,
  DbActorsDiagram,
};

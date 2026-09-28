import type { ComponentType } from "react";
import { FileVsDbLab } from "./FileVsDbLab";
import { DbSystemDiagram } from "./DbSystemDiagram";
import { ThreeSchemaDiagram } from "./ThreeSchemaDiagram";
import { TxnInterleaveLab } from "./TxnInterleaveLab";
import { DbActorsSort } from "./DbActorsSort";
import { MiniworldDiagram } from "./MiniworldDiagram";
import { DbActorsDiagram } from "./DbActorsDiagram";
import { ErCarSalesDiagram } from "./ErCarSalesDiagram";
import { ErCarSalesNounPicker } from "./ErCarSalesNounPicker";
import { ErCardinalityExplorer } from "./ErCardinalityExplorer";
import { DbKeyFinderLab } from "./DbKeyFinderLab";
import { ErIdentifyingRelFigure } from "./ErIdentifyingRelFigure";
import { DbKeyHierarchyFigure } from "./DbKeyHierarchyFigure";
import { ErChenSymbols } from "./ErChenSymbols";
import { ErAttributeSort } from "./ErAttributeSort";
import { ErEmployeeDiagram } from "./ErEmployeeDiagram";
import { DbDataModelLadder } from "./DbDataModelLadder";
import { DbSchemaVsState } from "./DbSchemaVsState";
import { DbLanguageSort } from "./DbLanguageSort";
import { DbTiersDiagram } from "./DbTiersDiagram";
import { DbModulesDiagram } from "./DbModulesDiagram";

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
  ErCarSalesDiagram,
  ErCarSalesNounPicker,
  ErCardinalityExplorer,
  DbKeyFinderLab,
  ErIdentifyingRelFigure,
  DbKeyHierarchyFigure,
  ErChenSymbols,
  ErAttributeSort,
  ErEmployeeDiagram,
  DbDataModelLadder,
  DbSchemaVsState,
  DbLanguageSort,
  DbTiersDiagram,
  DbModulesDiagram,
};

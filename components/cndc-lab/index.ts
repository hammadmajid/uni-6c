import type { ComponentType } from "react";
import { WiresharkWindow } from "./WiresharkWindow";
import { FilterLab } from "./FilterLab";
import { LayerSortLab } from "./LayerSortLab";
import { SnifferPlacement } from "./SnifferPlacement";
import { TimeFormats } from "./TimeFormats";

/** MDX components for cndc-lab lessons. Spread into lib/mdx-components.tsx. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cndcLabComponents: Record<string, ComponentType<any>> = {
  WiresharkWindow,
  FilterLab,
  LayerSortLab,
  SnifferPlacement,
  TimeFormats,
};

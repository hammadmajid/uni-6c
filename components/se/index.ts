import type { ComponentType } from "react";
import { SeQualityAttributes } from "./SeQualityAttributes";
import { SeLayeredTechnology } from "./SeLayeredTechnology";
import { SeProcessActivities } from "./SeProcessActivities";
import { SeWaterfallModel } from "./SeWaterfallModel";
import { SeIncrementalModel } from "./SeIncrementalModel";
import { SeReuseModel } from "./SeReuseModel";
import { SeModelFit } from "./SeModelFit";

/** MDX components for se (Software Engineering) lessons. Spread into lib/mdx-components.tsx. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const seComponents: Record<string, ComponentType<any>> = {
  SeQualityAttributes,
  SeLayeredTechnology,
  SeProcessActivities,
  SeWaterfallModel,
  SeIncrementalModel,
  SeReuseModel,
  SeModelFit,
};

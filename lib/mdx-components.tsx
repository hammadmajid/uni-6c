import type { ComponentType } from "react";
import { QuickCheck } from "@/components/learning/QuickCheck";
import { Predict } from "@/components/learning/Predict";
import { OrderCheck } from "@/components/learning/OrderCheck";
import { Callout } from "@/components/learning/Callout";
import { Deeper } from "@/components/learning/Deeper";
import { Further } from "@/components/learning/Further";
import { WorkedExample, Step } from "@/components/learning/WorkedExample";
import { HintLadder } from "@/components/learning/HintLadder";
import { Term } from "@/components/learning/Term";
import { Timeline } from "@/components/learning/Timeline";

import { cndcComponents } from "@/components/cndc";
import { cndcLabComponents } from "@/components/cndc-lab";
import { aiComponents } from "@/components/ai";
import { aiLabComponents } from "@/components/ai-lab";
import { dbComponents } from "@/components/db";
import { webTechComponents } from "@/components/web-tech";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mdxComponents: Record<string, ComponentType<any>> = {
  QuickCheck,
  Predict,
  OrderCheck,
  Callout,
  Deeper,
  Further,
  WorkedExample,
  Step,
  HintLadder,
  Term,
  Timeline,
  ...cndcComponents,
  ...cndcLabComponents,
  ...aiComponents,
  ...aiLabComponents,
  ...dbComponents,
  ...webTechComponents,
};

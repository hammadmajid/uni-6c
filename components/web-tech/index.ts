import type { ComponentType } from "react";
import { HttpExchange } from "./HttpExchange";
import { UrlAnatomy } from "./UrlAnatomy";
import { TomcatTree } from "./TomcatTree";
import { WarBuild } from "./WarBuild";
import { ServletLifecycle } from "./ServletLifecycle";
import { SharedFieldRace } from "./SharedFieldRace";
import { FormToServletLab } from "./FormToServletLab";
import { JvmMemoryStepper } from "./JvmMemoryStepper";
import { RefTypeLab } from "./RefTypeLab";

/** MDX components for web-tech lessons. Spread into lib/mdx-components.tsx. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const webTechComponents: Record<string, ComponentType<any>> = {
  HttpExchange,
  UrlAnatomy,
  TomcatTree,
  WarBuild,
  ServletLifecycle,
  SharedFieldRace,
  FormToServletLab,
  JvmMemoryStepper,
  RefTypeLab,
};

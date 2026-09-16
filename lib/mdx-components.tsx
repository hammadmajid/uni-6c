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
import { DelayLab } from "@/components/cndc/DelayLab";
import { QueueingLab } from "@/components/cndc/QueueingLab";
import { SwitchingLab } from "@/components/cndc/SwitchingLab";
import { EncapsulationExplorer } from "@/components/cndc/EncapsulationExplorer";
import { ThroughputLab } from "@/components/cndc/ThroughputLab";
import { SharedMediumLab } from "@/components/cndc/SharedMediumLab";
import { InternetMap } from "@/components/cndc/InternetMap";
import { ProtocolExchange } from "@/components/cndc/ProtocolExchange";
import { AccessTechDiagram } from "@/components/cndc/AccessTechDiagram";
import { MediaChart } from "@/components/cndc/MediaChart";
import { LayerStacks } from "@/components/cndc/LayerStacks";
import { HopDiagram } from "@/components/cndc/HopDiagram";
import { MultiplexingDiagram } from "@/components/cndc/MultiplexingDiagram";
import { StatMuxStrip } from "@/components/cndc/StatMuxStrip";
import { CaravanDiagram } from "@/components/cndc/CaravanDiagram";
import { IntensityCurve } from "@/components/cndc/IntensityCurve";
import { BottleneckPipes } from "@/components/cndc/BottleneckPipes";
import { TracerouteMap } from "@/components/cndc/TracerouteMap";

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
  DelayLab,
  QueueingLab,
  SwitchingLab,
  EncapsulationExplorer,
  ThroughputLab,
  SharedMediumLab,
  InternetMap,
  ProtocolExchange,
  AccessTechDiagram,
  MediaChart,
  LayerStacks,
  HopDiagram,
  MultiplexingDiagram,
  StatMuxStrip,
  CaravanDiagram,
  IntensityCurve,
  BottleneckPipes,
  TracerouteMap,
};

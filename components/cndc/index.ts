import type { ComponentType } from "react";
import { DelayLab } from "./DelayLab";
import { QueueingLab } from "./QueueingLab";
import { SwitchingLab } from "./SwitchingLab";
import { EncapsulationExplorer } from "./EncapsulationExplorer";
import { ThroughputLab } from "./ThroughputLab";
import { SharedMediumLab } from "./SharedMediumLab";
import { InternetMap } from "./InternetMap";
import { ProtocolExchange } from "./ProtocolExchange";
import { AccessTechDiagram } from "./AccessTechDiagram";
import { MediaChart } from "./MediaChart";
import { LayerStacks } from "./LayerStacks";
import { HopDiagram } from "./HopDiagram";
import { MultiplexingDiagram } from "./MultiplexingDiagram";
import { StatMuxStrip } from "./StatMuxStrip";
import { CaravanDiagram } from "./CaravanDiagram";
import { IntensityCurve } from "./IntensityCurve";
import { BottleneckPipes } from "./BottleneckPipes";
import { TracerouteMap } from "./TracerouteMap";
import { SocketDoor } from "./SocketDoor";
import { AppArchitectures } from "./AppArchitectures";
import { HttpTimingLab } from "./HttpTimingLab";
import { ConditionalGet } from "./ConditionalGet";
import { MailPath } from "./MailPath";
import { FtpConnections } from "./FtpConnections";
import { DnsWalk } from "./DnsWalk";
import { TcpSockets } from "./TcpSockets";
import { DnsHierarchy } from "./DnsHierarchy";
import { NetworkScales } from "./NetworkScales";
import { NetworkRoles } from "./NetworkRoles";
import { TopologyLab } from "./TopologyLab";
import { MediaTree } from "./MediaTree";
import { MediaCutaway } from "./MediaCutaway";
import { ImpairmentLab } from "./ImpairmentLab";
import { RangeBandwidthMap } from "./RangeBandwidthMap";

/** MDX components for cndc lessons. Spread into lib/mdx-components.tsx. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cndcComponents: Record<string, ComponentType<any>> = {
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
  SocketDoor,
  AppArchitectures,
  HttpTimingLab,
  ConditionalGet,
  MailPath,
  FtpConnections,
  DnsWalk,
  TcpSockets,
  DnsHierarchy,
  NetworkScales,
  NetworkRoles,
  TopologyLab,
  MediaTree,
  MediaCutaway,
  ImpairmentLab,
  RangeBandwidthMap,
};

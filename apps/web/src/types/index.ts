/**
 * EdgeSphere Console — Product-Accurate Domain Types
 *
 * Grounded in the planned hardware architecture:
 * - Raspberry Pi 5 (Edge Intelligence Manager / Gateway)
 * - 5 Planned Embedded TinyML Nodes (Arduino Nano 33 BLE Sense + 4 ESP32 variants)
 */

export type HardwareMode = 'simulation' | 'hardware';

export type NodeIntegrationState =
  | 'simulated'
  | 'configured'
  | 'connected'
  | 'awaiting_integration'
  | 'fault';

export type GatewayServiceStatus = 'active' | 'degraded' | 'unconfigured' | 'offline';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'mitigating' | 'resolved';

export type TinyMLDeploymentState =
  | 'deployed'
  | 'staged'
  | 'compiling'
  | 'failed'
  | 'not_configured';

/* ── Edge Gateway (Raspberry Pi 5) ── */
export interface EdgeGatewayService {
  name: string;
  role: string;
  port?: number;
  status: GatewayServiceStatus;
  detail: string;
}

export interface EdgeGateway {
  id: string;
  name: string;
  hardwareModel: string;
  role: string;
  host: string;
  os: string;
  uptimeSeconds: number;
  status: GatewayServiceStatus;
  mode: HardwareMode;
  cpuLoadPct: number;
  thermalTempC: number;
  ramUsageMb: number;
  ramTotalMb: number;
  storageUsageGb: number;
  storageTotalGb: number;
  services: EdgeGatewayService[];
  lastSyncTimestamp: string;
}

/* ── Planned Embedded TinyML Nodes ── */
export interface PlannedNodePinout {
  bus: 'I2C' | 'SPI' | 'UART' | 'ADC' | 'GPIO' | 'BLE';
  pins: string;
  clockOrBaud?: string;
}

export interface PlannedNode {
  id: string;
  name: string;
  targetMcu: string;
  onboardSensors: string[];
  role: string;
  intendedTinyML: string;
  commsBus: string;
  pinout: PlannedNodePinout[];
  integrationState: NodeIntegrationState;
  mqttTopic: string;
  lastSeenTimestamp: string | null;
  activeModelId: string | null;
  recentSignals: Record<string, number | string | boolean> | null;
  rawPayloadSnippet: string | null;
  packetCount: number;
}

/* ── Telemetry Pipeline ── */
export interface TelemetryPipelineHealth {
  brokerEngine: string;
  messagesReceivedTotal: number;
  lastPacketTimestamp: string | null;
  ingestionRatePerSec: number;
  bufferOccupancyBytes: number;
  droppedPacketsCount: number;
  pipelineHealth: 'nominal' | 'degraded' | 'idle' | 'unconfigured';
}

/* ── Model Registry & Artifacts ── */
export interface TinyMLModelArtifact {
  id: string;
  name: string;
  version: string;
  targetNodeId: string;
  targetMcu: string;
  format: 'TFLite Micro (INT8)' | 'Edge Impulse C++' | 'CMSIS-NN' | 'Raw Tensor';
  flashFootprintKb: number;
  ramFootprintKb: number;
  sha256: string;
  deploymentState: TinyMLDeploymentState;
  benchmarkLatencyMs?: number;
  description: string;
}

/* ── Incidents & Faults ── */
export interface EdgeIncident {
  id: string;
  title: string;
  nodeId?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: string;
  resolvedAt?: string;
  description: string;
  remediationStep?: string;
}

/* ── Operational Events Log ── */
export type EventSeverity = 'info' | 'success' | 'warning' | 'error';

export interface OperationalLogEvent {
  id: string;
  timestamp: string;
  severity: EventSeverity;
  source: string;
  message: string;
  payloadJson?: string;
}

/* ── Metric Specification for Disclosures ── */
export interface MetricDefinition {
  name: string;
  unit: string;
  timeWindow: string;
  aggregation: string;
  dataSource: string;
  description: string;
}

/* ── Backward Compatibility Types for Charts & Reporting ── */
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | '90d' | 'custom';
export type DeviceStatus = 'online' | 'degraded' | 'offline';
export type HealthLevel = 'healthy' | 'warning' | 'critical';
export type DeploymentStatus = 'pending' | 'rolling_out' | 'completed' | 'failed' | 'rolled_back';
export type EventType = EventSeverity;
export type OperationalEvent = OperationalLogEvent;
export type Incident = EdgeIncident;

export interface KpiMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label: string;
  };
  description?: string;
  sparkline?: number[];
  accentColor?: string;
}

export interface Deployment {
  id: string;
  name: string;
  modelName: string;
  version: string;
  status: DeploymentStatus;
  targetDevices: number;
  completedDevices: number;
  startedAt: string;
  completedAt?: string;
  initiatedBy: string;
}

/* ── All-Day Summary ── */
export interface DailySummary {
  date: string;
  timezone: string;
  windowStart: string;
  windowEnd: string;
  generatedAt: string;
  mode: 'rule_based' | 'local_model' | 'cloud_ai';
  executiveSummary: string;
  fleetStatus: {
    total: number;
    online: number;
    offline: number;
    degraded: number;
    gatewayStatus: string;
    missedHeartbeats: number;
  };
  telemetry: {
    messagesTotal: number;
    gapsDetected: number;
    peakRate: number;
    peakTime: string;
  };
  incidents: {
    newCount: number;
    resolvedCount: number;
    activeCount: number;
    criticalCount: number;
  };
  node3Motor: {
    trend: string;
    rmsVibrationG: number;
    healthScore: number;
    anomalyDetected: boolean;
    recommendation: string;
  };
  deployments: {
    queued: number;
    succeeded: number;
    failed: number;
  };
  recommendations: Array<{ priority: 'high' | 'medium' | 'low'; action: string; link?: string }>;
  caveats: string[];
}

/* ── Explainable AI Chat ── */
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  evidenceLinks?: Array<{ title: string; target: string; value?: string }>;
  uncertainty?: string;
  suggestedActions?: string[];
  caveats?: string;
}

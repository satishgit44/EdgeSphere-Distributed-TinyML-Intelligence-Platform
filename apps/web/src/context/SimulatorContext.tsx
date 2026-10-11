import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  EdgeGateway,
  PlannedNode,
  TelemetryPipelineHealth,
  TinyMLModelArtifact,
  EdgeIncident,
  OperationalLogEvent,
  HardwareMode,
} from '@/types';
import {
  DEFAULT_GATEWAY_ACTIVE,
  DEFAULT_GATEWAY_UNCONFIGURED,
  DEFAULT_PLANNED_NODES,
  DEFAULT_PIPELINE_ACTIVE,
  DEFAULT_PIPELINE_UNCONFIGURED,
  DEFAULT_MODELS,
  DEFAULT_INCIDENTS_ACTIVE,
  DEFAULT_LOG_EVENTS,
} from '@/data/simulator';

export interface DeviceMeta {
  location: string;
  isOn: boolean;
  icon: 'fan' | 'cpu' | 'mic' | 'vibration' | 'motion' | 'air';
}

export interface RegisterNodeResult {
  success: boolean;
  error?: string;
}

interface SimulatorContextValue {
  gateway: EdgeGateway;
  nodes: PlannedNode[];
  pipeline: TelemetryPipelineHealth;
  models: TinyMLModelArtifact[];
  incidents: EdgeIncident[];
  logs: OperationalLogEvent[];
  mode: HardwareMode;
  isSimulatorRunning: boolean;
  isFreshInstall: boolean;
  selectedNode: PlannedNode | null;
  customDeviceMeta: Record<string, DeviceMeta>;
  setSelectedNode: (node: PlannedNode | null) => void;
  resetToFreshInstall: () => void;
  startSimulatorFleet: () => void;
  toggleSimulatorRunning: () => void;
  injectSensorFault: (nodeId?: string) => void;
  resolveIncident: (id: string) => void;
  transmitSingleBurst: () => void;
  registerNode: (node: PlannedNode, meta?: Partial<DeviceMeta>) => RegisterNodeResult;
}

/* oxlint-disable react/only-export-components */
export const SimulatorContext = createContext<SimulatorContextValue | null>(null);

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [isFreshInstall, setIsFreshInstall] = useState(false);
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(true);
  const [mode] = useState<HardwareMode>('simulation');

  const [gateway, setGateway] = useState<EdgeGateway>(DEFAULT_GATEWAY_ACTIVE);
  const [nodes, setNodes] = useState<PlannedNode[]>(DEFAULT_PLANNED_NODES);
  const [pipeline, setPipeline] = useState<TelemetryPipelineHealth>(DEFAULT_PIPELINE_ACTIVE);
  const [models] = useState<TinyMLModelArtifact[]>(DEFAULT_MODELS);
  const [incidents, setIncidents] = useState<EdgeIncident[]>(DEFAULT_INCIDENTS_ACTIVE);
  const [logs, setLogs] = useState<OperationalLogEvent[]>(DEFAULT_LOG_EVENTS);
  const [selectedNode, setSelectedNode] = useState<PlannedNode | null>(null);
  const [customDeviceMeta, setCustomDeviceMeta] = useState<Record<string, DeviceMeta>>({});

  /* Reset to completely fresh install (Empty state requirement!) */
  const resetToFreshInstall = useCallback(() => {
    setIsFreshInstall(true);
    setIsSimulatorRunning(false);
    setGateway(DEFAULT_GATEWAY_UNCONFIGURED);
    setCustomDeviceMeta({});
    setNodes(
      DEFAULT_PLANNED_NODES.map((n) => ({
        ...n,
        integrationState: 'awaiting_integration',
        lastSeenTimestamp: null,
        recentSignals: null,
        rawPayloadSnippet: null,
        packetCount: 0,
      })),
    );
    setPipeline(DEFAULT_PIPELINE_UNCONFIGURED);
    setIncidents([]);
    setLogs([
      {
        id: `evt-reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'warning',
        source: 'system-manager',
        message: 'System reset to fresh install. Gateway unconfigured, awaiting edge hardware pairing.',
      },
    ]);
  }, []);

  /* Start or re-activate the simulator fleet */
  const startSimulatorFleet = useCallback(() => {
    setIsFreshInstall(false);
    setIsSimulatorRunning(true);
    setGateway(DEFAULT_GATEWAY_ACTIVE);
    setNodes(DEFAULT_PLANNED_NODES);
    setCustomDeviceMeta({});
    setPipeline(DEFAULT_PIPELINE_ACTIVE);
    setIncidents(DEFAULT_INCIDENTS_ACTIVE);
    setLogs((prev) => [
      {
        id: `evt-start-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'info',
        source: 'simulator-coordinator',
        message: 'Simulator test fleet initialized with Raspberry Pi 5 Gateway + 5 planned nodes.',
      },
      ...prev,
    ]);
  }, []);

  /* Pause / Resume simulator ingestion */
  const toggleSimulatorRunning = useCallback(() => {
    setIsSimulatorRunning((prev) => {
      const nextState = !prev;
      setPipeline((p) => ({
        ...p,
        pipelineHealth: nextState ? 'nominal' : 'idle',
        ingestionRatePerSec: nextState ? 2.4 : 0,
      }));
      setLogs((l) => [
        {
          id: `evt-pause-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: nextState ? 'info' : 'warning',
          source: 'simulator-coordinator',
          message: nextState ? 'Simulator ingestion resumed.' : 'Simulator ingestion paused by operator.',
        },
        ...l,
      ]);
      return nextState;
    });
  }, []);

  /* Inject real fault into ADXL345 node */
  const injectSensorFault = useCallback((nodeId = 'node-esp32-adxl345') => {
    const faultId = `INC-FAULT-${Date.now().toString().slice(-4)}`;
    const newIncident: EdgeIncident = {
      id: faultId,
      title: 'ADXL345 High-G Resonance Anomaly / SPI Overrun',
      nodeId,
      severity: 'critical',
      status: 'open',
      detectedAt: new Date().toISOString(),
      description: 'SPI FIFO buffer overrun flag set on ADXL345. Sensor acceleration exceeded ±16g threshold.',
      remediationStep: 'Reset SPI clock prescaler on ESP32 or restart task.',
    };

    setIncidents((prev) => [newIncident, ...prev]);

    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              integrationState: 'fault',
              recentSignals: { ...n.recentSignals, fault_flag: true, vib_rms_g: 2.84 },
            }
          : n,
      ),
    );

    setPipeline((p) => ({
      ...p,
      droppedPacketsCount: p.droppedPacketsCount + 1,
      pipelineHealth: 'degraded',
    }));

    setLogs((prev) => [
      {
        id: `evt-fault-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'error',
        source: 'sensor-adxl345',
        message: `Fault injected on ${nodeId}: SPI FIFO Overrun / Resonance Trigger`,
      },
      ...prev,
    ]);
  }, []);

  /* Resolve an incident */
  const resolveIncident = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? { ...inc, status: 'resolved', resolvedAt: new Date().toISOString() }
          : inc,
      ),
    );

    setNodes((prev) =>
      prev.map((n) => (n.integrationState === 'fault' ? { ...n, integrationState: 'simulated' } : n)),
    );

    setPipeline((p) => ({ ...p, pipelineHealth: 'nominal' }));

    setLogs((prev) => [
      {
        id: `evt-res-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'success',
        source: 'incident-manager',
        message: `Incident ${id} marked as resolved by operator. Device recovered.`,
      },
      ...prev,
    ]);
  }, []);

  /* Transmit single manual telemetry burst */
  const transmitSingleBurst = useCallback(() => {
    if (isFreshInstall) return;
    const nowIso = new Date().toISOString();

    setNodes((prev) =>
      prev.map((n) => {
        if (n.integrationState !== 'simulated' && n.integrationState !== 'connected') return n;
        return {
          ...n,
          packetCount: n.packetCount + 1,
          lastSeenTimestamp: nowIso,
        };
      }),
    );

    setPipeline((p) => ({
      ...p,
      messagesReceivedTotal: p.messagesReceivedTotal + 3,
      lastPacketTimestamp: nowIso,
    }));

    setLogs((prev) => [
      {
        id: `evt-burst-${Date.now()}`,
        timestamp: nowIso,
        severity: 'info',
        source: 'telemetry-bus',
        message: 'Manual telemetry burst accepted from 3 active simulated nodes (3 packets ingested).',
      },
      ...prev,
    ]);
  }, [isFreshInstall]);

  /* Register a new edge node (Phase B: Real in-memory frontend registration) */
  const registerNode = useCallback(
    (newNode: PlannedNode, meta?: Partial<DeviceMeta>): RegisterNodeResult => {
      const trimmedId = newNode.id?.trim();
      const trimmedName = newNode.name?.trim();

      if (!trimmedId) {
        return { success: false, error: 'Device ID is required.' };
      }
      if (!trimmedName) {
        return { success: false, error: 'Device name is required.' };
      }
      // Check for duplicate ID case-insensitively across existing nodes
      if (nodes.some((n) => n.id.toLowerCase() === trimmedId.toLowerCase())) {
        return { success: false, error: `Device ID "${trimmedId}" already exists in the fleet registry.` };
      }

      setNodes((prev) => [...prev, newNode]);
      setCustomDeviceMeta((prev) => ({
        ...prev,
        [newNode.id]: {
          location: meta?.location?.trim() || 'Unassigned Facility',
          isOn: meta?.isOn ?? false,
          icon: meta?.icon || 'cpu',
        },
      }));

      setLogs((prev) => [
        {
          id: `evt-reg-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: 'info',
          source: 'device-registry',
          message: `Registered new node: ${newNode.name} (${newNode.id}) marked as ${newNode.integrationState}.`,
        },
        ...prev,
      ]);

      return { success: true };
    },
    [nodes]
  );

  return (
    <SimulatorContext.Provider
      value={{
        gateway,
        nodes,
        pipeline,
        models,
        incidents,
        logs,
        mode,
        isSimulatorRunning,
        isFreshInstall,
        selectedNode,
        customDeviceMeta,
        setSelectedNode,
        resetToFreshInstall,
        startSimulatorFleet,
        toggleSimulatorRunning,
        injectSensorFault,
        resolveIncident,
        transmitSingleBurst,
        registerNode,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator(): SimulatorContextValue {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
}

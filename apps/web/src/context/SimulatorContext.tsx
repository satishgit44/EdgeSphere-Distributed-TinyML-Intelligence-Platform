import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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
import {
  getTelemetrySimulator,
  type TelemetryPoint,
  type LivePrediction,
  type FftHarmonic,
} from '@/services/telemetrySimulator';
import {
  loadPersistedState,
  savePersistedState,
  clearPersistedState,
} from '@/services/telemetryStorage';

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
  history: TelemetryPoint[];
  predictions: Record<string, LivePrediction>;
  fftHarmonics: FftHarmonic[];
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
  // 1. Initial State from Storage (if available)
  const persisted = loadPersistedState();

  const [isFreshInstall, setIsFreshInstall] = useState(persisted?.isFreshInstall ?? false);
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(persisted?.isSimulatorRunning ?? true);
  const [mode] = useState<HardwareMode>('simulation');

  // Baseline nodes combined with persisted custom nodes
  const initialNodes: PlannedNode[] = persisted?.customNodes && persisted.customNodes.length > 0
    ? [...DEFAULT_PLANNED_NODES, ...persisted.customNodes]
    : DEFAULT_PLANNED_NODES;

  const [nodes, setNodes] = useState<PlannedNode[]>(initialNodes);
  const [customDeviceMeta, setCustomDeviceMeta] = useState<Record<string, DeviceMeta>>(
    persisted?.customDeviceMeta ?? {},
  );
  const [gateway, setGateway] = useState<EdgeGateway>(
    isFreshInstall ? DEFAULT_GATEWAY_UNCONFIGURED : DEFAULT_GATEWAY_ACTIVE,
  );
  const [pipeline, setPipeline] = useState<TelemetryPipelineHealth>(
    isFreshInstall ? DEFAULT_PIPELINE_UNCONFIGURED : DEFAULT_PIPELINE_ACTIVE,
  );
  const [models] = useState<TinyMLModelArtifact[]>(DEFAULT_MODELS);
  const [incidents, setIncidents] = useState<EdgeIncident[]>(
    persisted?.incidents ?? DEFAULT_INCIDENTS_ACTIVE,
  );
  const [logs, setLogs] = useState<OperationalLogEvent[]>(DEFAULT_LOG_EVENTS);
  const [selectedNode, setSelectedNode] = useState<PlannedNode | null>(null);

  // Live telemetry stream state from the Simulator Engine
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [predictions, setPredictions] = useState<Record<string, LivePrediction>>({});
  const [fftHarmonics, setFftHarmonics] = useState<FftHarmonic[]>([]);

  // 2. Initialize and subscribe to the decoupled TelemetrySimulator engine
  useEffect(() => {
    const sim = getTelemetrySimulator({
      initialNodes,
      initialIncidents: incidents,
      isRunning: isSimulatorRunning,
      isFreshInstall,
    });

    const unsubscribe = sim.subscribe((simState) => {
      setGateway(simState.gateway);
      setNodes(simState.nodes);
      setPipeline(simState.pipeline);
      setIncidents(simState.incidents);
      setHistory(simState.history);
      setPredictions(simState.predictions);
      setFftHarmonics(simState.fftHarmonics);
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // 3. Keep storage in sync with user mutations
  useEffect(() => {
    // Only persist custom nodes that are beyond the 5 initial baseline nodes
    const baselineIds = new Set(DEFAULT_PLANNED_NODES.map((n) => n.id));
    const customNodes = nodes.filter((n) => !baselineIds.has(n.id));

    savePersistedState({
      customNodes,
      customDeviceMeta,
      isSimulatorRunning,
      isFreshInstall,
      incidents,
    });
  }, [nodes, customDeviceMeta, isSimulatorRunning, isFreshInstall, incidents]);

  /* Reset to completely fresh install */
  const resetToFreshInstall = useCallback(() => {
    setIsFreshInstall(true);
    setIsSimulatorRunning(false);
    setGateway(DEFAULT_GATEWAY_UNCONFIGURED);
    setCustomDeviceMeta({});
    clearPersistedState();

    const sim = getTelemetrySimulator();
    sim.setFreshInstall(true);

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

    const sim = getTelemetrySimulator();
    sim.setFreshInstall(false);
    sim.setNodes(DEFAULT_PLANNED_NODES);
    sim.setIncidents(DEFAULT_INCIDENTS_ACTIVE);
    sim.start();

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
      const sim = getTelemetrySimulator();
      if (nextState) {
        sim.start();
      } else {
        sim.pause();
      }

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
    const sim = getTelemetrySimulator();
    sim.injectFault(nodeId);

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
    const sim = getTelemetrySimulator();
    sim.resolveFault(id);

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
    const sim = getTelemetrySimulator();
    sim.step(1000);

    const nowIso = new Date().toISOString();
    setLogs((prev) => [
      {
        id: `evt-burst-${Date.now()}`,
        timestamp: nowIso,
        severity: 'info',
        source: 'telemetry-bus',
        message: 'Manual telemetry burst accepted from active simulated nodes.',
      },
      ...prev,
    ]);
  }, [isFreshInstall]);

  /* Register a new edge node (Phase B & C: dynamically joins simulation) */
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

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setCustomDeviceMeta((prev) => ({
        ...prev,
        [newNode.id]: {
          location: meta?.location?.trim() || 'Unassigned Facility',
          isOn: meta?.isOn ?? false,
          icon: meta?.icon || 'cpu',
        },
      }));

      // Update simulator engine with new node
      const sim = getTelemetrySimulator();
      sim.setNodes(updatedNodes);

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
        history,
        predictions,
        fftHarmonics,
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

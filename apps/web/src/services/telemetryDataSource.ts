/**
 * EdgeSphere Telemetry Data Source Abstraction
 *
 * Defines the service boundary between UI consumption layers and underlying
 * telemetry providers (in-browser simulator vs. future production gateway brokers).
 */

import type { PlannedNode, EdgeGateway, TelemetryPipelineHealth, EdgeIncident } from '@/types';
import {
  getTelemetrySimulator,
  type TelemetryPoint,
  type LivePrediction,
  type FftHarmonic,
  type SimulatorState,
  TelemetrySimulator,
} from './telemetrySimulator';

/**
 * Snapshot of fleet telemetry and TinyML states at an instant.
 */
export interface TelemetrySnapshot {
  readonly isRunning: boolean;
  readonly gateway: EdgeGateway;
  readonly nodes: PlannedNode[];
  readonly pipeline: TelemetryPipelineHealth;
  readonly incidents: EdgeIncident[];
  readonly history: TelemetryPoint[];
  readonly predictions: Record<string, LivePrediction>;
  readonly fftHarmonics: FftHarmonic[];
}

/**
 * Service Boundary: Common contract for telemetry streaming and control.
 */
export interface TelemetryDataSource {
  /** Identifier of the data source provider (e.g. 'local-simulation', 'mqtt-gateway') */
  readonly id: string;
  /** Human-readable provider label */
  readonly label: string;
  /** True if the data source is currently streaming live telemetry */
  readonly isStreaming: boolean;
  /** Discloses whether data originates from real silicon or local synthesis */
  readonly isSimulated: boolean;

  /** Get the current instantaneous fleet snapshot */
  getSnapshot(): TelemetrySnapshot;

  /** Subscribe to continuous telemetry updates */
  subscribe(listener: (snapshot: TelemetrySnapshot) => void): () => void;

  /** Pause or resume the continuous stream */
  setRunning(running: boolean): void;

  /** Inject an anomalous fault condition for hardware testing */
  injectFault(nodeId?: string): void;

  /** Clear an existing fault and initiate restorative relaxation */
  clearFault(incidentId: string): void;

  /** Cleanly tear down timers or network sockets */
  dispose(): void;
}

/**
 * Active Implementation: Local In-Browser Physics & TinyML Simulation Engine.
 */
export class SimulatorTelemetryDataSource implements TelemetryDataSource {
  readonly id = 'local-simulation-v1';
  readonly label = 'Local Simulation Engine (Continuous Local Telemetry)';
  readonly isSimulated = true;

  private sim: TelemetrySimulator;

  constructor(options?: { initialNodes?: PlannedNode[]; isRunning?: boolean }) {
    this.sim = getTelemetrySimulator({
      initialNodes: options?.initialNodes,
      isRunning: options?.isRunning ?? true,
    });
  }

  get isStreaming(): boolean {
    return this.sim.getState().isRunning;
  }

  getSnapshot(): TelemetrySnapshot {
    const s: SimulatorState = this.sim.getState();
    return {
      isRunning: s.isRunning,
      gateway: s.gateway,
      nodes: s.nodes,
      pipeline: s.pipeline,
      incidents: s.incidents,
      history: s.history,
      predictions: s.predictions,
      fftHarmonics: s.fftHarmonics,
    };
  }

  subscribe(listener: (snapshot: TelemetrySnapshot) => void): () => void {
    return this.sim.subscribe((s: SimulatorState) => {
      listener({
        isRunning: s.isRunning,
        gateway: s.gateway,
        nodes: s.nodes,
        pipeline: s.pipeline,
        incidents: s.incidents,
        history: s.history,
        predictions: s.predictions,
        fftHarmonics: s.fftHarmonics,
      });
    });
  }

  setRunning(running: boolean): void {
    if (running) {
      this.sim.start();
    } else {
      this.sim.pause();
    }
  }

  injectFault(nodeId?: string): void {
    this.sim.injectFault(nodeId);
  }

  clearFault(incidentId: string): void {
    this.sim.resolveFault(incidentId);
  }

  dispose(): void {
    this.sim.destroy();
  }
}

/**
 * Planned Production Implementation: MQTT / WebSocket Gateway Adapter.
 *
 * Status: PLANNED (Phase D) — Not currently active.
 * Physical Raspberry Pi 5 broker connection and hardware network protocols
 * must not be claimed until physical integration is complete.
 */
export class PlannedMqttGatewayDataSource implements TelemetryDataSource {
  readonly id = 'mqtt-gateway-planned';
  readonly label = 'Raspberry Pi 5 MQTT Broker Gateway (Planned Production)';
  readonly isStreaming = false;
  readonly isSimulated = false;

  getSnapshot(): TelemetrySnapshot {
    throw new Error(
      'PlannedMqttGatewayDataSource is not implemented. Phase D production MQTT connectivity is planned.',
    );
  }

  subscribe(): () => void {
    throw new Error(
      'PlannedMqttGatewayDataSource is not implemented. Use SimulatorTelemetryDataSource.',
    );
  }

  setRunning(): void {
    throw new Error('MQTT Gateway connection control not implemented.');
  }

  injectFault(): void {
    throw new Error('Hardware fault injection over MQTT requires production broker.');
  }

  clearFault(): void {
    throw new Error('Hardware fault clear requires production broker.');
  }

  dispose(): void {
    // No-op for uninstantiated adapter
  }
}

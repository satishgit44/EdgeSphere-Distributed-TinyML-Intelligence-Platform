/**
 * EdgeSphere Console — Continuous Telemetry & Edge AI Simulator Engine
 *
 * Requirements (Phase C):
 * 1. Cleanly separated from React UI — pure TypeScript simulation engine.
 * 2. 5 initial baseline nodes (strictly immutable architecture):
 *    - Node 1: Arduino Nano 33 BLE Sense (IMU / gesture / sound SPL)
 *    - Node 2: ESP32 + MAX9814 (acoustic classification, noise floor, SNR)
 *    - Node 3: ESP32 + ADXL345 (vibration monitoring, 3-axis RMS, FFT harmonics, bearing health)
 *    - Node 4: ESP32 + PIR + HC-SR04 (zone presence & ultrasonic distance)
 *    - Node 5: ESP32 + MQ135 + BME680 (air quality, CO2/VOC ppm, temperature, humidity)
 * 3. Dynamic nodes: Registered Phase B nodes participate seamlessly.
 * 4. Bounded history buffer: Retains 120-300 samples with FIFO pruning.
 * 5. Smooth drift & physical bounds: Realistic math, no sudden erratic spikes except deliberate faults.
 * 6. Node 3 Motor Predictive Maintenance: Realistic bearing fault injection, peak 120Hz harmonic,
 *    and smooth exponential relaxation recovery (no instant teleporting values).
 * 7. Live rule-based TinyML predictions with explicit simulation disclosure.
 * 8. Deterministic `step(deltaMs)` mode for headless testability.
 */

import type { PlannedNode, EdgeIncident, TelemetryPipelineHealth, EdgeGateway } from '@/types';
import {
  DEFAULT_PLANNED_NODES,
  DEFAULT_GATEWAY_ACTIVE,
  DEFAULT_PIPELINE_ACTIVE,
  DEFAULT_INCIDENTS_ACTIVE,
} from '@/data/simulator';

export interface TelemetryPoint {
  timestamp: string;
  timeLabel: string; // "14:02:30"
  gatewayTemp: number; // Celsius (e.g. 42-45°C)
  gatewayCpu: number; // % (e.g. 12-20%)
  ingestionRate: number; // msg/s
  latencyMs: number; // ms
  dataUsageMb: number; // Cumulative MB
  node3RmsG: number; // g
  node3FreqHz: number; // Hz
}

export interface LivePrediction {
  nodeId: string;
  modelId: string;
  predictionClass: string;
  confidence: number;
  latencyMs: number;
  anomalyScore: number;
  explanation: string;
  inferenceType: 'Simulated Rule-Based TinyML Inference';
  timestamp: string;
}

export interface FftHarmonic {
  freq: string;
  power: number;
  baseline: number;
}

export interface SimulatorState {
  isRunning: boolean;
  isFreshInstall: boolean;
  tickCount: number;
  gateway: EdgeGateway;
  nodes: PlannedNode[];
  pipeline: TelemetryPipelineHealth;
  incidents: EdgeIncident[];
  history: TelemetryPoint[];
  predictions: Record<string, LivePrediction>;
  fftHarmonics: FftHarmonic[];
}

export interface SimulatorOptions {
  tickIntervalMs?: number;
  maxHistoryPoints?: number;
  initialNodes?: PlannedNode[];
  initialIncidents?: EdgeIncident[];
  isRunning?: boolean;
  isFreshInstall?: boolean;
}

export class TelemetrySimulator {
  private isRunning: boolean;
  private isFreshInstall: boolean;
  private tickIntervalMs: number;
  private maxHistoryPoints: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(state: SimulatorState) => void> = new Set();

  private state: SimulatorState;

  // Internal smooth drift state
  private driftPhase = 0;
  private node3TargetRms = 0.018;
  private node3CurrentRms = 0.018;
  private node3TargetFreq = 124.6;
  private node3CurrentFreq = 124.6;
  private node3HealthIndex = 0.96;
  private totalDataUsageMb = 1228.8; // ~1.2 GB baseline

  constructor(options: SimulatorOptions = {}) {
    this.tickIntervalMs = options.tickIntervalMs ?? 1000;
    this.maxHistoryPoints = options.maxHistoryPoints ?? 120;
    this.isRunning = options.isRunning ?? true;
    this.isFreshInstall = options.isFreshInstall ?? false;

    const baseNodes = (options.initialNodes && options.initialNodes.length > 0)
      ? options.initialNodes
      : DEFAULT_PLANNED_NODES;

    const baseIncidents = options.initialIncidents ?? DEFAULT_INCIDENTS_ACTIVE;

    this.state = {
      isRunning: this.isRunning,
      isFreshInstall: this.isFreshInstall,
      tickCount: 0,
      gateway: { ...DEFAULT_GATEWAY_ACTIVE },
      nodes: JSON.parse(JSON.stringify(baseNodes)),
      pipeline: { ...DEFAULT_PIPELINE_ACTIVE },
      incidents: JSON.parse(JSON.stringify(baseIncidents)),
      history: this.seedInitialHistory(),
      predictions: {},
      fftHarmonics: this.computeFftHarmonics(false),
    };

    // Calculate initial predictions
    this.state.predictions = this.computeAllPredictions(this.state.nodes);

    if (this.isRunning && !this.isFreshInstall) {
      this.startTimer();
    }
  }

  /* Seed initial realistic history buffer so charts are never empty */
  private seedInitialHistory(): TelemetryPoint[] {
    const points: TelemetryPoint[] = [];
    const now = Date.now();
    const count = 30; // 30 seconds of historical baseline

    for (let i = count; i >= 0; i--) {
      const ts = new Date(now - i * 1000);
      const timeLabel = ts.toTimeString().slice(0, 8);
      const phase = (count - i) * 0.1;
      points.push({
        timestamp: ts.toISOString(),
        timeLabel,
        gatewayTemp: +(43.5 + Math.sin(phase) * 0.8).toFixed(1),
        gatewayCpu: +(14.2 + Math.cos(phase * 1.5) * 2.1).toFixed(1),
        ingestionRate: +(2.4 + Math.sin(phase * 0.8) * 0.3).toFixed(1),
        latencyMs: +(9.4 + Math.cos(phase) * 0.8).toFixed(1),
        dataUsageMb: +(this.totalDataUsageMb - i * 0.05).toFixed(1),
        node3RmsG: +(0.018 + Math.sin(phase) * 0.003).toFixed(4),
        node3FreqHz: +(124.6 + Math.sin(phase * 2) * 1.2).toFixed(1),
      });
    }

    return points;
  }

  /* Continuous simulation loop step */
  public step(deltaMs: number = 1000): void {
    if (this.state.isFreshInstall) return;

    this.driftPhase += (deltaMs / 1000) * 0.2;
    this.state.tickCount += 1;
    const now = new Date();
    const nowIso = now.toISOString();
    const timeLabel = now.toTimeString().slice(0, 8);

    // 1. Check if Node 3 is in fault condition
    const node3 = this.state.nodes.find((n) => n.id === 'node-esp32-adxl345');
    const isNode3Fault = node3?.integrationState === 'fault';

    if (isNode3Fault) {
      this.node3TargetRms = 0.284;
      this.node3TargetFreq = 120.0; // Harmonic fault lock
      // Rapid degradation toward fault target
      this.node3CurrentRms += (this.node3TargetRms - this.node3CurrentRms) * 0.4;
      this.node3CurrentFreq += (this.node3TargetFreq - this.node3CurrentFreq) * 0.4;
      this.node3HealthIndex = Math.max(0.64, this.node3HealthIndex - 0.05);
    } else {
      this.node3TargetRms = 0.018;
      this.node3TargetFreq = 124.6;
      // Smooth exponential relaxation recovery back to baseline
      this.node3CurrentRms += (this.node3TargetRms - this.node3CurrentRms) * 0.25;
      this.node3CurrentFreq += (this.node3TargetFreq - this.node3CurrentFreq) * 0.25;
      this.node3HealthIndex = Math.min(0.96, this.node3HealthIndex + 0.04);
    }

    // 2. Update telemetry signals for active nodes
    const activeNodes = this.state.nodes.map((node) => {
      if (node.integrationState !== 'simulated' && node.integrationState !== 'connected' && node.integrationState !== 'fault') {
        return node;
      }

      const pCount = node.packetCount + 1;
      let newSignals = { ...(node.recentSignals || {}) };

      if (node.id === 'node-nano33-ble') {
        // Node 1: IMU gesture & micro motion
        const ax = +(0.042 + Math.sin(this.driftPhase) * 0.02).toFixed(3);
        const ay = +(-0.981 + Math.cos(this.driftPhase * 0.7) * 0.015).toFixed(3);
        const az = +(0.124 + Math.sin(this.driftPhase * 1.3) * 0.018).toFixed(3);
        const gyro = +(1.18 + Math.cos(this.driftPhase) * 0.2).toFixed(2);
        const spl = +(54.2 + Math.sin(this.driftPhase * 0.5) * 2.5).toFixed(1);
        newSignals = {
          ...newSignals,
          accel_x: ax,
          accel_y: ay,
          accel_z: az,
          gyro_dps: gyro,
          sound_spl_db: spl,
          anomaly_score: 0.02,
        };
      } else if (node.id === 'node-esp32-max9814') {
        // Node 2: Acoustic noise floor & SNR
        const noise = +(58.4 + Math.sin(this.driftPhase * 0.9) * 1.8).toFixed(1);
        const snr = +(22.8 + Math.cos(this.driftPhase * 1.1) * 1.2).toFixed(1);
        newSignals = {
          ...newSignals,
          noise_floor_db: noise,
          snr_db: snr,
          sound_class: 'nominal_rotation',
          clip_detect: false,
        };
      } else if (node.id === 'node-esp32-adxl345') {
        // Node 3: Motor Predictive Maintenance ADXL345
        newSignals = {
          ...newSignals,
          vib_rms_g: +this.node3CurrentRms.toFixed(4),
          peak_freq_hz: +this.node3CurrentFreq.toFixed(1),
          accel_z_raw: +(1.018 + (this.node3CurrentRms - 0.018) * 2).toFixed(3),
          bearing_health_index: +this.node3HealthIndex.toFixed(2),
          fault_flag: isNode3Fault,
        };
      } else if (node.id === 'node-esp32-pir-dist') {
        // Node 4: Presence & distance
        const distCm = +(128.4 + Math.sin(this.driftPhase * 0.4) * 8.0).toFixed(1);
        newSignals = {
          ...newSignals,
          presence_detected: Math.sin(this.driftPhase * 0.4) > 0,
          distance_cm: distCm,
          motion_event_count: (Number(newSignals.motion_event_count) || 12) + (pCount % 10 === 0 ? 1 : 0),
        };
      } else if (node.id === 'node-esp32-env-bme') {
        // Node 5: MQ135 & BME680 environmental
        const temp = +(24.2 + Math.sin(this.driftPhase * 0.2) * 0.6).toFixed(1);
        const humidity = +(48.5 + Math.cos(this.driftPhase * 0.3) * 1.5).toFixed(1);
        const gasAqi = +(84 + Math.round(Math.sin(this.driftPhase * 0.5) * 6));
        newSignals = {
          ...newSignals,
          temp_c: temp,
          humidity_pct: humidity,
          gas_aqi: gasAqi,
          voc_ppm: +(0.42 + Math.sin(this.driftPhase) * 0.05).toFixed(2),
        };
      } else {
        // Custom registered nodes
        newSignals = {
          ...newSignals,
          ping_rtt_ms: +(12.4 + Math.sin(this.driftPhase) * 2.1).toFixed(1),
          battery_pct: Math.max(90, 98 - Math.floor(pCount / 100)),
        };
      }

      return {
        ...node,
        packetCount: pCount,
        lastSeenTimestamp: nowIso,
        recentSignals: newSignals,
        rawPayloadSnippet: JSON.stringify({
          node: node.id,
          t: timeLabel,
          ...newSignals,
        }).slice(0, 95) + '}',
      };
    });

    this.state.nodes = activeNodes;

    // 3. Update Gateway thermal and CPU metrics
    const currentGwTemp = +(43.8 + Math.sin(this.driftPhase * 0.6) * 0.9).toFixed(1);
    const currentGwCpu = +(14.2 + Math.cos(this.driftPhase * 1.2) * 2.5 + (isNode3Fault ? 4.5 : 0)).toFixed(1);
    this.state.gateway = {
      ...this.state.gateway,
      uptimeSeconds: this.state.gateway.uptimeSeconds + Math.round(deltaMs / 1000),
      thermalTempC: currentGwTemp,
      cpuLoadPct: currentGwCpu,
      lastSyncTimestamp: nowIso,
    };

    // 4. Update Pipeline health and throughput
    const activeMsgRate = +(2.4 + Math.sin(this.driftPhase) * 0.3).toFixed(1);
    this.totalDataUsageMb += (activeMsgRate * 0.001); // increment MB
    const totalPackets = this.state.pipeline.messagesReceivedTotal + Math.round(activeMsgRate);

    this.state.pipeline = {
      ...this.state.pipeline,
      messagesReceivedTotal: totalPackets,
      lastPacketTimestamp: nowIso,
      ingestionRatePerSec: activeMsgRate,
      pipelineHealth: isNode3Fault ? 'degraded' : 'nominal',
    };

    // 5. Update Bounded History Buffer
    const newPoint: TelemetryPoint = {
      timestamp: nowIso,
      timeLabel,
      gatewayTemp: currentGwTemp,
      gatewayCpu: currentGwCpu,
      ingestionRate: activeMsgRate,
      latencyMs: +(9.4 + Math.cos(this.driftPhase) * 1.1 + (isNode3Fault ? 2.8 : 0)).toFixed(1),
      dataUsageMb: +this.totalDataUsageMb.toFixed(2),
      node3RmsG: +this.node3CurrentRms.toFixed(4),
      node3FreqHz: +this.node3CurrentFreq.toFixed(1),
    };

    const nextHistory = [...this.state.history, newPoint];
    if (nextHistory.length > this.maxHistoryPoints) {
      nextHistory.splice(0, nextHistory.length - this.maxHistoryPoints);
    }
    this.state.history = nextHistory;

    // 6. Compute live rule-based TinyML predictions and FFT Harmonics
    this.state.predictions = this.computeAllPredictions(this.state.nodes);
    this.state.fftHarmonics = this.computeFftHarmonics(isNode3Fault);

    // 7. Notify listeners
    this.notify();
  }

  /* Compute live rule-based predictions with explicit simulation disclosure */
  private computeAllPredictions(nodes: PlannedNode[]): Record<string, LivePrediction> {
    const preds: Record<string, LivePrediction> = {};
    const nowIso = new Date().toISOString();

    for (const node of nodes) {
      if (node.id === 'node-nano33-ble') {
        preds[node.id] = {
          nodeId: node.id,
          modelId: 'kws-speech-micro-v0.4.tflite',
          predictionClass: 'nominal_motion',
          confidence: 0.94,
          latencyMs: 7.2,
          anomalyScore: 0.02,
          explanation: '3-axis accelerometer gravity vector steady at nominal angle. Micro motion within ±0.05g variance.',
          inferenceType: 'Simulated Rule-Based TinyML Inference',
          timestamp: nowIso,
        };
      } else if (node.id === 'node-esp32-max9814') {
        preds[node.id] = {
          nodeId: node.id,
          modelId: 'acoustic-noise-v0.2.tflite',
          predictionClass: 'nominal_rotation',
          confidence: 0.91,
          latencyMs: 11.5,
          anomalyScore: 0.05,
          explanation: 'Acoustic noise floor nominal at 58dB. Auto-gain control AGC stable. No motor bearing acoustic squeal detected.',
          inferenceType: 'Simulated Rule-Based TinyML Inference',
          timestamp: nowIso,
        };
      } else if (node.id === 'node-esp32-adxl345') {
        const isFault = node.integrationState === 'fault';
        preds[node.id] = {
          nodeId: node.id,
          modelId: 'tinyml-bearing-vibe-v1.0.0.tflite',
          predictionClass: isFault ? 'bearing_fault_2x_harmonic' : 'healthy_spindle_nominal',
          confidence: isFault ? 0.88 : 0.96,
          latencyMs: 8.8,
          anomalyScore: isFault ? 0.88 : 0.04,
          explanation: isFault
            ? 'ADXL345 detected elevated 120Hz harmonic (2X rotational speed). RMS vibration exceeds 0.08g warning threshold.'
            : 'RMS vibration 0.018g well below ISO 10816-3 Class I limit (0.080g). Rotational harmonics balanced.',
          inferenceType: 'Simulated Rule-Based TinyML Inference',
          timestamp: nowIso,
        };
      } else if (node.id === 'node-esp32-pir-dist') {
        preds[node.id] = {
          nodeId: node.id,
          modelId: 'proximity-statemachine-v1.0',
          predictionClass: 'zone_clear',
          confidence: 0.98,
          latencyMs: 3.2,
          anomalyScore: 0.01,
          explanation: 'Ultrasonic rangefinder confirms safety zone cleared beyond 1.2m threshold.',
          inferenceType: 'Simulated Rule-Based TinyML Inference',
          timestamp: nowIso,
        };
      } else if (node.id === 'node-esp32-env-bme') {
        preds[node.id] = {
          nodeId: node.id,
          modelId: 'baseline-aqi-compensator-v0.1',
          predictionClass: 'air_quality_good',
          confidence: 0.92,
          latencyMs: 4.6,
          anomalyScore: 0.03,
          explanation: 'BME680 temperature & humidity compensation applied to MQ-135 analog resistance curve.',
          inferenceType: 'Simulated Rule-Based TinyML Inference',
          timestamp: nowIso,
        };
      } else {
        preds[node.id] = {
          nodeId: node.id,
          modelId: 'generic-health-evaluator',
          predictionClass: 'nominal_device',
          confidence: 0.89,
          latencyMs: 6.0,
          anomalyScore: 0.05,
          explanation: `Simulated custom node ${node.name} operating within nominal protocol tolerances.`,
          inferenceType: 'Simulated Rule-Based TinyML Inference',
          timestamp: nowIso,
        };
      }
    }

    return preds;
  }

  /* Compute live FFT frequency spectrum data based on Node 3 vibration status */
  private computeFftHarmonics(isFault: boolean): FftHarmonic[] {
    const wobble = Math.sin(this.driftPhase) * 0.002;
    return [
      { freq: '10Hz', power: +(0.012 + wobble).toFixed(3), baseline: 0.011 },
      { freq: '30Hz', power: +(0.018 + wobble).toFixed(3), baseline: 0.016 },
      { freq: '60Hz (RPM)', power: +(0.045 + (isFault ? 0.025 : 0.003) + wobble).toFixed(3), baseline: 0.042 },
      { freq: '120Hz (2X)', power: +(isFault ? 0.185 + wobble * 2 : 0.024 + wobble).toFixed(3), baseline: 0.024 },
      { freq: '240Hz', power: +(isFault ? 0.042 + wobble : 0.032 + wobble).toFixed(3), baseline: 0.018 },
      { freq: '500Hz', power: +(0.022 + wobble).toFixed(3), baseline: 0.015 },
      { freq: '1kHz', power: +(0.014 + wobble).toFixed(3), baseline: 0.012 },
    ];
  }

  /* Public control methods */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.state.isRunning = true;
    this.startTimer();
    this.notify();
  }

  public pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.state.isRunning = false;
    this.stopTimer();
    this.notify();
  }

  public setNodes(nodes: PlannedNode[]): void {
    this.state.nodes = nodes;
    this.state.predictions = this.computeAllPredictions(nodes);
    this.notify();
  }

  public setIncidents(incidents: EdgeIncident[]): void {
    this.state.incidents = incidents;
    this.notify();
  }

  public setFreshInstall(fresh: boolean): void {
    this.isFreshInstall = fresh;
    this.state.isFreshInstall = fresh;
    if (fresh) {
      this.pause();
    } else {
      this.start();
    }
    this.notify();
  }

  public injectFault(nodeId: string = 'node-esp32-adxl345'): void {
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

    this.state.incidents = [newIncident, ...this.state.incidents];
    this.state.nodes = this.state.nodes.map((n) =>
      n.id === nodeId
        ? {
            ...n,
            integrationState: 'fault',
            recentSignals: { ...n.recentSignals, fault_flag: true, vib_rms_g: 0.284 },
          }
        : n,
    );

    this.state.pipeline = {
      ...this.state.pipeline,
      droppedPacketsCount: this.state.pipeline.droppedPacketsCount + 1,
      pipelineHealth: 'degraded',
    };

    this.step(0); // immediate state recomputation
  }

  public resolveFault(incidentId: string): void {
    const inc = this.state.incidents.find((i) => i.id === incidentId);
    const targetNodeId = inc?.nodeId || 'node-esp32-adxl345';

    this.state.incidents = this.state.incidents.map((i) =>
      i.id === incidentId ? { ...i, status: 'resolved', resolvedAt: new Date().toISOString() } : i,
    );

    // Only clear fault on this targeted node without disturbing others!
    this.state.nodes = this.state.nodes.map((n) =>
      n.id === targetNodeId && n.integrationState === 'fault'
        ? { ...n, integrationState: 'simulated' }
        : n,
    );

    // Check if any open faults remain
    const remainingFaults = this.state.nodes.some((n) => n.integrationState === 'fault');
    if (!remainingFaults) {
      this.state.pipeline = { ...this.state.pipeline, pipelineHealth: 'nominal' };
    }

    this.step(0);
  }

  public getState(): Readonly<SimulatorState> {
    return this.state;
  }

  public subscribe(listener: (state: SimulatorState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public destroy(): void {
    this.stopTimer();
    this.listeners.clear();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.step(this.tickIntervalMs);
    }, this.tickIntervalMs);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('[TelemetrySimulator] Listener error:', err);
      }
    }
  }
}

/** Global simulator singleton for continuous background execution across route transitions */
let globalSimulator: TelemetrySimulator | null = null;

export function getTelemetrySimulator(options?: SimulatorOptions): TelemetrySimulator {
  if (!globalSimulator) {
    globalSimulator = new TelemetrySimulator(options);
  }
  return globalSimulator;
}

export function resetGlobalSimulator(options?: SimulatorOptions): TelemetrySimulator {
  if (globalSimulator) {
    globalSimulator.destroy();
  }
  globalSimulator = new TelemetrySimulator(options);
  return globalSimulator;
}

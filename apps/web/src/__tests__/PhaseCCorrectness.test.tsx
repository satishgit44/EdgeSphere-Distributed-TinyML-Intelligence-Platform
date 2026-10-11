import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TelemetrySimulator } from '@/services/telemetrySimulator';
import {
  savePersistedState,
  loadPersistedState,
  clearPersistedState,
  STORAGE_KEY,
} from '@/services/telemetryStorage';
import { DEFAULT_PLANNED_NODES } from '@/data/simulator';
import type { PlannedNode } from '@/types';

describe('Phase C: Telemetry Simulator & Engine Correctness', () => {
  let sim: TelemetrySimulator;

  beforeEach(() => {
    // Instantiate with timer disabled for fully deterministic testing
    sim = new TelemetrySimulator({ isRunning: false, tickIntervalMs: 1000 });
  });

  afterEach(() => {
    sim.destroy();
  });

  it('initializes with strictly 5 baseline nodes', () => {
    const state = sim.getState();
    expect(state.nodes.length).toBe(5);
    expect(state.nodes.map((n) => n.id)).toEqual([
      'node-nano33-ble',
      'node-esp32-max9814',
      'node-esp32-adxl345',
      'node-esp32-pir-dist',
      'node-esp32-env-bme',
    ]);
  });

  it('produces valid physical bounds and typed signal shapes across active simulated nodes', () => {
    sim.step(1000);
    const state = sim.getState();
    const [n1, n2, n3, n4, n5] = state.nodes;

    // Node 1 (Nano 33 BLE): IMU signals within physical gravity bounds
    expect(n1.recentSignals).toBeDefined();
    expect(typeof n1.recentSignals?.accel_x).toBe('number');
    expect(typeof n1.recentSignals?.accel_y).toBe('number');
    expect(typeof n1.recentSignals?.accel_z).toBe('number');
    expect(Number(n1.recentSignals?.accel_y)).toBeLessThan(0); // Gravity vector points down

    // Node 2 (MAX9814): Acoustic decibels within sensible audio range
    expect(Number(n2.recentSignals?.noise_floor_db)).toBeGreaterThan(40);
    expect(Number(n2.recentSignals?.noise_floor_db)).toBeLessThan(90);

    // Node 3 (ADXL345): Baseline vibration within nominal ISO limits
    expect(Number(n3.recentSignals?.vib_rms_g)).toBeLessThan(0.08); // Baseline is ~0.018g
    expect(Number(n3.recentSignals?.peak_freq_hz)).toBeGreaterThan(100);

    // Node 4 & Node 5: Baseline specification has them in 'awaiting_integration' initially
    expect(n4.integrationState).toBe('awaiting_integration');
    expect(n5.integrationState).toBe('awaiting_integration');

    // When simulated or connected, they produce valid physical readings
    sim.setNodes(
      state.nodes.map((n) =>
        n.id === 'node-esp32-pir-dist' || n.id === 'node-esp32-env-bme'
          ? { ...n, integrationState: 'simulated' }
          : n,
      ),
    );
    sim.step(1000);
    const updatedState = sim.getState();
    const updatedN4 = updatedState.nodes.find((n) => n.id === 'node-esp32-pir-dist');
    const updatedN5 = updatedState.nodes.find((n) => n.id === 'node-esp32-env-bme');

    expect(Number(updatedN4?.recentSignals?.distance_cm)).toBeGreaterThan(50);
    expect(Number(updatedN5?.recentSignals?.temp_c)).toBeGreaterThan(15);
    expect(Number(updatedN5?.recentSignals?.temp_c)).toBeLessThan(40);
    expect(Number(updatedN5?.recentSignals?.humidity_pct)).toBeGreaterThan(30);
  });

  it('advances tickCount and generates bounded history buffer without unbounded memory growth', () => {
    const initialHistoryLength = sim.getState().history.length;
    expect(initialHistoryLength).toBeGreaterThan(0);

    // Step 50 times
    for (let i = 0; i < 50; i++) {
      sim.step(1000);
    }

    const state = sim.getState();
    expect(state.tickCount).toBe(50);
    // Max history points capped at 120
    expect(state.history.length).toBeLessThanOrEqual(120);

    const latest = state.history[state.history.length - 1];
    expect(latest.gatewayTemp).toBeGreaterThan(35);
    expect(latest.gatewayTemp).toBeLessThan(65);
    expect(latest.ingestionRate).toBeGreaterThan(1.5);
  });

  it('generates live rule-based TinyML predictions with explicit simulation disclosure', () => {
    sim.step(1000);
    const state = sim.getState();

    for (const node of state.nodes) {
      const pred = state.predictions[node.id];
      expect(pred).toBeDefined();
      expect(pred.nodeId).toBe(node.id);
      expect(pred.inferenceType).toBe('Simulated Rule-Based TinyML Inference');
      expect(pred.confidence).toBeGreaterThan(0.5);
      expect(pred.confidence).toBeLessThanOrEqual(1.0);
      expect(pred.latencyMs).toBeGreaterThan(0);
      expect(pred.explanation.length).toBeGreaterThan(10);
    }
  });

  it('injects fault on Node 3 and executes smooth exponential recovery upon resolution', () => {
    sim.step(1000);
    let state = sim.getState();
    const baselineRms = Number(state.nodes[2].recentSignals?.vib_rms_g);
    expect(baselineRms).toBeLessThan(0.05);

    // 1. Inject fault on Node 3
    sim.injectFault('node-esp32-adxl345');
    state = sim.getState();
    const faultedNode = state.nodes.find((n) => n.id === 'node-esp32-adxl345');
    expect(faultedNode?.integrationState).toBe('fault');
    expect(faultedNode?.recentSignals?.fault_flag).toBe(true);
    expect(state.pipeline.pipelineHealth).toBe('degraded');

    // FFT harmonics must reflect 120Hz 2X harmonic peak
    const harmonic120 = state.fftHarmonics.find((h) => h.freq === '120Hz (2X)');
    expect(harmonic120?.power).toBeGreaterThan(0.15);

    // Prediction for Node 3 reflects fault
    const pred = state.predictions['node-esp32-adxl345'];
    expect(pred.predictionClass).toBe('bearing_fault_2x_harmonic');
    expect(pred.anomalyScore).toBeGreaterThan(0.7);

    // 2. Resolve incident
    const openInc = state.incidents.find((i) => i.status === 'open');
    expect(openInc).toBeDefined();
    sim.resolveFault(openInc!.id);

    // Device state cleared back to 'simulated'
    state = sim.getState();
    const recoveredNode = state.nodes.find((n) => n.id === 'node-esp32-adxl345');
    expect(recoveredNode?.integrationState).toBe('simulated');

    // 3. Step several times to verify smooth relaxation back toward baseline
    for (let i = 0; i < 10; i++) {
      sim.step(1000);
    }

    state = sim.getState();
    const relaxedRms = Number(state.nodes[2].recentSignals?.vib_rms_g);
    expect(relaxedRms).toBeLessThan(0.05); // Relaxed back toward ~0.018g
    expect(state.pipeline.pipelineHealth).toBe('nominal');
  });

  it('allows dynamic registered nodes to join the simulation smoothly', () => {
    const customNode: PlannedNode = {
      id: 'custom-pressure-01',
      name: 'Custom Pressure Transducer',
      targetMcu: 'ESP32-S3',
      onboardSensors: ['BMP390'],
      role: 'Hydraulic Pressure Monitor',
      intendedTinyML: 'Spike Detector INT8',
      commsBus: 'WiFi MQTT',
      pinout: [],
      integrationState: 'simulated',
      mqttTopic: 'edgesphere/nodes/custom-pressure-01/telemetry',
      lastSeenTimestamp: null,
      activeModelId: 'custom-model.tflite',
      recentSignals: null,
      rawPayloadSnippet: null,
      packetCount: 0,
    };

    sim.setNodes([...DEFAULT_PLANNED_NODES, customNode]);
    sim.step(1000);

    const state = sim.getState();
    expect(state.nodes.length).toBe(6);
    const added = state.nodes.find((n) => n.id === 'custom-pressure-01');
    expect(added?.packetCount).toBe(1);
    expect(added?.recentSignals?.ping_rtt_ms).toBeDefined();

    const pred = state.predictions['custom-pressure-01'];
    expect(pred).toBeDefined();
    expect(pred.inferenceType).toBe('Simulated Rule-Based TinyML Inference');
  });
});

describe('Phase C: Versioned Local Storage Persistence', () => {
  beforeEach(() => {
    clearPersistedState();
  });

  afterEach(() => {
    clearPersistedState();
  });

  it('saves and loads persisted state accurately', () => {
    const customNode: PlannedNode = {
      id: 'custom-node-persist',
      name: 'Persisted Tank Sensor',
      targetMcu: 'ESP32-C3',
      onboardSensors: ['HC-SR04'],
      role: 'Tank Level',
      intendedTinyML: 'Level Monitor',
      commsBus: 'WiFi MQTT',
      pinout: [],
      integrationState: 'simulated',
      mqttTopic: 'edgesphere/nodes/custom-node-persist/telemetry',
      lastSeenTimestamp: null,
      activeModelId: null,
      recentSignals: null,
      rawPayloadSnippet: null,
      packetCount: 0,
    };

    const saved = savePersistedState({
      customNodes: [customNode],
      customDeviceMeta: {
        'custom-node-persist': { location: 'Tank Farm 4', isOn: true, icon: 'cpu' },
      },
      isSimulatorRunning: true,
      isFreshInstall: false,
      incidents: [],
    });

    expect(saved).toBe(true);

    const loaded = loadPersistedState();
    expect(loaded).not.toBeNull();
    expect(loaded?.version).toBe(1);
    expect(loaded?.customNodes.length).toBe(1);
    expect(loaded?.customNodes[0].id).toBe('custom-node-persist');
    expect(loaded?.customDeviceMeta['custom-node-persist'].location).toBe('Tank Farm 4');
  });

  it('gracefully handles missing, corrupted or invalid localStorage payloads', () => {
    // 1. Missing
    expect(loadPersistedState()).toBeNull();

    // 2. Corrupted JSON
    window.localStorage.setItem(STORAGE_KEY, '{invalid-json:broken');
    expect(loadPersistedState()).toBeNull();

    // 3. Outdated schema version
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999, customNodes: [] }));
    expect(loadPersistedState()).toBeNull();
  });
});

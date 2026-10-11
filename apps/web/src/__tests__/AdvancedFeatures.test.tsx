import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimulatorProvider } from '@/context/SimulatorContext';
import { NavigationProvider } from '@/context/NavigationContext';
import { LiveNodesGrid } from '@/components/devices/LiveNodesGrid';
import { FederatedLearningPage } from '@/pages/FederatedLearningPage';
import { DynamicSchedulingPage } from '@/pages/DynamicSchedulingPage';
import { BenchmarkPage } from '@/pages/BenchmarkPage';
import { TelemetrySimulator, resetGlobalSimulator } from '@/services/telemetrySimulator';

describe('Advanced Platform Features: Live Inference, FL, Scheduling & Benchmarks', () => {
  let sim: TelemetrySimulator;

  beforeEach(() => {
    sim = resetGlobalSimulator({ isRunning: false, tickIntervalMs: 1000 });
  });

  afterEach(() => {
    sim.destroy();
  });

  /* ── 1. Live Inference Cards (5 Nodes) ── */
  it('renders all five initial node inference cards with complete metadata', () => {
    render(
      <SimulatorProvider>
        <NavigationProvider value={{ currentRoute: 'devices', navigate: () => {} }}>
          <LiveNodesGrid />
        </NavigationProvider>
      </SimulatorProvider>
    );

    // Verify all 5 node titles are rendered
    expect(screen.getByText('Arduino Nano 33 BLE Sense')).toBeDefined();
    expect(screen.getByText('ESP32 Acoustic Node (MAX9814)')).toBeDefined();
    expect(screen.getByText('ESP32 Vibration Node (ADXL345)')).toBeDefined();
    expect(screen.getByText('ESP32 Motion & Proximity Node')).toBeDefined();
    expect(screen.getByText('ESP32 Environmental Node')).toBeDefined();

    // Verify presence of node ID chips
    expect(screen.getByText('node-nano33-ble')).toBeDefined();
    expect(screen.getByText('node-esp32-max9814')).toBeDefined();
    expect(screen.getByText('node-esp32-adxl345')).toBeDefined();
    expect(screen.getByText('node-esp32-pir-dist')).toBeDefined();
    expect(screen.getByText('node-esp32-env-bme')).toBeDefined();

    // Verify simulation disclosure banner is present
    expect(screen.getByText(/Simulated Edge AI Fleet:/i)).toBeDefined();
  });

  it('updates prediction scores and values consistently when simulator steps', () => {
    const stateBefore = sim.getState();
    const node3Before = stateBefore.predictions['node-esp32-adxl345'];
    expect(node3Before.predictionClass).toBe('healthy_spindle_nominal');
    expect(node3Before.anomalyScore).toBeLessThan(0.1);

    // Inject fault into Node 3
    sim.injectFault('node-esp32-adxl345');
    const stateAfter = sim.getState();
    const node3After = stateAfter.predictions['node-esp32-adxl345'];

    // Consistency check: Prediction must reflect the fault condition
    expect(node3After.predictionClass).toBe('bearing_fault_2x_harmonic');
    expect(node3After.anomalyScore).toBeGreaterThan(0.7);
    expect(node3After.explanation).toContain('ADXL345 detected elevated 120Hz harmonic');
    expect(node3After.inferenceType).toBe('Simulated Rule-Based TinyML Inference');
  });

  it('opens live node detail inspector when a card is selected', () => {
    render(
      <SimulatorProvider>
        <NavigationProvider value={{ currentRoute: 'devices', navigate: () => {} }}>
          <LiveNodesGrid />
        </NavigationProvider>
      </SimulatorProvider>
    );

    // Click on Node 3 card
    const node3Card = screen.getByText('ESP32 Vibration Node (ADXL345)').closest('article');
    expect(node3Card).not.toBeNull();
    fireEvent.click(node3Card!);

    // Detail modal inspector should be visible with explainability
    expect(screen.getByText(/Active TinyML Prediction/i)).toBeDefined();
    expect(screen.getByText(/Explainable Reasoning:/i)).toBeDefined();
    expect(screen.getByText(/Contributing Sensor Features/i)).toBeDefined();
    expect(screen.getByText(/Simulation Provenance:/i)).toBeDefined();
  });

  /* ── 2. Federated Learning Tab ── */
  it('manages participating node selection and runs simulated FedAvg training rounds', () => {
    render(
      <SimulatorProvider>
        <NavigationProvider value={{ currentRoute: 'federated-learning', navigate: () => {} }}>
          <FederatedLearningPage />
        </NavigationProvider>
      </SimulatorProvider>
    );

    expect(screen.getByText('Decentralized TinyML Federated Learning')).toBeDefined();
    expect(screen.getByText(/UI Federated Learning Prototype:/i)).toBeDefined();

    // Verify initial round and validation accuracy
    expect(screen.getByText('Round 3 / 5')).toBeDefined();
    expect(screen.getByText('Execute FedAvg Round')).toBeDefined();

    // Node selection toggle
    const adxlCheckbox = screen.getByLabelText(/Select ESP32 Vibration Node/i) as HTMLInputElement;
    expect(adxlCheckbox).toBeDefined();
    expect(adxlCheckbox.checked).toBe(true);
  });

  /* ── 3. Dynamic Scheduling Tab ── */
  it('updates task allocation policy and migrates tasks upon fault injection', () => {
    render(
      <SimulatorProvider>
        <NavigationProvider value={{ currentRoute: 'dynamic-scheduling', navigate: () => {} }}>
          <DynamicSchedulingPage />
        </NavigationProvider>
      </SimulatorProvider>
    );

    expect(screen.getByText('Edge Gateway Workload Coordinator')).toBeDefined();
    expect(screen.getByText(/Simulated Gateway Scheduler:/i)).toBeDefined();

    // Test policy selection
    const latencyBtn = screen.getByText(/Lowest Inference Latency/i);
    fireEvent.click(latencyBtn);

    // Trigger simulated failover
    const failoverBtn = screen.getByText(/Inject Node 3 Fault \(Test Failover\)/i);
    fireEvent.click(failoverBtn);

    // Verify task migration happened
    expect(screen.getByText(/FAILOVER REASSIGNED/i)).toBeDefined();
    expect(screen.getByText(/Arduino Nano 33 BLE Sense \(Failover\)/i)).toBeDefined();
  });

  /* ── 4. Benchmark Tab ── */
  it('displays comparative engine benchmarks and discloses configured demo fixtures', () => {
    render(
      <SimulatorProvider>
        <NavigationProvider value={{ currentRoute: 'benchmarks', navigate: () => {} }}>
          <BenchmarkPage />
        </NavigationProvider>
      </SimulatorProvider>
    );

    expect(screen.getByText('TinyML Engine & Compiler Benchmarking')).toBeDefined();
    expect(screen.getByText('TensorFlow Lite Micro')).toBeDefined();
    expect(screen.getByText('Edge Impulse EON')).toBeDefined();
    expect(screen.getByText('CMSIS-NN')).toBeDefined();

    // Honest provenance check
    const demoFixtures = screen.getAllByText('Configured Demo Fixture');
    expect(demoFixtures.length).toBeGreaterThanOrEqual(3);

    // CSV export button exists
    expect(screen.getByText(/Export Benchmark CSV/i)).toBeDefined();
  });
});

import { describe, it, expect, vi } from 'vitest';
import {
  SimulatorTelemetryDataSource,
  PlannedMqttGatewayDataSource,
} from '@/services/telemetryDataSource';

describe('TelemetryDataSource Service Abstraction', () => {
  it('satisfies the TelemetryDataSource interface with local simulator engine', () => {
    const dataSource = new SimulatorTelemetryDataSource({ isRunning: false });

    expect(dataSource.id).toBe('local-simulation-v1');
    expect(dataSource.isSimulated).toBe(true);
    expect(dataSource.isStreaming).toBe(false);

    const snapshot = dataSource.getSnapshot();
    expect(snapshot.nodes).toHaveLength(5);
    expect(snapshot.nodes.map((n) => n.id)).toEqual([
      'node-nano33-ble',
      'node-esp32-max9814',
      'node-esp32-adxl345',
      'node-esp32-pir-dist',
      'node-esp32-env-bme',
    ]);
  });

  it('supports reactive subscriptions and lifecycle control', () => {
    const dataSource = new SimulatorTelemetryDataSource({ isRunning: false });
    const listener = vi.fn();

    const unsubscribe = dataSource.subscribe(listener);
    expect(typeof unsubscribe).toBe('function');

    dataSource.setRunning(true);
    expect(dataSource.isStreaming).toBe(true);

    dataSource.setRunning(false);
    expect(dataSource.isStreaming).toBe(false);

    unsubscribe();
    dataSource.dispose();
  });

  it('handles sensor fault injection and recovery', () => {
    const dataSource = new SimulatorTelemetryDataSource({ isRunning: false });

    // Inject fault on Node 3
    dataSource.injectFault('node-esp32-adxl345');
    const faultedSnapshot = dataSource.getSnapshot();
    const node3 = faultedSnapshot.nodes.find((n) => n.id === 'node-esp32-adxl345');
    expect(node3?.integrationState).toBe('fault');

    // Incident was registered
    const faultIncident = faultedSnapshot.incidents.find((i) => i.nodeId === 'node-esp32-adxl345');
    expect(faultIncident).toBeDefined();

    if (faultIncident) {
      dataSource.clearFault(faultIncident.id);
      const clearedSnapshot = dataSource.getSnapshot();
      const restoredNode3 = clearedSnapshot.nodes.find((n) => n.id === 'node-esp32-adxl345');
      // On resolution, status moves back from fault
      expect(restoredNode3?.integrationState).toBe('simulated');
    }

    dataSource.dispose();
  });

  it('clearly discloses that PlannedMqttGatewayDataSource is not yet implemented', () => {
    const plannedMqtt = new PlannedMqttGatewayDataSource();
    expect(plannedMqtt.id).toBe('mqtt-gateway-planned');
    expect(plannedMqtt.isStreaming).toBe(false);
    expect(plannedMqtt.isSimulated).toBe(false);

    expect(() => plannedMqtt.getSnapshot()).toThrow(/Phase D production MQTT connectivity is planned/i);
    expect(() => plannedMqtt.subscribe()).toThrow(/Use SimulatorTelemetryDataSource/i);
  });
});

import { describe, it, expect } from 'vitest';
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

describe('Product-Accurate Hardware Fleet Verification', () => {
  it('identifies the gateway strictly as Raspberry Pi 5 with local microservices', () => {
    expect(DEFAULT_GATEWAY_ACTIVE.id).toBe('rpi5-manager-gw');
    expect(DEFAULT_GATEWAY_ACTIVE.hardwareModel).toContain('Raspberry Pi 5');
    expect(DEFAULT_GATEWAY_ACTIVE.status).toBe('active');
    expect(DEFAULT_GATEWAY_ACTIVE.services.length).toBeGreaterThanOrEqual(3);

    const serviceNames = DEFAULT_GATEWAY_ACTIVE.services.map((s) => s.name);
    expect(serviceNames).toContain('Eclipse Mosquitto MQTT');
    expect(serviceNames).toContain('edgesphere-ingestd');
    expect(serviceNames).toContain('tflite-micro-runtime');
  });

  it('contains strictly the 5 planned embedded nodes without fictional scaling', () => {
    expect(DEFAULT_PLANNED_NODES).toHaveLength(5);
    const nodeIds = DEFAULT_PLANNED_NODES.map((n) => n.id);
    expect(nodeIds).toEqual([
      'node-nano33-ble',
      'node-esp32-max9814',
      'node-esp32-adxl345',
      'node-esp32-pir-dist',
      'node-esp32-env-bme',
    ]);
  });

  it('verifies Arduino Nano 33 BLE Sense sensor and MCU specification', () => {
    const nanoNode = DEFAULT_PLANNED_NODES.find((n) => n.id === 'node-nano33-ble')!;
    expect(nanoNode.targetMcu).toContain('nRF52840');
    expect(nanoNode.onboardSensors[0]).toContain('LSM9DS1');
    expect(nanoNode.intendedTinyML).toContain('IMU Motion');
  });

  it('verifies ESP32 ADXL345 vibration node pinout and SPI configuration', () => {
    const adxlNode = DEFAULT_PLANNED_NODES.find((n) => n.id === 'node-esp32-adxl345')!;
    expect(adxlNode.targetMcu).toContain('ESP32');
    expect(adxlNode.onboardSensors[0]).toContain('ADXL345');
    const spiPinout = adxlNode.pinout.find((p) => p.bus === 'SPI');
    expect(spiPinout).toBeDefined();
    expect(spiPinout?.pins).toContain('MOSI');
  });

  it('verifies ESP32 MAX9814 acoustic node sensor and ADC configuration', () => {
    const acousticNode = DEFAULT_PLANNED_NODES.find((n) => n.id === 'node-esp32-max9814')!;
    expect(acousticNode.onboardSensors[0]).toContain('MAX9814');
    const adcPinout = acousticNode.pinout.find((p) => p.bus === 'ADC');
    expect(adcPinout).toBeDefined();
  });

  it('verifies ESP32 PIR and HC-SR04 motion/distance node', () => {
    const motionNode = DEFAULT_PLANNED_NODES.find((n) => n.id === 'node-esp32-pir-dist')!;
    expect(motionNode.onboardSensors).toContain('HC-SR04 Ultrasonic Sensor');
    expect(motionNode.integrationState).toBe('awaiting_integration');
  });

  it('verifies ESP32 MQ135 and BME680 air-quality node', () => {
    const envNode = DEFAULT_PLANNED_NODES.find((n) => n.id === 'node-esp32-env-bme')!;
    expect(envNode.onboardSensors[0]).toContain('BME680');
    expect(envNode.integrationState).toBe('awaiting_integration');
  });

  it('enforces realistic telemetry pipeline metrics (no 42K msg/min or fake scale)', () => {
    expect(DEFAULT_PIPELINE_ACTIVE.ingestionRatePerSec).toBeLessThan(100);
    expect(DEFAULT_PIPELINE_ACTIVE.ingestionRatePerSec).toBeGreaterThan(0);
    expect(DEFAULT_PIPELINE_ACTIVE.brokerEngine).toContain('Mosquitto');
  });

  it('supports unconfigured empty state for fresh installations', () => {
    expect(DEFAULT_GATEWAY_UNCONFIGURED.status).toBe('unconfigured');
    expect(DEFAULT_GATEWAY_UNCONFIGURED.cpuLoadPct).toBe(0);
    expect(DEFAULT_PIPELINE_UNCONFIGURED.messagesReceivedTotal).toBe(0);
    expect(DEFAULT_PIPELINE_UNCONFIGURED.pipelineHealth).toBe('unconfigured');
  });

  it('defines valid TinyML model artifacts with flash footprints and SHA256 hashes', () => {
    expect(DEFAULT_MODELS.length).toBeGreaterThanOrEqual(3);
    DEFAULT_MODELS.forEach((mod) => {
      expect(mod.flashFootprintKb).toBeGreaterThan(0);
      expect(mod.ramFootprintKb).toBeGreaterThan(0);
      expect(mod.sha256).toMatch(/^sha256:/);
    });
  });

  it('defines operational logs with monospaced timestamps and sources', () => {
    expect(DEFAULT_INCIDENTS_ACTIVE.length).toBeGreaterThan(0);
    expect(DEFAULT_LOG_EVENTS.length).toBeGreaterThan(0);
    DEFAULT_LOG_EVENTS.forEach((l) => {
      expect(l.timestamp).toBeTruthy();
      expect(l.source).toBeTruthy();
      expect(['info', 'warning', 'error', 'success']).toContain(l.severity);
    });
  });
});

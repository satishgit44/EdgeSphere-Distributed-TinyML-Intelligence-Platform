/**
 * ══════════════════════════════════════════════════════════════
 * ⚠️  EDGESPHERE SIMULATOR & PLANNED HARDWARE REPOSITORY
 * ══════════════════════════════════════════════════════════════
 *
 * Grounded strictly in the planned hardware fleet:
 * - 1 Gateway: Raspberry Pi 5 Edge Intelligence Manager
 * - 5 Planned Embedded Nodes:
 *    1. Arduino Nano 33 BLE Sense (onboard LSM9DS1 IMU + mic)
 *    2. ESP32 node with ADXL345 (high-bandwidth vibration)
 *    3. ESP32 node with MAX9814 (acoustic anomaly)
 *    4. ESP32 node with PIR and HC-SR04 (motion & distance)
 *    5. ESP32 node with MQ135 and BME680 (air-quality & environmental)
 *
 * NO fabricated fleet scales (no 1,284 devices, no fake customer ARR).
 * ══════════════════════════════════════════════════════════════
 */

import type {
  EdgeGateway,
  PlannedNode,
  TelemetryPipelineHealth,
  TinyMLModelArtifact,
  EdgeIncident,
  OperationalLogEvent,
} from '@/types';

/* ── 1. The Gateway: Raspberry Pi 5 ── */
export const DEFAULT_GATEWAY_ACTIVE: EdgeGateway = {
  id: 'rpi5-manager-gw',
  name: 'Raspberry Pi 5 Gateway',
  hardwareModel: 'Raspberry Pi 5 Model B Rev 1.0 (8GB)',
  role: 'Edge Intelligence Manager & Local MQTT Broker',
  host: '192.168.4.1 (wlan0 AP / eth0)',
  os: 'Debian GNU/Linux 12 (bookworm) aarch64 (Linux 6.6.20+rpt)',
  uptimeSeconds: 14280, // ~4 hours
  status: 'active',
  mode: 'simulation',
  cpuLoadPct: 14.2,
  thermalTempC: 43.8,
  ramUsageMb: 1180,
  ramTotalMb: 8192,
  storageUsageGb: 14.2,
  storageTotalGb: 64.0,
  services: [
    {
      name: 'Eclipse Mosquitto MQTT',
      role: 'Local Message Broker',
      port: 1883,
      status: 'active',
      detail: 'TCP 1883 & WS 9001, TLS ready, auth: token',
    },
    {
      name: 'edgesphere-ingestd',
      role: 'Telemetry Ingestion & Quality Validator',
      status: 'active',
      detail: 'Buffered ring in /var/log/edgesphere/ring.db',
    },
    {
      name: 'tflite-micro-runtime',
      role: 'Local Model Deployment Coordinator',
      status: 'active',
      detail: 'TFLite runtime 2.14.0 arm64, compiler staged',
    },
    {
      name: 'device-heartbeat-mon',
      role: 'Heartbeat & Liveness Daemon',
      status: 'active',
      detail: 'Active ping polling interval: 15s',
    },
  ],
  lastSyncTimestamp: new Date().toISOString(),
};

export const DEFAULT_GATEWAY_UNCONFIGURED: EdgeGateway = {
  id: 'rpi5-manager-gw',
  name: 'Raspberry Pi 5 Gateway',
  hardwareModel: 'Raspberry Pi 5 Model B Rev 1.0',
  role: 'Edge Intelligence Manager (Unconfigured)',
  host: 'Not bound',
  os: 'Debian GNU/Linux (Awaiting edgesphere-manager-init)',
  uptimeSeconds: 0,
  status: 'unconfigured',
  mode: 'hardware',
  cpuLoadPct: 0,
  thermalTempC: 0,
  ramUsageMb: 0,
  ramTotalMb: 8192,
  storageUsageGb: 0,
  storageTotalGb: 64.0,
  services: [
    { name: 'Eclipse Mosquitto MQTT', role: 'Broker', status: 'unconfigured', detail: 'Service not started' },
    { name: 'edgesphere-ingestd', role: 'Ingest', status: 'unconfigured', detail: 'Daemon not initialized' },
    { name: 'tflite-micro-runtime', role: 'Runtime', status: 'unconfigured', detail: 'No models deployed' },
  ],
  lastSyncTimestamp: 'Never synced',
};

/* ── 2. The Planned Fleet (5 specific embedded nodes) ── */
export const DEFAULT_PLANNED_NODES: PlannedNode[] = [
  {
      id: 'node-nano33-ble',
      name: 'Arduino Nano 33 BLE Sense',
      targetMcu: 'Nordic nRF52840 (ARM Cortex-M4F @ 64MHz, 1MB Flash, 256KB RAM)',
      onboardSensors: ['Onboard LSM9DS1 9-axis IMU', 'MP34DT05 Digital Mic', 'APDS-9960 Proximity/Light'],
      role: 'Gesture Recognition TinyML Node',
      intendedTinyML: 'On-device IMU Motion & Gesture Recognition (TFLite Micro INT8)',
      commsBus: 'BLE 5.0 / USB-Serial Gateway Tunnel',
      pinout: [
        { bus: 'I2C', pins: 'Internal SDA / SCL (LSM9DS1)', clockOrBaud: '400 kHz' },
        { bus: 'GPIO', pins: 'PDM Mic CLK (P0.26), DIN (P0.25)' },
      ],
      integrationState: 'simulated',
      mqttTopic: 'edgesphere/nodes/node-nano33-ble/telemetry',
      lastSeenTimestamp: new Date(Date.now() - 4000).toISOString(),
      activeModelId: 'kws-speech-micro-v0.4.tflite',
      recentSignals: {
        accel_x: 0.042,
        accel_y: -0.981,
        accel_z: 0.124,
        gyro_dps: 1.18,
        sound_spl_db: 54.2,
        anomaly_score: 0.02,
      },
      rawPayloadSnippet: '{"node":"node-nano33-ble","ax":0.042,"ay":-0.981,"az":0.124,"spl":54.2,"anomaly":0.02}',
      packetCount: 184,
    },
  {
      id: 'node-esp32-max9814',
      name: 'ESP32 Acoustic Node (MAX9814)',
      targetMcu: 'Espressif ESP32-WROOM-32D',
      onboardSensors: ['Maxim MAX9814 Electret Mic with Auto Gain Control (AGC)'],
      role: 'Acoustic Noise Floor & Machine Sound Classifier',
      intendedTinyML: 'Mel-Frequency Cepstral Coefficients (MFCC) Anomaly Net',
      commsBus: 'WiFi MQTT (802.11 b/g/n @ 2.4GHz)',
      pinout: [
        { bus: 'ADC', pins: 'Out: GPIO34 (ADC1_CH6, 12-bit)', clockOrBaud: '16 kHz sampling' },
        { bus: 'GPIO', pins: 'Gain select: Tied to VDD (40dB)' },
      ],
      integrationState: 'simulated',
      mqttTopic: 'edgesphere/nodes/node-esp32-max9814/telemetry',
      lastSeenTimestamp: new Date(Date.now() - 7000).toISOString(),
      activeModelId: 'acoustic-noise-v0.2.tflite',
      recentSignals: {
        noise_floor_db: 58.4,
        snr_db: 22.8,
        sound_class: 'nominal_rotation',
        clip_detect: false,
      },
      rawPayloadSnippet: '{"node":"node-esp32-max9814","db":58.4,"snr":22.8,"class":"nominal_rotation"}',
      packetCount: 142,
    },
  {
      id: 'node-esp32-adxl345',
      name: 'ESP32 Vibration Node (ADXL345)',
      targetMcu: 'Espressif ESP32-WROOM-32D (Dual Xtensa LX6 @ 240MHz, 4MB Flash, 520KB SRAM)',
      onboardSensors: ['Analog Devices ADXL345 (3-Axis Accelerometer, ±16g, 3200Hz)'],
      role: 'Motor Predictive Maintenance & Vibration Analysis',
      intendedTinyML: 'Motor Health Classification, FFT & Bearing Fault Detection',
      commsBus: 'WiFi MQTT (802.11 b/g/n @ 2.4GHz)',
      pinout: [
        { bus: 'SPI', pins: 'MOSI: GPIO23, MISO: GPIO19, SCK: GPIO18, CS: GPIO5', clockOrBaud: '5 MHz' },
        { bus: 'GPIO', pins: 'INT1: GPIO4 (Data Ready interrupt)' },
      ],
      integrationState: 'simulated',
      mqttTopic: 'edgesphere/nodes/node-esp32-adxl345/telemetry',
      lastSeenTimestamp: new Date(Date.now() - 2000).toISOString(),
      activeModelId: 'tinyml-bearing-vibe-v1.0.0.tflite',
      recentSignals: {
        vib_rms_g: 0.284,
        peak_freq_hz: 124.6,
        accel_z_raw: 1.018,
        bearing_health_index: 0.96,
        fault_flag: false,
      },
      rawPayloadSnippet: '{"node":"node-esp32-adxl345","rms_g":0.284,"freq_hz":124.6,"health":0.96,"fault":false}',
      packetCount: 312,
    },
  {
      id: 'node-esp32-pir-dist',
      name: 'ESP32 Motion & Proximity Node',
      targetMcu: 'Espressif ESP32-WROOM-32D',
      onboardSensors: ['HC-SR04 Ultrasonic Sensor', 'HC-SR501 PIR Motion Sensor'],
      role: 'Workcell Zone Presence & Distance Monitoring',
      intendedTinyML: 'Distance Delta & Obstruction State Machine',
      commsBus: 'WiFi MQTT',
      pinout: [
        { bus: 'GPIO', pins: 'HC-SR04 Trig: GPIO5, Echo: GPIO18 (via voltage divider)' },
        { bus: 'GPIO', pins: 'PIR Out: GPIO19 (Digital input)' },
      ],
      integrationState: 'awaiting_integration',
      mqttTopic: 'edgesphere/nodes/node-esp32-pir-dist/telemetry',
      lastSeenTimestamp: null,
      activeModelId: null,
      recentSignals: null,
      rawPayloadSnippet: null,
      packetCount: 0,
    },
  {
      id: 'node-esp32-env-bme',
      name: 'ESP32 Environmental Node',
      targetMcu: 'Espressif ESP32-WROOM-32D',
      onboardSensors: ['Bosch BME680 (I2C: Gas, Temp, Hum, Pressure)', 'MQ-135 Gas Sensor (Analog)'],
      role: 'Environmental Drift & Volatile Organic Gas Sensor',
      intendedTinyML: 'Baseline Air-Quality Drift Compensator',
      commsBus: 'WiFi MQTT',
      pinout: [
        { bus: 'I2C', pins: 'SDA: GPIO21, SCL: GPIO22 (Address: 0x77)', clockOrBaud: '400 kHz' },
        { bus: 'ADC', pins: 'MQ135 Analog Out: GPIO35 (ADC1_CH7)' },
      ],
      integrationState: 'awaiting_integration',
      mqttTopic: 'edgesphere/nodes/node-esp32-env-bme/telemetry',
      lastSeenTimestamp: null,
      activeModelId: null,
      recentSignals: null,
      rawPayloadSnippet: null,
      packetCount: 0,
    }
];

/* ── 3. Telemetry Pipeline Health ── */
export const DEFAULT_PIPELINE_ACTIVE: TelemetryPipelineHealth = {
  brokerEngine: 'Mosquitto v2.0.18 (port 1883)',
  messagesReceivedTotal: 638,
  lastPacketTimestamp: new Date().toISOString(),
  ingestionRatePerSec: 2.4, // Realistic embedded telemetry rate!
  bufferOccupancyBytes: 48200,
  droppedPacketsCount: 0,
  pipelineHealth: 'nominal',
};

export const DEFAULT_PIPELINE_UNCONFIGURED: TelemetryPipelineHealth = {
  brokerEngine: 'Awaiting Mosquitto connection',
  messagesReceivedTotal: 0,
  lastPacketTimestamp: null,
  ingestionRatePerSec: 0,
  bufferOccupancyBytes: 0,
  droppedPacketsCount: 0,
  pipelineHealth: 'unconfigured',
};

/* ── 4. TinyML Model Artifacts ── */
export const DEFAULT_MODELS: TinyMLModelArtifact[] = [
  {
    id: 'tinyml-bearing-vibe-v1.0.0.tflite',
    name: 'Bearing Vibration FFT Classifier',
    version: 'v1.0.0',
    targetNodeId: 'node-esp32-adxl345',
    targetMcu: 'ESP32-WROOM-32D',
    format: 'TFLite Micro (INT8)',
    flashFootprintKb: 14.8,
    ramFootprintKb: 8.2,
    sha256: 'sha256:8b4e72fc9a1024bd35a2...',
    deploymentState: 'deployed',
    benchmarkLatencyMs: 6.4,
    description: '3200Hz vibration sample FFT spectral peak anomaly detector trained on bearing dataset',
  },
  {
    id: 'kws-speech-micro-v0.4.tflite',
    name: 'Voice/Acoustic Command Classifier',
    version: 'v0.4.2',
    targetNodeId: 'node-nano33-ble',
    targetMcu: 'nRF52840 (Cortex-M4F)',
    format: 'TFLite Micro (INT8)',
    flashFootprintKb: 28.4,
    ramFootprintKb: 14.6,
    sha256: 'sha256:1a90cc439df8b122841f...',
    deploymentState: 'deployed',
    benchmarkLatencyMs: 14.2,
    description: 'Keyword spotter and audio acoustic event discriminator using onboard MP34DT05 PDM mic',
  },
  {
    id: 'acoustic-noise-v0.2.tflite',
    name: 'MAX9814 Acoustic Anomaly Detector',
    version: 'v0.2.1',
    targetNodeId: 'node-esp32-max9814',
    targetMcu: 'ESP32-WROOM-32D',
    format: 'TFLite Micro (INT8)',
    flashFootprintKb: 19.2,
    ramFootprintKb: 9.4,
    sha256: 'sha256:3d28eb419c8f0012ba44...',
    deploymentState: 'staged',
    benchmarkLatencyMs: 8.1,
    description: 'Detects unexpected motor humming harmonics and acoustic noise bursts',
  },
  {
    id: 'bme680-drift-compensator-v0.1.tflite',
    name: 'BME680 Sensor Baseline Compensator',
    version: 'v0.1.0',
    targetNodeId: 'node-esp32-env-bme',
    targetMcu: 'ESP32-WROOM-32D',
    format: 'CMSIS-NN',
    flashFootprintKb: 8.4,
    ramFootprintKb: 4.1,
    sha256: 'sha256:e490fa9932cb48a88188...',
    deploymentState: 'not_configured',
    description: 'Awaiting hardware wiring. Compensates for humidity drift on BME680 MOS gas sensor',
  },
];

/* ── 5. Realistic Open Incidents ── */
export const DEFAULT_INCIDENTS_ACTIVE: EdgeIncident[] = [
  {
    id: 'INC-VIB-01',
    title: 'SPI Read Timeout on ADXL345',
    nodeId: 'node-esp32-adxl345',
    severity: 'medium',
    status: 'investigating',
    detectedAt: new Date(Date.now() - 180000).toISOString(),
    description: 'ESP32 SPI driver reported 2 consecutive overrun errors reading register 0x32 (DATAX0).',
    remediationStep: 'Verify CS line pull-up and SPI clock divider; simulate bus reset command.',
  },
];

/* ── 6. Operational Event Log ── */
export const DEFAULT_LOG_EVENTS: OperationalLogEvent[] = [
  {
    id: 'evt-101',
    timestamp: new Date(Date.now() - 2000).toISOString(),
    severity: 'info',
    source: 'edgesphere-ingestd',
    message: 'MQTT packet accepted from node-esp32-adxl345 (Topic: edgesphere/nodes/node-esp32-adxl345/telemetry)',
    payloadJson: '{"rms_g":0.284,"freq_hz":124.6}',
  },
  {
    id: 'evt-102',
    timestamp: new Date(Date.now() - 14000).toISOString(),
    severity: 'info',
    source: 'device-heartbeat-mon',
    message: 'Heartbeat acknowledged: node-nano33-ble (RSSI: -58 dBm, Battery: USB-Powered)',
  },
  {
    id: 'evt-103',
    timestamp: new Date(Date.now() - 48000).toISOString(),
    severity: 'warning',
    source: 'edgesphere-ingestd',
    message: 'ADXL345 reported elevated peak frequency: 124.6 Hz (+12% baseline drift)',
  },
  {
    id: 'evt-104',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    severity: 'info',
    source: 'tflite-micro-runtime',
    message: 'Active model tinyml-bearing-vibe-v1.0.0.tflite verified on node-esp32-adxl345 (hash sha256:8b4e72fc...)',
  },
  {
    id: 'evt-105',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    severity: 'info',
    source: 'rpi5-manager-gw',
    message: 'Edge Intelligence Manager daemon started on Raspberry Pi 5 (Debian 12 Bookworm)',
  },
];

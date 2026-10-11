/**
 * ══════════════════════════════════════════════════════════════
 * ⚠️  ANALYTICS SIMULATOR FIXTURES — SYNTHETIC DATA ONLY
 * ══════════════════════════════════════════════════════════════
 */

/* 1. Telemetry Over Time with missing data segments */
export const TELEMETRY_OVER_TIME = {
  spec: {
    name: 'Sensor Ingestion Throughput',
    unit: 'Messages / Second (msg/s)',
    timeWindow: 'Last 24 Hours',
    aggregation: '1-minute Mean',
    dataSource: 'Simulator MQTT Ingestion Queue (Synthetic)',
    description: 'Ingestion rate received across gateway MQTT brokers',
  },
  data: [
    { time: '00:00', value: 340, missing: false },
    { time: '02:00', value: 320, missing: false },
    { time: '04:00', value: 290, missing: false },
    { time: '06:00', value: 410, missing: false },
    { time: '08:00', value: 580, missing: false },
    { time: '10:00', value: 620, missing: false },
    { time: '12:00', value: null, missing: true }, // MISSING DATA WINDOW
    { time: '13:00', value: null, missing: true }, // MISSING DATA WINDOW
    { time: '14:00', value: 650, missing: false },
    { time: '16:00', value: 590, missing: false },
    { time: '18:00', value: 530, missing: false },
    { time: '20:00', value: 460, missing: false },
    { time: '22:00', value: 380, missing: false },
  ],
};

/* 2. Heartbeat and Connectivity History */
export const CONNECTIVITY_HISTORY = {
  spec: {
    name: 'Fleet Connectivity & Heartbeat Availability',
    unit: 'Percentage of Scheduled Heartbeats (%)',
    timeWindow: 'Last 7 Days',
    aggregation: 'Daily Availability Ratio',
    dataSource: 'Simulator Heartbeat Daemon',
    description: 'Percentage of fleet ping heartbeats acknowledged within 30s window',
  },
  data: [
    { day: 'Mon', connected: 98.4, degraded: 1.2, dropped: 0.4 },
    { day: 'Tue', connected: 97.9, degraded: 1.5, dropped: 0.6 },
    { day: 'Wed', connected: 99.1, degraded: 0.7, dropped: 0.2 },
    { day: 'Thu', connected: 96.2, degraded: 2.8, dropped: 1.0 },
    { day: 'Fri', connected: 98.7, degraded: 1.0, dropped: 0.3 },
    { day: 'Sat', connected: 99.4, degraded: 0.5, dropped: 0.1 },
    { day: 'Sun', connected: 99.0, degraded: 0.8, dropped: 0.2 },
  ],
};

/* 3. Inference Latency Distributions */
export const LATENCY_DISTRIBUTION = {
  spec: {
    name: 'TinyML Inference Latency Histogram',
    unit: 'Inference Executions (Sample Count)',
    timeWindow: 'Rolling 1 Hour (10,000 samples)',
    aggregation: 'Histogram Binning (5ms resolution)',
    dataSource: 'Simulator Device Telemetry Log',
    description: 'Distribution of execution time on Arm Cortex-M4 and Cortex-M55 cores',
  },
  data: [
    { bucket: '< 10ms', count: 1250, percent: 12.5 },
    { bucket: '10-15ms', count: 3420, percent: 34.2 },
    { bucket: '15-20ms', count: 2890, percent: 28.9 },
    { bucket: '20-25ms', count: 1320, percent: 13.2 },
    { bucket: '25-30ms', count: 640, percent: 6.4 },
    { bucket: '30-40ms', count: 310, percent: 3.1 },
    { bucket: '40-50ms', count: 120, percent: 1.2 },
    { bucket: '> 50ms', count: 50, percent: 0.5 },
  ],
};

/* 4. Model Benchmark Comparisons */
export const MODEL_BENCHMARKS = {
  spec: {
    name: 'TinyML Edge Model Benchmark Matrix',
    unit: 'Normalized (Accuracy %, Flash KB, Latency ms)',
    timeWindow: 'Fixed Benchmark Suite v1.4',
    aggregation: 'Standardized Coremark / MLPerf Tiny',
    dataSource: 'Simulator Model Registry',
    description: 'Comparison across deployed edge quantized models',
  },
  data: [
    { model: 'AnomalyNet-INT8', accuracy: 96.4, latencyMs: 14.2, flashKb: 128, ramKb: 32 },
    { model: 'SensorFusion-v2', accuracy: 94.1, latencyMs: 9.8, flashKb: 64, ramKb: 16 },
    { model: 'VibrationClassifier', accuracy: 97.8, latencyMs: 22.4, flashKb: 240, ramKb: 48 },
    { model: 'AudioKWS-Small', accuracy: 91.2, latencyMs: 7.5, flashKb: 48, ramKb: 12 },
    { model: 'ThermalDriftNet', accuracy: 95.0, latencyMs: 18.0, flashKb: 180, ramKb: 36 },
  ],
};

/* 5. Deployment Success and Failure Rates */
export const DEPLOYMENT_STATS = {
  spec: {
    name: 'OTA Firmware & Model Distribution Success Rate',
    unit: 'Percentage of Target Nodes (%)',
    timeWindow: 'Last 90 Days (18 Deployment Campaigns)',
    aggregation: 'Outcome Ratio',
    dataSource: 'Simulator Release Coordinator',
    description: 'Verification of SHA-256 binary validation and post-update heartbeat',
  },
  data: [
    { campaign: 'Release v2.1', successRate: 99.2, failureRate: 0.8 },
    { campaign: 'Release v2.2', successRate: 97.5, failureRate: 2.5 },
    { campaign: 'Release v2.3', successRate: 98.8, failureRate: 1.2 },
    { campaign: 'Release v2.4', successRate: 94.0, failureRate: 6.0 },
    { campaign: 'Release v2.4.1', successRate: 98.4, failureRate: 1.6 },
  ],
};

/* 6. Incident Frequency and Recovery Duration */
export const INCIDENT_RECOVERY_METRICS = {
  spec: {
    name: 'Mean Time to Recovery (MTTR) & Incident Count',
    unit: 'Recovery Minutes (MTTR) / Incident Frequency',
    timeWindow: 'Last 6 Months',
    aggregation: 'Monthly Sum & Mean',
    dataSource: 'Simulator Incident Manager',
    description: 'Mean elapsed time between anomaly trigger and health restoration',
  },
  data: [
    { month: 'May', incidents: 8, mttrMinutes: 42 },
    { month: 'Jun', incidents: 6, mttrMinutes: 38 },
    { month: 'Jul', incidents: 9, mttrMinutes: 54 },
    { month: 'Aug', incidents: 5, mttrMinutes: 29 },
    { month: 'Sep', incidents: 4, mttrMinutes: 24 },
    { month: 'Oct', incidents: 3, mttrMinutes: 19 },
  ],
};

/* 7. Experiment and Federated-Round Summaries */
export const FEDERATED_LEARNING_SUMMARY = {
  spec: {
    name: 'Federated TinyML Optimization Rounds',
    unit: 'Loss / Accuracy Delta / Participating Nodes',
    timeWindow: 'Experiment Run: FedAvg-Anomaly-Exp3',
    aggregation: 'Per-Round Aggregated Weights',
    dataSource: 'Simulator Federated Coordinator',
    description: 'On-device weight gradient aggregation across decentralized nodes',
  },
  data: [
    { round: 'Round 40', loss: 0.28, accuracy: 93.1, nodes: 412 },
    { round: 'Round 42', loss: 0.24, accuracy: 94.0, nodes: 428 },
    { round: 'Round 44', loss: 0.21, accuracy: 94.9, nodes: 440 },
    { round: 'Round 46', loss: 0.18, accuracy: 95.6, nodes: 448 },
    { round: 'Round 48', loss: 0.16, accuracy: 96.1, nodes: 452 },
    { round: 'Round 50', loss: 0.14, accuracy: 96.7, nodes: 455 },
  ],
};

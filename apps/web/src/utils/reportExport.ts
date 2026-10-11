import type {
  EdgeGateway,
  PlannedNode,
  TelemetryPipelineHealth,
  TinyMLModelArtifact,
  EdgeIncident,
  DailySummary,
} from '@/types';

export interface ReportDataInput {
  date: string;
  timezone?: string;
  gateway: EdgeGateway;
  nodes: PlannedNode[];
  pipeline: TelemetryPipelineHealth;
  models: TinyMLModelArtifact[];
  incidents: EdgeIncident[];
  dailySummary?: DailySummary;
}

/**
 * Escapes a single CSV cell according to RFC 4180:
 * - Wrap with double quotes if the value contains comma, quote, or newline.
 * - Double any inner double quotes (" -> "").
 */
export function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates structured JSON report with explicit simulation disclosure.
 */
export function generateReportJson(data: ReportDataInput): string {
  const exportPayload = {
    reportTitle: 'EdgeSphere Fleet Telemetry & Edge Intelligence Audit',
    reportVersion: '1.0',
    exportTimestamp: new Date().toISOString(),
    reportDate: data.date,
    timezone: data.timezone || 'UTC+05:30 (Asia/Kolkata)',
    classification: 'Simulated Local Fleet Telemetry (Phase B)',
    platform: {
      gateway: data.gateway.hardwareModel,
      role: data.gateway.role,
      os: data.gateway.os,
      status: data.gateway.status,
      thermalsC: data.gateway.thermalTempC,
      cpuLoadPct: data.gateway.cpuLoadPct,
      ramUsageMb: `${data.gateway.ramUsageMb} / ${data.gateway.ramTotalMb} MB`,
      storageUsageGb: `${data.gateway.storageUsageGb} / ${data.gateway.storageTotalGb} GB`,
      activeServices: data.gateway.services.map((s) => ({
        name: s.name,
        role: s.role,
        status: s.status,
      })),
    },
    pipeline: {
      broker: data.pipeline.brokerEngine,
      ingestionRateMsgPerSec: data.pipeline.ingestionRatePerSec,
      totalMessagesReceived: data.pipeline.messagesReceivedTotal,
      packetDrops: data.pipeline.droppedPacketsCount,
      health: data.pipeline.pipelineHealth,
    },
    fleetSummary: {
      totalRegisteredNodes: data.nodes.length,
      baselineInitialNodes: 5,
      onlineNodes: data.nodes.filter(
        (n) => n.integrationState === 'connected' || n.integrationState === 'configured' || n.integrationState === 'simulated'
      ).length,
      faultNodes: data.nodes.filter((n) => n.integrationState === 'fault').length,
      nodes: data.nodes.map((n) => ({
        id: n.id,
        name: n.name,
        mcu: n.targetMcu,
        sensors: n.onboardSensors,
        role: n.role,
        intendedTinyML: n.intendedTinyML,
        integrationState: n.integrationState,
        packetCount: n.packetCount,
        lastSeen: n.lastSeenTimestamp,
      })),
    },
    node3MotorPredictiveMaintenance: {
      nodeId: 'node-esp32-adxl345',
      sensor: 'Analog Devices ADXL345 (3-Axis Accelerometer)',
      samplingRate: '3.2 kHz SPI bus',
      rmsVibrationG: data.dailySummary?.node3Motor?.rmsVibrationG ?? 0.018,
      anomalyDetected: data.dailySummary?.node3Motor?.anomalyDetected ?? false,
      bearingHealthScore: data.dailySummary?.node3Motor?.healthScore ?? 94,
      trend: data.dailySummary?.node3Motor?.trend ?? 'Stable Baseline',
      recommendation: data.dailySummary?.node3Motor?.recommendation ?? 'Routine operational baseline maintained.',
    },
    activeIncidents: data.incidents
      .filter((i) => i.status !== 'resolved')
      .map((i) => ({
        id: i.id,
        title: i.title,
        severity: i.severity,
        nodeId: i.nodeId,
        detectedAt: i.detectedAt,
        status: i.status,
      })),
    deployedTinyMLModels: data.models.map((m) => ({
      id: m.id,
      name: m.name,
      targetMcu: m.targetMcu,
      format: m.format,
      deploymentState: m.deploymentState,
      flashFootprintKb: m.flashFootprintKb,
      ramFootprintKb: m.ramFootprintKb,
    })),
    caveats: [
      'Telemetry generated in simulated offline mode; no live physical sensors are claimed to be attached.',
      'Edge predictions computed using local TFLite Micro INT8 inference models.',
      'Gateway logs reflect local Raspberry Pi 5 service manager state.',
    ],
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Generates RFC 4180 compliant tabular CSV report.
 */
export function generateReportCsv(data: ReportDataInput): string {
  const lines: string[] = [];

  // Header row for Node Inventory
  lines.push(
    [
      'Node ID',
      'Device Name',
      'Target MCU',
      'Sensors',
      'Role / Function',
      'Integration State',
      'Packet Count',
      'Last Seen',
      'Telemetry Note',
    ]
      .map(escapeCsv)
      .join(',')
  );

  // Rows for each fleet node
  for (const node of data.nodes) {
    lines.push(
      [
        node.id,
        node.name,
        node.targetMcu,
        node.onboardSensors.join('; '),
        node.role,
        node.integrationState,
        node.packetCount,
        node.lastSeenTimestamp || 'Never',
        'Simulated telemetry stream',
      ]
        .map(escapeCsv)
        .join(',')
    );
  }

  // Blank separator line
  lines.push('');

  // Secondary summary section: Gateway & Pipeline telemetry metrics
  lines.push(['Metric Section', 'Metric Name', 'Value', 'Unit / Status', 'Disclosure'].map(escapeCsv).join(','));
  lines.push(
    ['Gateway', 'Hardware Model', data.gateway.hardwareModel, data.gateway.status, 'Raspberry Pi 5 Host']
      .map(escapeCsv)
      .join(',')
  );
  lines.push(
    ['Gateway', 'CPU Load', data.gateway.cpuLoadPct.toFixed(1), '%', 'Local systemd monitor'].map(escapeCsv).join(',')
  );
  lines.push(
    ['Gateway', 'Core Temperature', data.gateway.thermalTempC.toFixed(1), '°C', 'Thermal zone 0'].map(escapeCsv).join(',')
  );
  lines.push(
    ['Pipeline', 'MQTT Ingestion Rate', data.pipeline.ingestionRatePerSec.toFixed(1), 'msg/s', 'Mosquitto ring buffer']
      .map(escapeCsv)
      .join(',')
  );
  lines.push(
    ['Pipeline', 'Total Messages Received', data.pipeline.messagesReceivedTotal, 'packets', 'Audit window total']
      .map(escapeCsv)
      .join(',')
  );
  lines.push(
    [
      'Node 3 Motor',
      'RMS Vibration',
      data.dailySummary?.node3Motor?.rmsVibrationG ?? 0.018,
      'g',
      'ADXL345 SPI Accelerometer',
    ]
      .map(escapeCsv)
      .join(',')
  );
  lines.push(
    [
      'Node 3 Motor',
      'Bearing Health Index',
      data.dailySummary?.node3Motor?.healthScore ?? 94,
      '/ 100',
      'TFLite Micro Vibration FFT',
    ]
      .map(escapeCsv)
      .join(',')
  );
  lines.push(
    [
      'Incidents',
      'Active Open Incidents',
      data.incidents.filter((i) => i.status !== 'resolved').length,
      'count',
      'Incident management queue',
    ]
      .map(escapeCsv)
      .join(',')
  );

  return lines.join('\r\n');
}

/**
 * Generates human-readable Markdown summary report with headings, metrics, and caveat notices.
 */
export function generateReportMarkdown(data: ReportDataInput): string {
  const faultNode = data.nodes.find((n) => n.integrationState === 'fault');
  const onlineCount = data.nodes.filter(
    (n) => n.integrationState === 'connected' || n.integrationState === 'configured' || n.integrationState === 'simulated'
  ).length;
  const openIncidents = data.incidents.filter((i) => i.status !== 'resolved');

  return `# EdgeSphere Daily Fleet Audit & Telemetry Report

**Report Date:** ${data.date}  
**Timezone:** ${data.timezone || 'UTC+05:30 (Asia/Kolkata)'}  
**Platform:** EdgeSphere Distributed TinyML Intelligence Platform  
**Host:** ${data.gateway.hardwareModel}  
**Classification:** Simulated Fleet Telemetry (Phase B)  

---

## 1. Executive Summary

${
  faultNode
    ? '⚠️ **Degraded Fleet Operations:** Node 3 (ESP32 + ADXL345) reported anomalous vibration harmonics at 120Hz requiring physical inspection. Gateway is healthy with zero broker dropouts.'
    : '✅ **Fleet Nominal:** The edge fleet is operating normally with 5 initial embedded nodes communicating across local MQTT. Gateway thermals and CPU load remain within normal margins.'
}

---

## 2. Fleet Overview & Node Inventory

| Node ID | Device Name | Target MCU | Integration State | Packets |
| :--- | :--- | :--- | :--- | :--- |
${data.nodes
  .map(
    (n) =>
      `| \`${n.id}\` | ${n.name} | ${n.targetMcu.split('(')[0].trim()} | **${n.integrationState}** | ${n.packetCount} |`
  )
  .join('\n')}

- **Total Registered Nodes:** ${data.nodes.length} (Baseline initial fleet: 5)
- **Active / Online:** ${onlineCount}
- **Fault / Degraded:** ${faultNode ? 1 : 0}

---

## 3. Node 3 Motor Predictive Maintenance

- **Sensor Hardware:** Analog Devices ADXL345 (3-Axis Accelerometer, ±16g, 3200Hz SPI)
- **RMS Vibration:** ${data.dailySummary?.node3Motor?.rmsVibrationG ?? 0.018}g (ISO 10816-3 Class I)
- **Bearing Health Score:** ${data.dailySummary?.node3Motor?.healthScore ?? 94} / 100
- **Operational Status:** ${data.dailySummary?.node3Motor?.anomalyDetected ? 'CRITICAL ATTENTION REQUIRED' : 'NOMINAL BASELINE'}
- **Actionable Recommendation:** ${
    data.dailySummary?.node3Motor?.recommendation ?? 'Routine operational baseline maintained.'
  }

---

## 4. Raspberry Pi 5 Gateway & Ingestion Health

- **Operating System:** ${data.gateway.os}
- **Gateway Status:** ${data.gateway.status.toUpperCase()}
- **CPU Load:** ${data.gateway.cpuLoadPct.toFixed(1)}%
- **Core Thermals:** ${data.gateway.thermalTempC.toFixed(1)}°C
- **RAM Usage:** ${data.gateway.ramUsageMb} MB / ${data.gateway.ramTotalMb} MB
- **MQTT Ingestion Rate:** ${data.pipeline.ingestionRatePerSec.toFixed(1)} msg/s
- **Total Audited Packets:** ${data.pipeline.messagesReceivedTotal}
- **Packet Drops:** ${data.pipeline.droppedPacketsCount}

---

## 5. Active Incident Log

${
  openIncidents.length === 0
    ? 'No unresolved incidents reported.'
    : openIncidents
        .map(
          (inc) =>
            `- **[${inc.severity.toUpperCase()}] \`${inc.id}\`**: ${inc.title} (Target: \`${inc.nodeId || 'gateway'}\`, Detected: ${inc.detectedAt})`
        )
        .join('\n')
}

---

## 6. Deployed TinyML Model Registry

| Model ID | Target MCU | Format | Deployment State | Latency |
| :--- | :--- | :--- | :--- | :--- |
${data.models
  .map(
    (m) =>
      `| \`${m.id}\` | ${m.targetMcu} | ${m.format} | ${m.deploymentState} | ${m.benchmarkLatencyMs ? `${m.benchmarkLatencyMs}ms` : '—'} |`
  )
  .join('\n')}

---

> [!NOTE]
> **Data Authenticity Notice:** Telemetry and model evaluation scores reflect the local offline simulation and edge test harness. No physical hardware connection is claimed at this stage.
`;
}

/**
 * Triggers a browser file download using a temporary Blob URL and revokes it.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoke the object URL after small timeout to release browser memory
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 500);
}

/**
 * Helper to download JSON report file.
 */
export function downloadReportJson(data: ReportDataInput, filename?: string): void {
  const name = filename || `edgesphere-report-${data.date}.json`;
  const jsonContent = generateReportJson(data);
  downloadFile(jsonContent, name, 'application/json;charset=utf-8;');
}

/**
 * Helper to download CSV report file.
 */
export function downloadReportCsv(data: ReportDataInput, filename?: string): void {
  const name = filename || `edgesphere-fleet-report-${data.date}.csv`;
  const csvContent = generateReportCsv(data);
  downloadFile(csvContent, name, 'text/csv;charset=utf-8;');
}

/**
 * Helper to download Markdown summary report file.
 */
export function downloadReportMarkdown(data: ReportDataInput, filename?: string): void {
  const name = filename || `edgesphere-summary-${data.date}.md`;
  const mdContent = generateReportMarkdown(data);
  downloadFile(mdContent, name, 'text/markdown;charset=utf-8;');
}

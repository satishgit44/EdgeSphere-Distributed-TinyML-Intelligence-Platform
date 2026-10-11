import { Download, FileText } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import {
  downloadReportJson,
  downloadReportCsv,
  downloadReportMarkdown,
  downloadFile,
  type ReportDataInput,
} from '@/utils/reportExport';

import { useState } from 'react';

export function ReportsPage() {
  const { nodes, gateway, pipeline, incidents, models } = useSimulator();
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);

  const reportData: ReportDataInput = {
    date: currentDate,
    timezone: 'UTC+05:30 (Asia/Kolkata)',
    gateway,
    nodes,
    pipeline,
    models,
    incidents,
  };

  const handleDownload = (format: 'json' | 'csv' | 'markdown' | 'vibration' | 'gateway') => {
    switch (format) {
      case 'json':
        downloadReportJson(reportData);
        break;
      case 'csv':
        downloadReportCsv(reportData);
        break;
      case 'markdown':
        downloadReportMarkdown(reportData);
        break;
      case 'vibration': {
        const vibrationContent = `# EdgeSphere Node 3 Vibration & FFT Diagnostics Audit
**Date:** ${currentDate}
**Node:** Node 3 (ESP32 + ADXL345)
**MCU:** Espressif ESP32-WROOM-32D @ 240MHz
**Sensor:** Analog Devices ADXL345 (3-Axis Accelerometer, ±16g, 3200Hz)
**Bus:** SPI @ 5MHz (MOSI: GPIO23, MISO: GPIO19, SCK: GPIO18, CS: GPIO5)
**Status:** Nominal Baseline
**RMS Acceleration:** 0.018g RMS
**Peak Frequency:** 124.6 Hz
**Spectral Power Density:** Flat harmonic distribution below ISO 10816-3 Class I threshold (0.080g)
**Active Model:** tinyml-bearing-vibe-v1.0.0.tflite (INT8, 14.8 KB Flash, 6.4ms inference)

*Classification: Simulated local telemetry test harness.*
`;
        downloadFile(
          vibrationContent,
          `edgesphere-node3-vibration-audit-${currentDate}.md`,
          'text/markdown;charset=utf-8;'
        );
        break;
      }
      case 'gateway': {
        const gatewayContent = `# EdgeSphere Raspberry Pi 5 Gateway Telemetry Audit
**Date:** ${currentDate}
**Host:** ${gateway.hardwareModel}
**OS:** ${gateway.os}
**Uptime:** ${Math.floor(gateway.uptimeSeconds / 3600)}h ${Math.floor((gateway.uptimeSeconds % 3600) / 60)}m
**CPU Load:** ${gateway.cpuLoadPct.toFixed(1)}%
**Core Thermals:** ${gateway.thermalTempC.toFixed(1)}°C
**Memory:** ${gateway.ramUsageMb} MB / ${gateway.ramTotalMb} MB
**Storage:** ${gateway.storageUsageGb} GB / ${gateway.storageTotalGb} GB
**Ingestion Rate:** ${pipeline.ingestionRatePerSec.toFixed(1)} msg/s
**Total Packets:** ${pipeline.messagesReceivedTotal}
**Packet Drops:** ${pipeline.droppedPacketsCount}

### Managed Edge Services
${gateway.services.map((s) => `- **${s.name}**: ${s.status.toUpperCase()} (${s.role})`).join('\n')}

*Classification: Simulated local daemon telemetry.*
`;
        downloadFile(
          gatewayContent,
          `edgesphere-rpi5-gateway-audit-${currentDate}.md`,
          'text/markdown;charset=utf-8;'
        );
        break;
      }
    }
  };

  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Reports</span>
          </div>
          <h1 className="es-nexus-title">Fleet Reports & Diagnostics Bundles</h1>
          <p className="es-nexus-subtitle">
            Generate audited telemetry audits, motor predictive maintenance summaries, and edge performance logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="es-nexus-pill active"
            onClick={() => handleDownload('json')}
            title="Download structured JSON report"
          >
            <Download size={13} /> Export JSON
          </button>
          <button
            type="button"
            className="es-nexus-pill active"
            onClick={() => handleDownload('csv')}
            title="Download tabular CSV report"
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            type="button"
            className="es-nexus-pill active"
            onClick={() => handleDownload('markdown')}
            title="Download Markdown summary report"
          >
            <FileText size={13} /> Export Markdown
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        <article className="es-nexus-card">
          <div className="es-nexus-card-header">
            <h3 className="es-nexus-card-title">Node 3 Motor Vibration & FFT Report</h3>
          </div>
          <div className="es-nexus-card-body">
            <p style={{ fontSize: '13px', color: '#737487', lineHeight: 1.5 }}>
              Comprehensive 24-hour vibration report with ADXL345 acceleration vectors, FFT spectral power density, and bearing anomaly scores.
            </p>
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="es-nexus-action-button-primary"
                onClick={() => handleDownload('vibration')}
              >
                Download Vibration Audit (Markdown)
              </button>
            </div>
          </div>
        </article>

        <article className="es-nexus-card">
          <div className="es-nexus-card-header">
            <h3 className="es-nexus-card-title">Raspberry Pi 5 Gateway Telemetry Audit</h3>
          </div>
          <div className="es-nexus-card-body">
            <p style={{ fontSize: '13px', color: '#737487', lineHeight: 1.5 }}>
              Local Mosquitto MQTT throughput statistics, packet drop rates, daemon CPU and thermal metrics.
            </p>
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="es-nexus-action-button-primary"
                onClick={() => handleDownload('gateway')}
              >
                Download Gateway Audit (Markdown)
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

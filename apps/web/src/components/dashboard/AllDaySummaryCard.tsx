import { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Download, Check, ChevronDown, ChevronUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import type { DailySummary } from '@/types';

export function AllDaySummaryCard() {
  const { nodes, gateway, pipeline, incidents, models } = useSimulator();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2026-10-11');
  const [generatedAt, setGeneratedAt] = useState('16:45');

  const faultNode = nodes.find((n) => n.integrationState === 'fault');
  const onlineCount = nodes.filter((n) => n.integrationState === 'connected' || n.integrationState === 'configured').length;
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  const summary: DailySummary = {
    date: selectedDate,
    timezone: 'UTC+05:30 (Asia/Kolkata)',
    windowStart: '2026-10-11T00:00:00+05:30',
    windowEnd: '2026-10-11T23:59:59+05:30',
    generatedAt,
    mode: 'rule_based',
    executiveSummary: faultNode
      ? 'The edge fleet is operating in degraded mode. Node 3 (ESP32 + ADXL345) reported anomalous vibration harmonics at 120Hz requiring physical inspection. Gateway is healthy with zero broker dropouts.'
      : 'The edge fleet is operating normally with 5 registered embedded nodes communicating across local MQTT. Gateway temperature (42.1°C) and CPU load (14.2%) are well within nominal margins.',
    fleetStatus: {
      total: 5,
      online: onlineCount,
      offline: 0,
      degraded: faultNode ? 1 : 0,
      gatewayStatus: gateway.status === 'active' ? 'Online / Nominal' : 'Degraded',
      missedHeartbeats: faultNode ? 2 : 0,
    },
    telemetry: {
      messagesTotal: pipeline.messagesReceivedTotal,
      gapsDetected: 0,
      peakRate: 42.0,
      peakTime: '14:22:10',
    },
    incidents: {
      newCount: openIncidents.length,
      resolvedCount: incidents.length - openIncidents.length,
      activeCount: openIncidents.length,
      criticalCount: faultNode ? 1 : 0,
    },
    node3Motor: {
      trend: faultNode ? 'Elevated High-Frequency Vibration (0.284g RMS)' : 'Stable Baseline (0.018g RMS)',
      rmsVibrationG: faultNode ? 0.284 : 0.018,
      healthScore: faultNode ? 68 : 94,
      anomalyDetected: !!faultNode,
      recommendation: faultNode
        ? 'Inspect motor shaft coupling and bearing raceway. Review ADXL345 FFT spectral power density before resuming high-speed cycles.'
        : 'Routine operational baseline maintained. Next scheduled bearing lubrication in 14 days.',
    },
    deployments: {
      queued: 0,
      succeeded: models.filter((m) => m.deploymentState === 'deployed').length,
      failed: 0,
    },
    recommendations: [
      {
        priority: faultNode ? 'high' : 'low',
        action: faultNode
          ? 'Triage Node 3 ADXL345 vibration alert and verify bearing acoustic sensor on Node 2.'
          : 'Archive 24-hour telemetry ring buffer to local storage partition.',
        link: faultNode ? '/alerts' : '/telemetry',
      },
      {
        priority: 'medium',
        action: 'Verify Mosquitto token renewals for the ESP32 sensor cluster.',
        link: '/integrations',
      },
    ],
    caveats: [
      'Telemetry sourced from local Raspberry Pi 5 simulator pipeline.',
      'Node 5 BME680 optional humidity/pressure sensor is awaiting physical attachment.',
      'AI predictions are generated via local TFLite Micro INT8 inference models; no raw audio or telemetry left the local edge perimeter.',
    ],
  };

  const handleRefresh = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    const text = `# Today's EdgeSphere Summary (${summary.date})\nTimezone: ${summary.timezone}\n\n${summary.executiveSummary}\n\nFleet Status: ${summary.fleetStatus.online}/${summary.fleetStatus.total} Online\nTelemetry: ${summary.telemetry.messagesTotal.toLocaleString()} packets\nNode 3 Motor Health: ${summary.node3Motor.healthScore}%\nRecommendation: ${summary.recommendations[0].action}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="es-summary-card">
      <div className="es-summary-header">
        <div className="es-summary-title-wrap">
          <div className="es-summary-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="es-summary-title">Today&apos;s EdgeSphere Summary</h3>
            <p className="es-summary-subtitle">
              Comprehensive 24-hour fleet audit &bull; Window: 00:00 &ndash; 23:59 ({summary.timezone})
            </p>
          </div>
        </div>

        <div className="es-summary-actions">
          <input
            type="date"
            className="es-summary-date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            type="button"
            className="es-summary-btn"
            onClick={handleRefresh}
            disabled={isGenerating}
            title="Refresh summary"
          >
            <RefreshCw size={13} className={isGenerating ? 'spin' : ''} />
            <span>{isGenerating ? 'Synthesizing…' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            className="es-summary-btn"
            onClick={handleCopy}
            title="Copy summary to clipboard"
          >
            {copied ? <Check size={13} color="#16A36A" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            className="es-summary-btn"
            onClick={() => alert('Exporting full Markdown & PDF summary bundle...')}
            title="Export summary bundle"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
          <button
            type="button"
            className="es-summary-btn es-summary-collapse-btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="es-summary-body">
          {/* Executive Summary */}
          <div className={`es-summary-exec ${summary.node3Motor.anomalyDetected ? 'is-warning' : 'is-nominal'}`}>
            <div className="es-summary-exec-badge">
              {summary.node3Motor.anomalyDetected ? <AlertCircle size={14} /> : <ShieldCheck size={14} />}
              <span>{summary.node3Motor.anomalyDetected ? 'ATTENTION REQUIRED' : 'FLEET NOMINAL'}</span>
            </div>
            <p className="es-summary-exec-text">{summary.executiveSummary}</p>
          </div>

          {/* 4 Multi-Dimension Metric Blocks */}
          <div className="es-summary-grid">
            <div className="es-summary-block">
              <span className="es-summary-block-label">1. FLEET & GATEWAY</span>
              <div className="es-summary-block-val">{summary.fleetStatus.online} / {summary.fleetStatus.total} Nodes Online</div>
              <p className="es-summary-block-desc">
                Raspberry Pi 5 Gateway: <strong>{summary.fleetStatus.gatewayStatus}</strong>. Missed heartbeats: {summary.fleetStatus.missedHeartbeats}.
              </p>
            </div>

            <div className="es-summary-block">
              <span className="es-summary-block-label">2. TELEMETRY THROUGHPUT</span>
              <div className="es-summary-block-val">{summary.telemetry.messagesTotal.toLocaleString()} Packets</div>
              <p className="es-summary-block-desc">
                Zero data gaps detected. Peak ingestion: {summary.telemetry.peakRate} msg/s at {summary.telemetry.peakTime}.
              </p>
            </div>

            <div className="es-summary-block">
              <span className="es-summary-block-label">3. INCIDENTS & FAULTS</span>
              <div className="es-summary-block-val">{summary.incidents.activeCount} Active ({summary.incidents.criticalCount} Critical)</div>
              <p className="es-summary-block-desc">
                {summary.incidents.resolvedCount} incident resolved earlier today. Deduplication window: 300s.
              </p>
            </div>

            <div className="es-summary-block">
              <span className="es-summary-block-label">4. NODE 3 MOTOR PREDICTIVE AI</span>
              <div className="es-summary-block-val">Health Score: {summary.node3Motor.healthScore}%</div>
              <p className="es-summary-block-desc">
                RMS Vibration: <strong>{summary.node3Motor.rmsVibrationG}g</strong>. {summary.node3Motor.trend}.
              </p>
            </div>
          </div>

          {/* Recommendations & Urgency */}
          <div className="es-summary-recs">
            <strong className="es-summary-recs-title">Prioritized Next Actions</strong>
            <div className="es-summary-recs-list">
              {summary.recommendations.map((rec, idx) => (
                <div key={idx} className={`es-summary-rec-item is-${rec.priority}`}>
                  <span className={`es-summary-rec-badge is-${rec.priority}`}>{rec.priority.toUpperCase()}</span>
                  <span className="es-summary-rec-text">{rec.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Caveats & Provenance */}
          <div className="es-summary-caveats">
            <span className="es-summary-caveats-title">Data Quality & Engineering Caveats:</span>
            <ul>
              {summary.caveats.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}

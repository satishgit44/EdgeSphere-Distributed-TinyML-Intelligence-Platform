import {
  X,
  Cpu,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useSimulator } from '@/context/SimulatorContext';
import { useNavigation } from '@/context/NavigationContext';
import type { PlannedNode } from '@/types';

interface NodeLiveDetailModalProps {
  node: PlannedNode | null;
  onClose: () => void;
}

export function NodeLiveDetailModal({ node, onClose }: NodeLiveDetailModalProps) {
  const { history, predictions, injectSensorFault, incidents, resolveIncident } = useSimulator();
  const { navigate } = useNavigation();

  if (!node) return null;

  const pred = predictions[node.id];
  const isFault = node.integrationState === 'fault';
  const nodeIncidents = incidents.filter((i) => i.nodeId === node.id && i.status !== 'resolved');

  // Chart telemetry history specific to this node
  const chartData = history.slice(-15).map((pt) => {
    let signalVal = pt.latencyMs;
    if (node.id === 'node-esp32-adxl345') {
      signalVal = +(pt.node3RmsG * 100).toFixed(2); // scaled RMS
    } else if (node.id === 'node-nano33-ble') {
      signalVal = +(pt.gatewayCpu * 0.8).toFixed(1);
    } else if (node.id === 'node-esp32-max9814') {
      signalVal = +(58 + Math.sin(Number(pt.timeLabel.slice(-2))) * 4).toFixed(1);
    }
    return {
      time: pt.timeLabel.slice(3, 8),
      latency: pt.latencyMs,
      signal: signalVal,
    };
  });

  const handleNavigateToXAi = () => {
    onClose();
    if (node.id === 'node-esp32-adxl345') {
      navigate('predictive-ai');
    } else {
      navigate('telemetry');
    }
  };

  return (
    <div
      className="es-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-node-modal-title"
      onClick={onClose}
    >
      <div
        className="es-modal-content es-live-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="es-modal-header es-live-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="es-live-modal-avatar">
              <Cpu size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 id="live-node-modal-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#17171C' }}>
                  {node.name}
                </h3>
                <span className="es-inf-chip">{node.id}</span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#737487', margin: '2px 0 0' }}>
                {node.role} • {node.targetMcu.split('(')[0].trim()}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`es-inf-status-pill ${isFault ? 'is-fault' : 'is-online'}`}>
              {isFault ? 'FAULT / OVERRUN' : 'SIMULATED LIVE'}
            </span>
            <button
              type="button"
              className="es-icon-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="es-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Prediction Hero Banner */}
          <div className="es-live-hero-prediction-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8F90A6', fontWeight: 700 }}>
                  Active TinyML Prediction
                </span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>
                  {pred ? pred.predictionClass.replace(/_/g, ' ') : 'Analyzing...'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: isFault ? '#FF5E62' : '#3EE8B5' }}>
                  {pred ? Math.round(pred.confidence * 100) : 90}%
                </div>
                <span style={{ fontSize: '10.5px', color: '#8F90A6' }}>Score Confidence</span>
              </div>
            </div>

            {/* Natural Explainable Reasoning */}
            <div className="es-live-explanation-strip">
              <span className="es-explain-label">Explainable Reasoning:</span>
              <p className="es-explain-text">
                {pred?.explanation || 'Model evaluates steady-state continuous signals without anomalous statistical drift.'}
              </p>
            </div>
          </div>

          {/* Time Series Charts */}
          <div className="es-live-chart-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#17171C' }}>
                Recent Signal Stream & Latency History (ms)
              </span>
              <span style={{ fontSize: '11px', color: '#8F90A6', fontFamily: 'var(--font-mono)' }}>
                1s sample cadence • Bounded buffer
              </span>
            </div>

            <div style={{ height: 160, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF7" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8F90A6' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8F90A6' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="latency" name="Inference Latency (ms)" stroke="#1677F8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="signal" name="Signal Vector" stroke="#16A36A" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Contributing Feature Values */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#17171C', margin: '0 0 10px' }}>
              Contributing Sensor Features & Telemetry Weights
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {pred?.contributingFeatures.map((feat, idx) => (
                <div key={idx} className="es-contributing-feature-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10.5px', color: '#8F90A6', fontWeight: 600 }}>{feat.label}</span>
                    <span className={`es-impact-pill is-${feat.impact}`}>{feat.impact}</span>
                  </div>
                  <strong style={{ fontSize: '16px', color: '#17171C', marginTop: 4, display: 'block', fontFamily: 'var(--font-mono)' }}>
                    {feat.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Active Incidents & Recommended Mechanical Actions */}
          {nodeIncidents.length > 0 && (
            <div className="es-live-alert-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D83A4E' }}>
                <AlertTriangle size={15} />
                <strong style={{ fontSize: '12.5px' }}>Active Anomaly: {nodeIncidents[0].title}</strong>
              </div>
              <p style={{ fontSize: '11.5px', color: '#555', margin: '4px 0 8px' }}>
                {nodeIncidents[0].description}
              </p>
              <div style={{ fontSize: '11.5px', color: '#1677F8', fontWeight: 600 }}>
                Recommended Action: {nodeIncidents[0].remediationStep || 'Inspect SPI FIFO prescaler and recalibrate baseline.'}
              </div>
              <button
                type="button"
                className="es-nexus-action-button-primary"
                style={{ marginTop: 10, alignSelf: 'flex-start', fontSize: '11px', padding: '4px 10px' }}
                onClick={() => resolveIncident(nodeIncidents[0].id)}
              >
                Clear / Resolve Anomaly
              </button>
            </div>
          )}

          {/* Simulation Provenance Disclosure */}
          <div className="es-live-provenance-box">
            <ShieldCheck size={14} color="#7455F5" />
            <div>
              <strong>Simulation Provenance:</strong> Generated by EdgeSphere Continuous Telemetry Simulator Engine. Inference Engine: <code>{pred?.engine || 'TFLite Micro INT8'}</code>. Runtime Status: <code>{pred?.executionStatus || 'Simulated Rule-Based'}</code>.
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #ECEAF5' }}>
            {node.id === 'node-esp32-adxl345' && (
              <button
                type="button"
                className="es-btn es-btn--secondary"
                onClick={handleNavigateToXAi}
              >
                <Activity size={13} /> Open Node 3 FFT Diagnostics
              </button>
            )}

            <button
              type="button"
              className={`es-btn ${isFault ? 'es-btn--secondary' : 'es-btn--danger'}`}
              onClick={() => injectSensorFault(node.id)}
            >
              <Zap size={13} /> {isFault ? 'Re-Trigger Fault' : 'Inject Sensor Fault'}
            </button>

            <button
              type="button"
              className="es-btn"
              onClick={onClose}
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

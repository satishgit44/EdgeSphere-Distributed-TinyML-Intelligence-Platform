import { useState } from 'react';
import {
  Radio,
  BatteryCharging,
  Wifi,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
} from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { NodeLiveDetailModal } from '@/components/devices/NodeLiveDetailModal';
import { RegisterDeviceModal } from '@/components/devices/RegisterDeviceModal';
import type { PlannedNode } from '@/types';

export interface LiveNodesGridProps {
  searchTerm?: string;
  filterState?: 'all' | 'active' | 'awaiting' | 'fault';
  onClearFilters?: () => void;
}

export function LiveNodesGrid({
  searchTerm = '',
  filterState = 'all',
  onClearFilters,
}: LiveNodesGridProps = {}) {
  const { nodes, predictions, isSimulatorRunning, toggleSimulatorRunning, setSelectedNode } = useSimulator();
  const [detailNode, setDetailNode] = useState<PlannedNode | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Focus initially on the 5 baseline nodes as mandated, then support custom registered nodes separately
  const baselineNodes = nodes.filter((n) =>
    ['node-nano33-ble', 'node-esp32-max9814', 'node-esp32-adxl345', 'node-esp32-pir-dist', 'node-esp32-env-bme'].includes(n.id)
  );
  const registeredCustomNodes = nodes.filter(
    (n) => !['node-nano33-ble', 'node-esp32-max9814', 'node-esp32-adxl345', 'node-esp32-pir-dist', 'node-esp32-env-bme'].includes(n.id)
  );

  const filterNode = (n: PlannedNode) => {
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const match =
        n.id.toLowerCase().includes(q) ||
        n.name.toLowerCase().includes(q) ||
        n.targetMcu.toLowerCase().includes(q) ||
        n.onboardSensors.some((s) => s.toLowerCase().includes(q)) ||
        n.intendedTinyML.toLowerCase().includes(q) ||
        n.role.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterState === 'active') {
      return n.integrationState === 'connected' || n.integrationState === 'simulated';
    }
    if (filterState === 'awaiting') {
      return n.integrationState === 'awaiting_integration' || n.integrationState === 'configured';
    }
    if (filterState === 'fault') {
      return n.integrationState === 'fault';
    }
    return true;
  };

  const filteredBaselineNodes = baselineNodes.filter(filterNode);
  const filteredCustomNodes = registeredCustomNodes.filter(filterNode);

  const handleOpenDetail = (node: PlannedNode) => {
    setSelectedNode(node);
    setDetailNode(node);
  };

  const renderNodeCard = (node: PlannedNode) => {
    const pred = predictions[node.id];
    const isFault = node.integrationState === 'fault';
    const isOnline = node.integrationState === 'connected' || node.integrationState === 'simulated';

    // Battery & RSSI
    const batteryPct = pred?.batteryPct ?? 88;
    const batteryV = pred?.batteryVoltage ?? 3.7;
    const rssiDbm = pred?.rssiDbm ?? -60;
    const engine = pred?.engine ?? 'TFLite Micro (INT8)';
    const confidencePct = pred ? Math.round(pred.confidence * 100) : 90;

    return (
      <article
        key={node.id}
        className={`es-inference-card ${isFault ? 'is-fault' : ''}`}
        onClick={() => handleOpenDetail(node)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenDetail(node);
          }
        }}
        aria-label={`Inspect ${node.name}`}
      >
        {/* Top Header Row: Node Identifier, Hardware, Status */}
        <div className="es-inf-card-header">
          <div className="es-inf-id-group">
            <span className="es-inf-chip">{node.id}</span>
            <span className="es-inf-comms">
              <Radio size={11} /> {node.commsBus.split(' ')[0]}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isFault ? (
              <span className="es-inf-status-pill is-fault">
                <AlertTriangle size={11} /> FAULT
              </span>
            ) : isOnline ? (
              <span className="es-inf-status-pill is-online">
                <span className="es-inf-pulse-dot" /> LIVE SIM
              </span>
            ) : (
              <span className="es-inf-status-pill is-awaiting">
                AWAITING HW
              </span>
            )}
          </div>
        </div>

        {/* Title & Sensor Description */}
        <div className="es-inf-title-block">
          <h3 className="es-inf-node-name">{node.name}</h3>
          <p className="es-inf-workload">{node.intendedTinyML.split('(')[0].trim()}</p>
        </div>

        {/* Prediction Hero Box */}
        <div className="es-inf-prediction-box">
          <div className="es-inf-pred-top">
            <span className="es-inf-pred-label">Current Inference</span>
            <span className="es-inf-engine-tag">{engine}</span>
          </div>

          <div className="es-inf-pred-result-row">
            <span className="es-inf-pred-class">
              {pred ? pred.predictionClass.replace(/_/g, ' ') : 'evaluating...'}
            </span>
            <div className="es-inf-confidence-badge">
              <span className="es-inf-conf-num">{confidencePct}%</span>
              <span className="es-inf-conf-sub">Score</span>
            </div>
          </div>

          {/* Confidence Track */}
          <div className="es-inf-conf-bar-track">
            <div
              className={`es-inf-conf-bar-fill ${isFault ? 'is-danger' : confidencePct > 80 ? 'is-high' : 'is-mid'}`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>

        {/* Dense Telemetry Feature Metrics */}
        <div className="es-inf-feature-grid">
          {pred?.contributingFeatures.slice(0, 2).map((feat, idx) => (
            <div key={idx} className="es-inf-feature-cell">
              <span className="es-inf-feat-label">{feat.label}</span>
              <strong className="es-inf-feat-val">{feat.value}</strong>
            </div>
          )) || (
            <>
              <div className="es-inf-feature-cell">
                <span className="es-inf-feat-label">Packets</span>
                <strong className="es-inf-feat-val">{node.packetCount} msg</strong>
              </div>
              <div className="es-inf-feature-cell">
                <span className="es-inf-feat-label">Latency</span>
                <strong className="es-inf-feat-val">{pred?.latencyMs || 8.4} ms</strong>
              </div>
            </>
          )}
        </div>

        {/* Card Footer: Latency, Battery, RSSI, Deep Link */}
        <div className="es-inf-card-footer">
          <div className="es-inf-footer-metrics">
            <span title="Inference Latency" className="es-inf-metric-item">
              <Clock size={12} /> {pred?.latencyMs || 8.2}ms
            </span>
            <span title="Signal Strength" className="es-inf-metric-item">
              <Wifi size={12} /> {rssiDbm}dBm
            </span>
            <span title="Battery Estimate" className="es-inf-metric-item">
              <BatteryCharging size={12} /> {batteryPct}% ({batteryV}V)
            </span>
          </div>

          <button
            type="button"
            className="es-inf-inspect-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetail(node);
            }}
            aria-label={`Detailed analysis of ${node.name}`}
          >
            <span>Analyze</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="es-live-nodes-section">
      {/* Simulation Banner Notice */}
      <div className="es-simulation-disclosure-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={16} color="#42DDE7" />
          <span>
            <strong>Simulated Edge AI Fleet:</strong> Telemetry values, FFT features, and INT8 scores are generated by the local simulator. Hardware is currently unattached.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="es-sim-control-pill"
            onClick={toggleSimulatorRunning}
          >
            {isSimulatorRunning ? (
              <>
                <Pause size={12} /> Pause Stream
              </>
            ) : (
              <>
                <Play size={12} /> Resume Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of the 5 Core EdgeSphere Nodes */}
      <div className="es-inference-grid-wrap">
        <div className="es-inf-section-header">
          <div>
            <h2 className="es-inf-section-title">Core Embedded TinyML Nodes</h2>
            <p className="es-inf-section-subtitle">
              Continuous live inference, feature attribution, and telemetry telemetry for the 5 initial EdgeSphere nodes.
            </p>
          </div>
          <span className="es-inf-section-count">
            {filteredBaselineNodes.length} of 5 Initial Nodes
          </span>
        </div>

        {filteredBaselineNodes.length === 0 ? (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: '#FFFFFF',
              border: '1px solid var(--es-border, #E9E9F0)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--es-text, #17171C)' }}>
              No inference cards match current filters
            </span>
            <span style={{ fontSize: '12px', color: 'var(--es-text-secondary, #737487)' }}>
              Search: &ldquo;{searchTerm || 'none'}&rdquo; • Filter: &ldquo;{filterState}&rdquo;
            </span>
            {onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                style={{
                  marginTop: 6,
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--es-border, #E9E9F0)',
                  background: 'var(--color-primary-50, #F3F0FF)',
                  color: 'var(--color-primary-600, #6744E8)',
                  cursor: 'pointer',
                }}
              >
                Clear Filters & Show All
              </button>
            )}
          </div>
        ) : (
          <div className="es-inference-card-grid">
            {filteredBaselineNodes.map(renderNodeCard)}
          </div>
        )}
      </div>

      {/* Custom Registered Nodes (if any added dynamically via Phase B modal) */}
      {filteredCustomNodes.length > 0 && (
        <div className="es-inference-grid-wrap" style={{ marginTop: 28 }}>
          <div className="es-inf-section-header">
            <div>
              <h2 className="es-inf-section-title">Registered Fleet Extension Nodes</h2>
              <p className="es-inf-section-subtitle">
                User-registered devices dynamically active in the simulator fleet.
              </p>
            </div>
            <span className="es-inf-section-count">{filteredCustomNodes.length} Registered</span>
          </div>

          <div className="es-inference-card-grid">
            {filteredCustomNodes.map(renderNodeCard)}
          </div>
        </div>
      )}

      {/* Live Node Detail Inspector Modal */}
      <NodeLiveDetailModal
        node={detailNode}
        onClose={() => setDetailNode(null)}
      />

      <RegisterDeviceModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  );
}

import { useState } from 'react';
import { X, Cpu, Copy, Check, AlertTriangle, Radio } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { StatusBadge } from '@/components/common/StatusBadge';

export function NodeDetailModal() {
  const { selectedNode, setSelectedNode, injectSensorFault } = useSimulator();
  const [copiedTopic, setCopiedTopic] = useState(false);

  if (!selectedNode) return null;

  const handleCopyTopic = () => {
    navigator.clipboard.writeText(selectedNode.mqttTopic);
    setCopiedTopic(true);
    setTimeout(() => setCopiedTopic(false), 2000);
  };

  return (
    <div
      className="es-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={() => setSelectedNode(null)}
    >
      <div
        className="es-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="es-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Cpu size={18} color="var(--color-primary-600)" />
              <h3 id="modal-title" style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
                {selectedNode.name}
              </h3>
              <span className="es-chip">{selectedNode.id}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-neutral-500)', marginTop: 2 }}>
              {selectedNode.role}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <StatusBadge
              status={selectedNode.integrationState}
              label={selectedNode.integrationState.toUpperCase().replace('_', ' ')}
            />
            <button
              type="button"
              className="es-icon-btn"
              onClick={() => setSelectedNode(null)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="es-modal-body">
          {/* Hardware & Target MCU */}
          <div className="es-prop-grid">
            <div className="es-prop-item">
              <span className="es-prop-label">Target MCU & Architecture</span>
              <span className="es-prop-val">{selectedNode.targetMcu}</span>
            </div>
            <div className="es-prop-item">
              <span className="es-prop-label">Communication Transport</span>
              <span className="es-prop-val">{selectedNode.commsBus}</span>
            </div>
            <div className="es-prop-item">
              <span className="es-prop-label">Active / Staged TinyML Model</span>
              <span className="es-prop-val">
                {selectedNode.activeModelId ? (
                  <span style={{ color: 'var(--color-primary-600)' }}>{selectedNode.activeModelId}</span>
                ) : (
                  <span style={{ color: 'var(--color-neutral-400)' }}>None deployed</span>
                )}
              </span>
            </div>
            <div className="es-prop-item">
              <span className="es-prop-label">Total Packets Ingested</span>
              <span className="es-prop-val">{selectedNode.packetCount} messages</span>
            </div>
          </div>

          {/* Pinout & Bus Connections */}
          <div style={{ borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
            <h4 className="es-prop-label" style={{ marginBottom: 'var(--space-2)' }}>
              Hardware Pinout & Bus Configuration
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedNode.pinout.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'var(--surface-code)',
                    border: 'var(--border-default)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span>
                    <strong style={{ color: 'var(--color-primary-700)' }}>[{p.bus}]</strong> {p.pins}
                  </span>
                  {p.clockOrBaud && (
                    <span style={{ color: 'var(--color-neutral-500)' }}>{p.clockOrBaud}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sensor Signals */}
          <div style={{ borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
            <h4 className="es-prop-label" style={{ marginBottom: 'var(--space-2)' }}>
              Recent Telemetry Signals
            </h4>
            {selectedNode.recentSignals ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 'var(--space-2)',
                }}
              >
                {Object.entries(selectedNode.recentSignals).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      padding: '8px',
                      background: 'var(--surface-card-subtle)',
                      border: 'var(--border-default)',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: 'var(--color-neutral-500)', fontFamily: 'var(--font-mono)' }}>
                      {key}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-neutral-900)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-400)' }}>
                No telemetry signals recorded yet. Device is awaiting physical hardware wiring or simulator activation.
              </p>
            )}
          </div>

          {/* MQTT Topic & JSON Payload Snippet */}
          <div style={{ borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span className="es-prop-label">MQTT Ingestion Topic</span>
              <button
                type="button"
                className="es-btn"
                style={{ fontSize: '10px', padding: '2px 6px' }}
                onClick={handleCopyTopic}
              >
                {copiedTopic ? <Check size={11} color="var(--color-success-600)" /> : <Copy size={11} />}
                {copiedTopic ? 'Copied' : 'Copy Topic'}
              </button>
            </div>
            <div className="es-chip" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px' }}>
              <Radio size={12} style={{ marginRight: 6 }} />
              {selectedNode.mqttTopic}
            </div>

            {selectedNode.rawPayloadSnippet && (
              <div style={{ marginTop: 'var(--space-2)' }}>
                <span className="es-prop-label" style={{ display: 'block', marginBottom: 4 }}>
                  Last Ingested JSON Packet
                </span>
                <div className="es-raw-payload">{selectedNode.rawPayloadSnippet}</div>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div
            style={{
              borderTop: 'var(--border-default)',
              paddingTop: 'var(--space-3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {selectedNode.integrationState === 'simulated' ? (
              <button
                type="button"
                className="es-btn es-btn--danger"
                onClick={() => {
                  injectSensorFault(selectedNode.id);
                  setSelectedNode(null);
                }}
              >
                <AlertTriangle size={13} />
                Inject Sensor Fault
              </button>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--color-neutral-400)' }}>
                Fault injection available on simulated nodes
              </span>
            )}

            <button
              type="button"
              className="es-btn"
              onClick={() => setSelectedNode(null)}
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

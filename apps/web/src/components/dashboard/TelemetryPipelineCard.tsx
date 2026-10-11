import { Radio, Activity } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { StatusBadge } from '@/components/common/StatusBadge';

export function TelemetryPipelineCard() {
  const { pipeline, nodes, isFreshInstall } = useSimulator();

  const activeNodesWithSignals = nodes.filter(
    (n) => (n.integrationState === 'simulated' || n.integrationState === 'fault') && n.recentSignals,
  );

  return (
    <article className="es-card">
      <div className="es-card-header">
        <div>
          <h3 className="es-card-title">
            <Radio size={16} color="var(--color-cyan-600)" />
            Telemetry Ingestion Pipeline
          </h3>
          <p className="es-card-subtitle es-mono">
            {pipeline.brokerEngine}
          </p>
        </div>
        <StatusBadge
          status={pipeline.pipelineHealth}
          label={pipeline.pipelineHealth.toUpperCase()}
        />
      </div>

      <div className="es-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Pipeline Ingestion Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--surface-card-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-default)',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          <div>
            <div style={{ color: 'var(--color-neutral-500)', fontSize: '10px', textTransform: 'uppercase' }}>
              Messages Total
            </div>
            <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {pipeline.messagesReceivedTotal}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--color-neutral-500)', fontSize: '10px', textTransform: 'uppercase' }}>
              Ingest Throughput
            </div>
            <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {pipeline.ingestionRatePerSec} <span style={{ fontSize: '10px' }}>msg/s</span>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--color-neutral-500)', fontSize: '10px', textTransform: 'uppercase' }}>
              Dropped Packets
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-md)',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: pipeline.droppedPacketsCount > 0 ? 'var(--color-danger-600)' : 'var(--color-neutral-800)',
              }}
            >
              {pipeline.droppedPacketsCount}
            </div>
          </div>
        </div>

        {/* Live Signal Stream across Active Nodes */}
        <div>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-neutral-500)', letterSpacing: '0.04em', marginBottom: 6 }}>
            Active Channel Telemetry Signals
          </h4>

          {isFreshInstall || activeNodesWithSignals.length === 0 ? (
            <div
              style={{
                padding: 'var(--space-4)',
                textAlign: 'center',
                background: 'var(--surface-card-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: 'var(--border-subtle)',
                color: 'var(--color-neutral-500)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              No active message channels. Devices not yet paired or simulator paused.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeNodesWithSignals.map((node) => {
                const signals = node.recentSignals!;
                const firstTwoSignals = Object.entries(signals).slice(0, 3);
                return (
                  <div
                    key={node.id}
                    style={{
                      padding: '6px 10px',
                      background: 'var(--surface-card)',
                      border: 'var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={13} color="var(--color-cyan-600)" />
                      <span className="es-chip" style={{ fontSize: '10px' }}>{node.id}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>
                      {firstTwoSignals.map(([key, val]) => (
                        <span key={key} style={{ color: 'var(--color-neutral-700)' }}>
                          <span style={{ color: 'var(--color-neutral-400)' }}>{key}: </span>
                          <strong>{typeof val === 'boolean' ? (val ? '1' : '0') : String(val)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

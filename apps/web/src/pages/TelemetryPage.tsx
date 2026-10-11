import { TelemetryPipelineCard } from '@/components/dashboard/TelemetryPipelineCard';
import { useSimulator } from '@/context/SimulatorContext';

export function TelemetryPage() {
  const { nodes } = useSimulator();

  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Telemetry Streams</span>
          </div>
          <h1 className="es-nexus-title">Telemetry & MQTT Bus</h1>
          <p className="es-nexus-subtitle">
            Ingestion pipeline, ring buffer status, packet parsing, and sensor payload inspector.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <TelemetryPipelineCard />

        <article className="es-nexus-card">
          <div className="es-nexus-card-header">
            <div>
              <h3 className="es-nexus-card-title">Active Ingestion Topics</h3>
              <p className="es-nexus-card-subtitle">Local Eclipse Mosquitto broker topics</p>
            </div>
            <span className="es-nexus-mini-badge">QoS 1 • WS Port 9001</span>
          </div>
          <div className="es-nexus-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {nodes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #ECEAF5',
                    background: '#FAF9FD',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#161528' }}>{n.name}</div>
                  <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: '#7455F5', marginTop: 4 }}>
                    {n.mqttTopic}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8F90A6', marginTop: 4 }}>
                    Packets: {n.packetCount} • Payload: {n.rawPayloadSnippet}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

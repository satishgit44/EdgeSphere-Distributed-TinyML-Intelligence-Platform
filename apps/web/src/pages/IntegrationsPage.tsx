import { GatewayStatusPanel } from '@/components/dashboard/GatewayStatusPanel';
import { Server, Shield } from 'lucide-react';

export function IntegrationsPage() {
  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Integrations</span>
          </div>
          <h1 className="es-nexus-title">Local Broker & Gateway Integrations</h1>
          <p className="es-nexus-subtitle">
            Local-first MQTT infrastructure on Raspberry Pi 5. No mandatory cloud dependencies.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <GatewayStatusPanel />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <article className="es-nexus-card">
            <div className="es-nexus-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={16} color="#7455F5" />
                <h3 className="es-nexus-card-title">Eclipse Mosquitto MQTT</h3>
              </div>
              <span className="es-nexus-status-pill es-nexus-status--active">Port 1883</span>
            </div>
            <div className="es-nexus-card-body" style={{ fontSize: '13px', color: '#737487' }}>
              <p>Host: <code>127.0.0.1 (Localhost / eth0)</code></p>
              <p style={{ marginTop: 6 }}>WebSockets: <code>ws://127.0.0.1:9001</code></p>
              <p style={{ marginTop: 6 }}>Auth Mode: Token-based mTLS / Local Unix Socket</p>
            </div>
          </article>

          <article className="es-nexus-card">
            <div className="es-nexus-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#7455F5" />
                <h3 className="es-nexus-card-title">Local Ingest Daemon (edgesphere-ingestd)</h3>
              </div>
              <span className="es-nexus-status-pill es-nexus-status--active">Active</span>
            </div>
            <div className="es-nexus-card-body" style={{ fontSize: '13px', color: '#737487' }}>
              <p>Ring Buffer: <code>/var/log/edgesphere/ring.db</code></p>
              <p style={{ marginTop: 6 }}>Buffer Size: 250 MB ring storage</p>
              <p style={{ marginTop: 6 }}>Integrity Check: SHA-256 HMAC packet validation</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

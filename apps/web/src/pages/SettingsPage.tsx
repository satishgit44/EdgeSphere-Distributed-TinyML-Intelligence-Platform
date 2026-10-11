import { SimulatorControlBar } from '@/components/dashboard/SimulatorControlBar';
import { useSimulator } from '@/context/SimulatorContext';
import { Shield, Terminal } from 'lucide-react';

export function SettingsPage() {
  const { mode, gateway } = useSimulator();

  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Settings</span>
          </div>
          <h1 className="es-nexus-title">Edge Gateway & System Settings</h1>
          <p className="es-nexus-subtitle">
            Configure local Raspberry Pi 5 daemons, hardware/simulator telemetry modes, and network security.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SimulatorControlBar />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <article className="es-nexus-card">
            <div className="es-nexus-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="#7455F5" />
                <h3 className="es-nexus-card-title">Gateway Daemon Config</h3>
              </div>
            </div>
            <div className="es-nexus-card-body" style={{ fontSize: '13px', color: '#737487' }}>
              <p>Hardware Model: <strong>{gateway.hardwareModel}</strong></p>
              <p style={{ marginTop: 6 }}>Operating System: <code>{gateway.os}</code></p>
              <p style={{ marginTop: 6 }}>Telemetry Mode: <strong>{mode.toUpperCase()}</strong></p>
              <p style={{ marginTop: 6 }}>Mosquitto Port: <code>1883 (TCP), 9001 (WS)</code></p>
            </div>
          </article>

          <article className="es-nexus-card">
            <div className="es-nexus-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#7455F5" />
                <h3 className="es-nexus-card-title">Security & Credentials</h3>
              </div>
            </div>
            <div className="es-nexus-card-body" style={{ fontSize: '13px', color: '#737487' }}>
              <p>Local Access Token: <code>••••••••••••••••••••••••</code></p>
              <p style={{ marginTop: 6 }}>mTLS Certificate: <code>/etc/edgesphere/certs/pi5-server.crt</code></p>
              <p style={{ marginTop: 6 }}>Audit Logging: <strong>Enabled (SHA-256)</strong></p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

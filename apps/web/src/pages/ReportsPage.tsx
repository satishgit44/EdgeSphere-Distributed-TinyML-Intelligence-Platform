import { Download } from 'lucide-react';

export function ReportsPage() {
  const handleDownload = (format: string) => {
    alert(`Generating EdgeSphere ${format.toUpperCase()} report: Gateway telemetry, Node vibration spectra, and model benchmarks.`);
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

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="es-nexus-pill active"
            onClick={() => handleDownload('json')}
          >
            <Download size={13} /> Export JSON
          </button>
          <button
            type="button"
            className="es-nexus-pill active"
            onClick={() => handleDownload('csv')}
          >
            <Download size={13} /> Export CSV
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
                onClick={() => handleDownload('pdf')}
              >
                Download Vibration Audit (PDF)
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
                onClick={() => handleDownload('pdf')}
              >
                Download Gateway Audit (PDF)
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

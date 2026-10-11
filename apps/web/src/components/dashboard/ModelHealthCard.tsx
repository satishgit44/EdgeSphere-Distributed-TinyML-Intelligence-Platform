export function ModelHealthCard() {
  const nodeLatencyData = [
    { name: 'Node 1', label: 'IMU-Net', latency: 12.4, height: 45 },
    { name: 'Node 2', label: 'MFCC', latency: 28.1, height: 95 },
    { name: 'Node 3', label: 'ADXL', latency: 8.4, height: 32 },
    { name: 'Node 4', label: 'Sonar', latency: 4.2, height: 18 },
    { name: 'Node 5', label: 'Air-BME', latency: 16.5, height: 60 },
  ];

  return (
    <article className="es-nexus-card es-nexus-model-health-card">
      <div className="es-nexus-card-header">
        <div>
          <h3 className="es-nexus-card-title">Model & inference health</h3>
          <p className="es-nexus-card-subtitle">TinyML INT8 latency by node (ms)</p>
        </div>
        <span className="es-nexus-mini-badge">Benchmarked</span>
      </div>

      <div className="es-nexus-card-body es-nexus-model-health-body">
        <div className="es-nexus-bar-chart">
          {nodeLatencyData.map((d) => (
            <div key={d.name} className="es-nexus-bar-col">
              <div className="es-nexus-bar-track">
                <div
                  className="es-nexus-bar-fill"
                  style={{ height: `${d.height}%` }}
                  title={`${d.label}: ${d.latency} ms`}
                />
              </div>
              <span className="es-nexus-bar-label">{d.name}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

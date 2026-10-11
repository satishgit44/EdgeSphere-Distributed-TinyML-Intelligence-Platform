import { useSimulator } from '@/context/SimulatorContext';

export function DeviceDistributionCard() {
  const { nodes } = useSimulator();

  const total = nodes.length || 5;
  const onlineCount = nodes.filter((n) => n.integrationState === 'connected' || n.integrationState === 'configured').length;
  const degradedCount = nodes.filter((n) => n.integrationState === 'fault').length;
  const onlinePct = Math.round((onlineCount / total) * 100);

  return (
    <article className="es-nexus-card es-nexus-distribution-card">
      <div className="es-nexus-card-header">
        <div>
          <h3 className="es-nexus-card-title">Device distribution</h3>
          <p className="es-nexus-card-subtitle">Nodes by operational & network state</p>
        </div>
        <span className="es-nexus-mini-badge">Live</span>
      </div>

      <div className="es-nexus-card-body es-nexus-distribution-body">
        {/* Circular purple badge/donut */}
        <div className="es-nexus-donut-wrap">
          <div className="es-nexus-donut-circle">
            <span className="es-nexus-donut-pct">{onlinePct}%</span>
            <span className="es-nexus-donut-lbl">Online</span>
          </div>
        </div>

        {/* Legend with colored dots */}
        <div className="es-nexus-distribution-legend">
          <div className="es-nexus-legend-item">
            <span className="es-nexus-dot es-nexus-dot--purple" />
            <span className="es-nexus-legend-name">Online / Active</span>
            <span className="es-nexus-legend-val">{onlineCount} ({onlinePct}%)</span>
          </div>
          <div className="es-nexus-legend-item">
            <span className="es-nexus-dot es-nexus-dot--cyan" />
            <span className="es-nexus-legend-name">Simulated Mesh</span>
            <span className="es-nexus-legend-val">{onlineCount} ({onlinePct}%)</span>
          </div>
          <div className="es-nexus-legend-item">
            <span className="es-nexus-dot es-nexus-dot--amber" />
            <span className="es-nexus-legend-name">Degraded / Fault</span>
            <span className="es-nexus-legend-val">{degradedCount} ({Math.round((degradedCount / total) * 100)}%)</span>
          </div>
        </div>
      </div>
    </article>
  );
}

import { useSimulator } from '@/context/SimulatorContext';

interface KpiCardItemProps {
  label: string;
  value: string | number;
  badge: {
    text: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  subtitle: string;
  sparkHeights: number[];
}

function KpiCardItem({
  label,
  value,
  badge,
  subtitle,
  sparkHeights,
}: KpiCardItemProps) {
  return (
    <article className="es-nexus-kpi-card">
      <div className="es-nexus-kpi-accent" />
      <div className="es-nexus-kpi-header">
        <span className="es-nexus-kpi-label">{label}</span>
      </div>
      <div className="es-nexus-kpi-val-row">
        <span className="es-nexus-kpi-val">{value}</span>
        <span className={`es-nexus-kpi-badge es-nexus-kpi-badge--${badge.type}`}>
          {badge.type === 'positive' && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2 }}>
              <path d="M7 17l9.2-9.2M17 17V8H8" />
            </svg>
          )}
          {badge.type === 'negative' && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2 }}>
              <path d="M7 7l9.2 9.2M17 7v9H8" />
            </svg>
          )}
          {badge.text}
        </span>
      </div>
      <div className="es-nexus-kpi-subtitle">{subtitle}</div>

      {/* Pill capsule bars at the bottom with cyan-to-purple gradient */}
      <div className="es-nexus-kpi-capsules" aria-hidden="true">
        {sparkHeights.map((h, i) => (
          <div
            key={i}
            className="es-nexus-capsule-bar"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </article>
  );
}

export function KpiCardsRow() {
  const { gateway, nodes, pipeline, incidents, isFreshInstall } = useSimulator();

  const faultCount = nodes.filter((n) => n.integrationState === 'fault').length;
  const connectedCount = nodes.filter((n) => n.integrationState === 'connected' || n.integrationState === 'configured').length;
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  return (
    <section className="es-nexus-kpi-row" aria-label="Fleet KPI Summary">
      <KpiCardItem
        label="GATEWAY HEALTH"
        value={isFreshInstall ? 'OFFLINE' : (gateway.status === 'active' ? 'ONLINE' : 'DEGRADED')}
        badge={{
          text: isFreshInstall ? '0%' : (gateway.cpuLoadPct < 80 ? '+99.8%' : '-5.2%'),
          type: isFreshInstall ? 'neutral' : (gateway.cpuLoadPct < 80 ? 'positive' : 'negative'),
        }}
        subtitle={isFreshInstall ? 'Awaiting gateway setup' : `Raspberry Pi 5 · ${gateway.thermalTempC.toFixed(1)}°C`}
        sparkHeights={[30, 48, 38, 70, 55, 88, 65]}
      />

      <KpiCardItem
        label="CONNECTED NODES"
        value={`0${connectedCount} / 05`}
        badge={{
          text: faultCount === 0 ? '+100%' : `-${faultCount * 20}%`,
          type: faultCount === 0 ? 'positive' : 'negative',
        }}
        subtitle={`${connectedCount} active · ${faultCount} degraded`}
        sparkHeights={[25, 40, 60, 75, 50, 95, 70]}
      />

      <KpiCardItem
        label="TELEMETRY RATE"
        value={isFreshInstall ? '0 msg/s' : `${pipeline.ingestionRatePerSec.toFixed(1)} msg/s`}
        badge={{
          text: '+8.0%',
          type: 'positive',
        }}
        subtitle="Mosquitto ring buffer active"
        sparkHeights={[20, 35, 50, 65, 80, 90, 85]}
      />

      <KpiCardItem
        label="ACTIVE INCIDENTS"
        value={openIncidents.length === 0 ? '00 Critical' : `0${openIncidents.length} Active`}
        badge={{
          text: openIncidents.length === 0 ? 'Normal' : '-0.4pts',
          type: openIncidents.length === 0 ? 'positive' : 'negative',
        }}
        subtitle={faultCount ? `${faultCount} node flagged · review vibration` : '0 critical · 1 warning'}
        sparkHeights={[15, 25, 30, 20, 28, 22, 18]}
      />
    </section>
  );
}

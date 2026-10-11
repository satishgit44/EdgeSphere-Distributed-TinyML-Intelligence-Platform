import { IncidentManagerCard } from '@/components/dashboard/IncidentManagerCard';

export function AlertsPage() {
  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Alerts & Incidents</span>
          </div>
          <h1 className="es-nexus-title">Fleet Faults & Operational Incidents</h1>
          <p className="es-nexus-subtitle">
            Audited edge fault flags, sensor disconnections, and automated anomaly warnings.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <IncidentManagerCard />
      </div>
    </div>
  );
}

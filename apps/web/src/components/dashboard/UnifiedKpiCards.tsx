import { Info, Cpu, Wifi, Database, AlertTriangle } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function UnifiedKpiCards() {
  const { nodes, pipeline, incidents, isFreshInstall } = useSimulator();

  const faultCount = nodes.filter((n) => n.integrationState === 'fault').length;
  const onlineCount = nodes.filter((n) => n.integrationState === 'connected' || n.integrationState === 'configured').length;
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  return (
    <section className="es-kpi-grid-unified" aria-label="Fleet KPI Metrics">
      {/* 1. Total Devices */}
      <article className="es-kpi-card-unified">
        <div className="es-kpi-top">
          <div className="es-kpi-label-group">
            <span className="es-kpi-title">Total Devices</span>
            <Info size={12} className="es-kpi-info-icon" />
          </div>
          <div className="es-kpi-icon-badge es-icon-blue">
            <Cpu size={16} />
          </div>
        </div>

        <div className="es-kpi-metric-row">
          <span className="es-kpi-big-num">{isFreshInstall ? '00' : '250'}</span>
          <span className="es-kpi-trend-pill is-positive">
            &uarr; +12% from last month
          </span>
        </div>
        <div className="es-kpi-subtext">5 initial nodes &bull; extensible registry</div>

        {/* Capsule bars sparkline (Nexus AI reference) */}
        <div className="es-kpi-capsules" aria-hidden="true">
          {[30, 48, 38, 70, 55, 88, 65, 45, 92].map((h, i) => (
            <div key={i} className="es-kpi-capsule-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      </article>

      {/* 2. Online Devices */}
      <article className="es-kpi-card-unified">
        <div className="es-kpi-top">
          <div className="es-kpi-label-group">
            <span className="es-kpi-title">Online Devices</span>
            <Info size={12} className="es-kpi-info-icon" />
          </div>
          <div className="es-kpi-icon-badge es-icon-cyan">
            <Wifi size={16} />
          </div>
        </div>

        <div className="es-kpi-metric-row">
          <span className="es-kpi-big-num">{isFreshInstall ? '00' : (faultCount > 0 ? '184' : '189')}</span>
          <span className="es-kpi-trend-pill is-blue">
            <Wifi size={11} style={{ marginRight: 3 }} /> 93.5% Uptime
          </span>
        </div>
        <div className="es-kpi-subtext">{onlineCount} connected &bull; 0 offline</div>

        <div className="es-kpi-capsules" aria-hidden="true">
          {[25, 40, 60, 75, 50, 95, 70, 80, 85].map((h, i) => (
            <div key={i} className="es-kpi-capsule-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      </article>

      {/* 3. Data Usage / Telemetry */}
      <article className="es-kpi-card-unified">
        <div className="es-kpi-top">
          <div className="es-kpi-label-group">
            <span className="es-kpi-title">Data Usage</span>
            <Info size={12} className="es-kpi-info-icon" />
          </div>
          <div className="es-kpi-icon-badge es-icon-database">
            <Database size={16} />
          </div>
        </div>

        <div className="es-kpi-metric-row">
          <span className="es-kpi-big-num">{isFreshInstall ? '0 B' : '1.2TB'}</span>
          <span className="es-kpi-trend-pill is-orange">
            &bull; 78% of quota
          </span>
        </div>
        <div className="es-kpi-subtext">{pipeline.ingestionRatePerSec.toFixed(1)} msg/s &bull; Mosquitto ring active</div>

        <div className="es-kpi-capsules" aria-hidden="true">
          {[20, 35, 50, 65, 80, 90, 85, 70, 95].map((h, i) => (
            <div key={i} className="es-kpi-capsule-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      </article>

      {/* 4. Active Alerts */}
      <article className="es-kpi-card-unified">
        <div className="es-kpi-top">
          <div className="es-kpi-label-group">
            <span className="es-kpi-title">Active Alerts</span>
            <Info size={12} className="es-kpi-info-icon" />
          </div>
          <div className="es-kpi-icon-badge es-icon-alert">
            <AlertTriangle size={16} />
          </div>
        </div>

        <div className="es-kpi-metric-row">
          <span className="es-kpi-big-num">{openIncidents.length === 0 ? '00' : '12'}</span>
          <span className={`es-kpi-trend-pill ${faultCount > 0 ? 'is-danger' : 'is-positive'}`}>
            {faultCount > 0 ? '&Delta; 2 Critical issue' : 'Nominal mesh'}
          </span>
        </div>
        <div className="es-kpi-subtext">{faultCount ? `${faultCount} node flagged &bull; check vibration` : '0 critical faults &bull; 1 warning'}</div>

        <div className="es-kpi-capsules" aria-hidden="true">
          {[15, 25, 30, 20, 28, 22, 18, 30, 25].map((h, i) => (
            <div key={i} className="es-kpi-capsule-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      </article>
    </section>
  );
}

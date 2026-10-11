import { useState } from 'react';
import { useSimulator } from '@/context/SimulatorContext';

type ActivityFilter = 'all' | 'devices' | 'incidents' | 'models' | 'deployments';

export function RecentActivityTable() {
  const { logs } = useSimulator();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'devices') return log.source.includes('node') || log.source.includes('ingest');
    if (filter === 'incidents') return log.severity === 'error' || log.severity === 'warning';
    if (filter === 'models') return log.source.includes('tflite') || log.message.includes('INT8');
    if (filter === 'deployments') return log.message.includes('deploy') || log.message.includes('OTA');
    return true;
  });

  const getStatusBadge = (sev: string, msg: string) => {
    if (sev === 'error') {
      return <span className="es-nexus-status-pill es-nexus-status--danger">Requires attention</span>;
    }
    if (sev === 'warning') {
      return <span className="es-nexus-status-pill es-nexus-status--warning">Warning</span>;
    }
    if (msg.includes('simulated') || msg.includes('Simulated')) {
      return <span className="es-nexus-status-pill es-nexus-status--simulated">Simulated</span>;
    }
    if (msg.includes('active') || msg.includes('Active')) {
      return <span className="es-nexus-status-pill es-nexus-status--active">Active</span>;
    }
    return <span className="es-nexus-status-pill es-nexus-status--success">Completed</span>;
  };

  const getAvatarInitials = (source: string) => {
    if (source.includes('nano')) return 'N1';
    if (source.includes('max9814')) return 'N2';
    if (source.includes('adxl')) return 'N3';
    if (source.includes('pir')) return 'N4';
    if (source.includes('env')) return 'N5';
    if (source.includes('rpi5')) return 'GW';
    return 'OP';
  };

  return (
    <article className="es-nexus-card es-nexus-activity-card">
      <div className="es-nexus-card-header">
        <div>
          <h3 className="es-nexus-card-title">Recent activity</h3>
          <p className="es-nexus-card-subtitle">
            Latest edge node events, model actions, and telemetry verification
          </p>
        </div>

        {/* Filter pills on right matching reference */}
        <div className="es-nexus-filter-pills" role="group" aria-label="Activity filter">
          {(['all', 'devices', 'incidents', 'models', 'deployments'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`es-nexus-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="es-nexus-table-wrapper">
        <table className="es-nexus-table">
          <thead>
            <tr>
              <th>NODE / OPERATOR</th>
              <th>ACTION</th>
              <th>RESOURCE</th>
              <th>DATE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.slice(0, 6).map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr key={log.id}>
                  <td>
                    <div className="es-nexus-table-user">
                      <div className="es-nexus-table-avatar">
                        {getAvatarInitials(log.source)}
                      </div>
                      <span className="es-nexus-table-username">{log.source}</span>
                    </div>
                  </td>
                  <td className="es-nexus-table-action">
                    {log.message}
                  </td>
                  <td className="es-nexus-table-plan">
                    <code>{log.source.startsWith('node') ? log.source : 'rpi5-manager'}</code>
                  </td>
                  <td className="es-nexus-table-date">
                    {dateStr} · {timeStr}
                  </td>
                  <td>
                    {getStatusBadge(log.severity, log.message)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

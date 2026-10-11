import { useState } from 'react';
import { Terminal, Filter } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import type { EventSeverity } from '@/types';

export function TechnicalEventLog() {
  const { logs } = useSimulator();
  const [filter, setFilter] = useState<EventSeverity | 'all'>('all');

  const filteredLogs = logs.filter((l) => (filter === 'all' ? true : l.severity === filter));

  const getSeverityBadge = (sev: EventSeverity) => {
    switch (sev) {
      case 'error':
        return <span className="es-badge es-badge--critical">ERROR</span>;
      case 'warning':
        return <span className="es-badge es-badge--warning">WARN</span>;
      case 'success':
        return <span className="es-badge es-badge--healthy">OK</span>;
      case 'info':
      default:
        return <span className="es-badge es-badge--configured">INFO</span>;
    }
  };

  return (
    <article className="es-card">
      <div className="es-card-header">
        <div>
          <h3 className="es-card-title">
            <Terminal size={16} color="var(--color-primary-600)" />
            Technical Operational Activity Feed
          </h3>
          <p className="es-card-subtitle">
            Audited edge events, packet validation results, and daemon state transitions
          </p>
        </div>

        {/* Severity Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Filter size={13} color="var(--color-neutral-400)" />
          {(['all', 'info', 'warning', 'error'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFilter(lvl)}
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: filter === lvl ? 'var(--color-neutral-800)' : 'var(--surface-code)',
                color: filter === lvl ? '#FFFFFF' : 'var(--color-neutral-600)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="es-card-body" style={{ padding: 0, maxHeight: 320, overflowY: 'auto' }}>
        <ul className="es-event-list">
          {filteredLogs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            return (
              <li key={log.id} className="es-event-item">
                <span className="es-event-time">{timeStr}</span>
                {getSeverityBadge(log.severity)}
                <span className="es-chip" style={{ fontSize: '10px' }}>
                  {log.source}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: 'var(--color-neutral-800)' }}>{log.message}</span>
                  {log.payloadJson && (
                    <pre
                      style={{
                        margin: '4px 0 0',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-neutral-600)',
                        background: 'var(--surface-code)',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        display: 'inline-block',
                      }}
                    >
                      {log.payloadJson}
                    </pre>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

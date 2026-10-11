import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { StatusBadge } from '@/components/common/StatusBadge';

export function IncidentManagerCard() {
  const { incidents, resolveIncident, injectSensorFault, isFreshInstall } = useSimulator();

  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  return (
    <article className="es-card">
      <div className="es-card-header">
        <div>
          <h3 className="es-card-title">
            <AlertTriangle
              size={16}
              color={openIncidents.length > 0 ? 'var(--color-danger-600)' : 'var(--color-neutral-500)'}
            />
            Open Incidents & Sensor Faults
          </h3>
          <p className="es-card-subtitle">
            Edge anomaly events, bus overruns, and timeout warnings
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {openIncidents.length > 0 ? (
            <StatusBadge variant="critical" label={`${openIncidents.length} FAULT ACTIVE`} pulse={true} />
          ) : (
            <StatusBadge variant="healthy" label="ALL NOMINAL" />
          )}
        </div>
      </div>

      <div className="es-card-body">
        {openIncidents.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-4)',
              textAlign: 'center',
              background: 'var(--surface-card-subtle)',
              borderRadius: 'var(--radius-xs)',
              border: 'var(--border-subtle)',
            }}
          >
            <CheckCircle2 size={24} color="var(--color-success-600)" style={{ margin: '0 auto 6px' }} />
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
              No Open Incidents
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--color-neutral-500)', marginTop: 2 }}>
              {isFreshInstall
                ? 'System is unconfigured. No sensors reporting faults.'
                : 'All planned nodes reporting nominal signal thresholds and heartbeat pings.'}
            </p>
            {!isFreshInstall && (
              <button
                type="button"
                className="es-btn"
                style={{ marginTop: 'var(--space-3)' }}
                onClick={() => injectSensorFault('node-esp32-adxl345')}
              >
                Inject Test Fault (ADXL345)
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {openIncidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  padding: 'var(--space-3)',
                  background: 'var(--color-danger-50)',
                  border: '1px solid var(--color-danger-100)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="es-chip" style={{ color: 'var(--color-danger-700)', fontWeight: 700 }}>
                        {inc.id}
                      </span>
                      <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-900)' }}>
                        {inc.title}
                      </strong>
                    </div>
                    {inc.nodeId && (
                      <span className="es-mono" style={{ fontSize: '11px', color: 'var(--color-neutral-600)', marginTop: 2, display: 'block' }}>
                        Target: {inc.nodeId}
                      </span>
                    )}
                  </div>

                  <StatusBadge
                    variant={inc.severity === 'critical' ? 'critical' : 'warning'}
                    label={inc.severity.toUpperCase()}
                  />
                </div>

                <p style={{ fontSize: '11px', color: 'var(--color-neutral-700)', margin: '2px 0' }}>
                  {inc.description}
                </p>

                {inc.remediationStep && (
                  <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)', fontStyle: 'italic' }}>
                    Remediation: {inc.remediationStep}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    type="button"
                    className="es-btn es-btn--primary"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => resolveIncident(inc.id)}
                  >
                    Acknowledge & Clear Fault
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

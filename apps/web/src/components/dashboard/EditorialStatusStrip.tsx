import { useSimulator } from '@/context/SimulatorContext';
import { StatusBadge } from '@/components/common/StatusBadge';

export function EditorialStatusStrip() {
  const { gateway, nodes, pipeline, incidents, models, isFreshInstall } = useSimulator();

  const simulatedNodesCount = nodes.filter((n) => n.integrationState === 'simulated').length;
  const awaitingNodesCount = nodes.filter((n) => n.integrationState === 'awaiting_integration').length;
  const faultNodesCount = nodes.filter((n) => n.integrationState === 'fault').length;

  const deployedModelsCount = models.filter((m) => m.deploymentState === 'deployed').length;
  const stagedModelsCount = models.filter((m) => m.deploymentState === 'staged').length;

  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  return (
    <section aria-label="Edge Infrastructure Operational Summary">
      <div className="es-status-strip">
        {/* Cell 1: Gateway Status */}
        <div className="es-status-strip-cell">
          <span className="es-status-strip-label">1. Edge Gateway</span>
          <div className="es-status-strip-value">
            {isFreshInstall ? (
              <span style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-md)' }}>
                Unconfigured
              </span>
            ) : (
              <span>Raspberry Pi 5</span>
            )}
          </div>
          <div className="es-status-strip-meta">
            {isFreshInstall ? (
              <StatusBadge variant="configured" label="Awaiting Setup" />
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <StatusBadge variant="healthy" label="Services Active" />
                <span>{gateway.thermalTempC}°C · {gateway.cpuLoadPct}% CPU</span>
              </span>
            )}
          </div>
        </div>

        {/* Cell 2: Planned Nodes Inventory */}
        <div className="es-status-strip-cell">
          <span className="es-status-strip-label">2. Planned Fleet</span>
          <div className="es-status-strip-value">
            <span>5 Planned Nodes</span>
          </div>
          <div className="es-status-strip-meta">
            {isFreshInstall ? (
              <span style={{ color: 'var(--color-neutral-400)' }}>5 awaiting physical pairing</span>
            ) : (
              <span>
                <strong style={{ color: 'var(--color-primary-600)' }}>{simulatedNodesCount}</strong> active
                {faultNodesCount > 0 && (
                  <strong style={{ color: 'var(--color-danger-600)' }}> · {faultNodesCount} fault</strong>
                )}
                {' · '}
                <span>{awaitingNodesCount} awaiting</span>
              </span>
            )}
          </div>
        </div>

        {/* Cell 3: Telemetry Pipeline */}
        <div className="es-status-strip-cell">
          <span className="es-status-strip-label">3. Ingestion Pipeline</span>
          <div className="es-status-strip-value">
            {isFreshInstall ? (
              <span>0 pkts</span>
            ) : (
              <span>
                {pipeline.messagesReceivedTotal}
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-neutral-500)' }}>
                  pkts
                </span>
              </span>
            )}
          </div>
          <div className="es-status-strip-meta">
            {isFreshInstall ? (
              <span>No telemetry received</span>
            ) : (
              <span>
                {pipeline.ingestionRatePerSec > 0 ? `${pipeline.ingestionRatePerSec} msg/s` : 'Idle'}
                {' · '}
                {pipeline.droppedPacketsCount > 0 ? (
                  <span style={{ color: 'var(--color-danger-600)' }}>{pipeline.droppedPacketsCount} drops</span>
                ) : (
                  <span>0 drops</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Cell 4: Open Incidents */}
        <div className="es-status-strip-cell">
          <span className="es-status-strip-label">4. Active Faults</span>
          <div className="es-status-strip-value">
            <span style={{ color: openIncidents.length > 0 ? 'var(--color-danger-600)' : 'var(--color-neutral-900)' }}>
              {openIncidents.length}
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-neutral-500)' }}>
              {openIncidents.length === 1 ? 'incident' : 'incidents'}
            </span>
          </div>
          <div className="es-status-strip-meta">
            {openIncidents.length > 0 ? (
              <span style={{ color: 'var(--color-danger-600)', fontWeight: 600 }}>
                {openIncidents[0].id} ({openIncidents[0].severity})
              </span>
            ) : (
              <span style={{ color: 'var(--color-success-700)' }}>All signals nominal</span>
            )}
          </div>
        </div>

        {/* Cell 5: TinyML Deployments */}
        <div className="es-status-strip-cell">
          <span className="es-status-strip-label">5. TinyML Models</span>
          <div className="es-status-strip-value">
            {isFreshInstall ? (
              <span style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-md)' }}>
                None staged
              </span>
            ) : (
              <span>{deployedModelsCount} Deployed</span>
            )}
          </div>
          <div className="es-status-strip-meta">
            {isFreshInstall ? (
              <span>Awaiting model compilation</span>
            ) : (
              <span>
                {stagedModelsCount} staged · TFLite Micro INT8
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

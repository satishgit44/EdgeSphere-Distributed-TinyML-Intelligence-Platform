import { Box } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { StatusBadge } from '@/components/common/StatusBadge';

export function ModelRegistryCard() {
  const { models, isFreshInstall } = useSimulator();

  return (
    <article className="es-card">
      <div className="es-card-header">
        <div>
          <h3 className="es-card-title">
            <Box size={16} color="var(--color-primary-600)" />
            TinyML Model Registry & Edge Artifacts
          </h3>
          <p className="es-card-subtitle">
            Quantized neural networks compiled for target MCUs (TFLite Micro & CMSIS-NN)
          </p>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-neutral-500)', fontFamily: 'var(--font-mono)' }}>
          {models.length} artifacts registered
        </span>
      </div>

      <div className="es-card-body">
        {isFreshInstall ? (
          <div
            style={{
              padding: 'var(--space-4)',
              textAlign: 'center',
              background: 'var(--surface-card-subtle)',
              borderRadius: 'var(--radius-xs)',
              border: 'var(--border-subtle)',
              color: 'var(--color-neutral-500)',
              fontSize: 'var(--font-size-xs)',
            }}
          >
            No compiled TinyML models staged for deployment. Edge runtime awaiting initial artifact compilation.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {models.map((mod) => (
              <div
                key={mod.id}
                style={{
                  padding: '8px 12px',
                  background: 'var(--surface-card)',
                  border: 'var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-900)' }}>
                        {mod.name}
                      </strong>
                      <span className="es-chip">{mod.version}</span>
                    </div>
                    <span className="es-mono" style={{ fontSize: '11px', color: 'var(--color-neutral-500)' }}>
                      Target: {mod.targetNodeId} ({mod.targetMcu})
                    </span>
                  </div>

                  <StatusBadge
                    variant={mod.deploymentState === 'deployed' ? 'healthy' : mod.deploymentState === 'staged' ? 'simulated' : 'configured'}
                    label={mod.deploymentState.toUpperCase().replace('_', ' ')}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    fontSize: '11px',
                    color: 'var(--color-neutral-600)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: 2,
                  }}
                >
                  <span>Format: <strong>{mod.format}</strong></span>
                  <span>Flash: <strong>{mod.flashFootprintKb} KB</strong></span>
                  <span>RAM: <strong>{mod.ramFootprintKb} KB</strong></span>
                  {mod.benchmarkLatencyMs && (
                    <span style={{ color: 'var(--color-primary-700)' }}>
                      Bench: <strong>{mod.benchmarkLatencyMs} ms</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

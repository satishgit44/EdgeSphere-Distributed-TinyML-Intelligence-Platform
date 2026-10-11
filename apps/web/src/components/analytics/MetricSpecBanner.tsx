import { Database, Clock, Calculator, Gauge } from 'lucide-react';
import { SimulatorBadge } from '@/components/common/StateFeedback';
import type { MetricDefinition } from '@/types';

interface MetricSpecBannerProps {
  def: MetricDefinition;
  hasMissingData?: boolean;
}

export function MetricSpecBanner({ def, hasMissingData = false }: MetricSpecBannerProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        background: 'var(--color-neutral-50)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-neutral-200)',
        marginBottom: 'var(--space-4)',
        fontSize: '11px',
        color: 'var(--color-neutral-600)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Gauge size={13} color="var(--color-neutral-400)" />
          <strong>Unit:</strong> {def.unit}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Clock size={13} color="var(--color-neutral-400)" />
          <strong>Window:</strong> {def.timeWindow}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Calculator size={13} color="var(--color-neutral-400)" />
          <strong>Aggregation:</strong> {def.aggregation}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Database size={13} color="var(--color-neutral-400)" />
          <strong>Source:</strong> {def.dataSource}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {hasMissingData && (
          <span
            style={{
              padding: '1px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-warning-50)',
              color: 'var(--color-warning-700)',
              border: '1px solid var(--color-warning-200)',
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            Contains missing data windows
          </span>
        )}
        <SimulatorBadge />
      </div>
    </div>
  );
}

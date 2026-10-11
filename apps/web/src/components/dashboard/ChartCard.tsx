/**
 * ChartCard — Reusable chart container with title, subtitle, and time range selector
 * Wraps Recharts or any chart content with consistent card styling.
 */

import { MoreVertical } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { TimeRange } from '@/types';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  availableRanges?: TimeRange[];
  defaultRange?: TimeRange;
  onRangeChange?: (range: TimeRange) => void;
  children: ReactNode;
  height?: number;
  className?: string;
}

const rangeLabels: Record<TimeRange, string> = {
  '1h': '1H',
  '6h': '6H',
  '24h': '24H',
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  custom: 'Custom',
};

export function ChartCard({
  title,
  subtitle,
  availableRanges = ['24h', '7d', '30d'],
  defaultRange = '24h',
  onRangeChange,
  children,
  className = '',
}: ChartCardProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>(defaultRange);

  const handleRangeChange = (range: TimeRange) => {
    setActiveRange(range);
    onRangeChange?.(range);
  };

  return (
    <article className={`es-card ${className}`}>
      <div className="es-card-header">
        <div>
          <h3 className="es-card-title">{title}</h3>
          {subtitle && <p className="es-card-subtitle">{subtitle}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {availableRanges.length > 0 && (
            <div className="es-time-range" role="group" aria-label="Time range">
              {availableRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  aria-pressed={activeRange === range}
                  onClick={() => handleRangeChange(range)}
                >
                  {rangeLabels[range]}
                </button>
              ))}
            </div>
          )}

          <button className="es-icon-btn" aria-label="Chart options" type="button">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="es-card-body">{children}</div>
    </article>
  );
}

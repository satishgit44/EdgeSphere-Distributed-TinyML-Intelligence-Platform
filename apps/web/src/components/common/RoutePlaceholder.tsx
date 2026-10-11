import type { ReactNode } from 'react';
import { EmptyState } from '@/components/common/StateFeedback';
import { Cpu, Radio, AlertTriangle, Rocket, Box, FileText, Sliders, CreditCard, Users, Settings } from 'lucide-react';
import type { NavRoute } from '@/components/layout/Sidebar';

interface RoutePlaceholderProps {
  route: NavRoute;
  onGoToDashboard: () => void;
}

const routeIcons: Record<NavRoute, ReactNode> = {
  dashboard: null,
  analytics: null,
  'predictive-ai': null,
  devices: <Cpu size={36} color="var(--color-primary-600)" />,
  telemetry: <Radio size={36} color="var(--color-primary-600)" />,
  alerts: <AlertTriangle size={36} color="var(--color-warning-600)" />,
  deployments: <Rocket size={36} color="var(--color-primary-600)" />,
  models: <Box size={36} color="var(--color-primary-600)" />,
  reports: <FileText size={36} color="var(--color-primary-600)" />,
  integrations: <Sliders size={36} color="var(--color-primary-600)" />,
  billing: <CreditCard size={36} color="var(--color-primary-600)" />,
  team: <Users size={36} color="var(--color-primary-600)" />,
  settings: <Settings size={36} color="var(--color-primary-600)" />,
};

export function RoutePlaceholder({ route, onGoToDashboard }: RoutePlaceholderProps) {
  const title = `${route.charAt(0).toUpperCase() + route.slice(1)} Module`;

  return (
    <article className="es-card" style={{ maxWidth: 680, margin: 'var(--space-8) auto' }}>
      <div className="es-card-body">
        <EmptyState
          icon={routeIcons[route]}
          title={title}
          description="This operational view is staged for backend API connection. The core metrics and live events are currently aggregated on the Overview Dashboard and Analytics & Reporting tabs."
          action={
            <button
              type="button"
              onClick={onGoToDashboard}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--color-primary-600)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Return to Fleet Overview
            </button>
          }
        />
      </div>
    </article>
  );
}

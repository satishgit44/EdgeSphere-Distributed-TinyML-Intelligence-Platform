import type {
  DeviceStatus,
  HealthLevel,
  IncidentSeverity,
  IncidentStatus,
  DeploymentStatus,
  NodeIntegrationState,
  TinyMLDeploymentState,
} from '@/types';

export type BadgeVariant =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'info'
  | 'cyan'
  | 'neutral'
  | 'success'
  | 'degraded'
  | 'simulated'
  | 'configured'
  | 'connected'
  | 'awaiting';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  status?:
    | DeviceStatus
    | HealthLevel
    | IncidentSeverity
    | IncidentStatus
    | DeploymentStatus
    | NodeIntegrationState
    | TinyMLDeploymentState
    | string;
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ variant, status, label, pulse = false, className = '' }: StatusBadgeProps) {
  let determinedVariant: BadgeVariant = variant || 'neutral';

  if (!variant && status) {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'resolved':
      case 'completed':
      case 'success':
      case 'active':
      case 'connected':
      case 'deployed':
        determinedVariant = 'healthy';
        break;
      case 'simulated':
        determinedVariant = 'simulated';
        break;
      case 'configured':
      case 'staged':
        determinedVariant = 'configured';
        break;
      case 'awaiting_integration':
      case 'awaiting':
      case 'not_configured':
        determinedVariant = 'awaiting';
        break;
      case 'warning':
      case 'degraded':
      case 'mitigating':
      case 'rolling_out':
        determinedVariant = 'warning';
        break;
      case 'critical':
      case 'high':
      case 'failed':
      case 'offline':
      case 'fault':
      case 'error':
        determinedVariant = 'critical';
        break;
      case 'investigating':
      case 'pending':
      case 'compiling':
        determinedVariant = 'info';
        break;
      default:
        determinedVariant = 'neutral';
    }
  }

  const displayText = label || (status ? String(status).replace(/_/g, ' ') : '');

  return (
    <span className={`es-badge es-badge--${determinedVariant} ${className}`}>
      <span
        className={`es-status-dot es-status-dot--${determinedVariant} ${pulse ? 'es-status-dot--pulse' : ''}`}
        aria-hidden="true"
      />
      <span>{displayText}</span>
    </span>
  );
}

export function StatusDot({
  status,
  pulse = false,
}: {
  status: 'healthy' | 'warning' | 'critical' | 'offline' | 'simulated' | 'configured' | 'awaiting';
  pulse?: boolean;
}) {
  return (
    <span
      className={`es-status-dot es-status-dot--${status} ${pulse ? 'es-status-dot--pulse' : ''}`}
      aria-hidden="true"
    />
  );
}

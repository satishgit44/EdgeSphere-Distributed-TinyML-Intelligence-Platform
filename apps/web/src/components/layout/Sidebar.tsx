import { type ReactNode } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Box,
  Cpu,
  LayoutDashboard,
  Radio,
  Rocket,
  Settings,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Zap,
  Cloud,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';

export type NavRoute =
  | 'dashboard'
  | 'devices'
  | 'telemetry'
  | 'alerts'
  | 'analytics'
  | 'predictive-ai'
  | 'federated-learning'
  | 'dynamic-scheduling'
  | 'benchmarks'
  | 'models'
  | 'deployments'
  | 'reports'
  | 'integrations'
  | 'billing'
  | 'team'
  | 'settings';

interface NavItem {
  id: NavRoute;
  label: string;
  icon: ReactNode;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { id: 'devices', label: 'Devices & Nodes', icon: <Cpu size={17} /> },
      { id: 'telemetry', label: 'Data Streams', icon: <Radio size={17} /> },
      { id: 'analytics', label: 'Fleet Analytics', icon: <BarChart3 size={17} /> },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'predictive-ai', label: 'Predictive AI (Node 3)', icon: <Activity size={17} /> },
      { id: 'federated-learning', label: 'Federated Learning', icon: <Layers size={17} /> },
      { id: 'models', label: 'Model Registry', icon: <Box size={17} /> },
    ],
  },
  {
    label: 'Reliability',
    items: [
      { id: 'alerts', label: 'Incidents & Alerts', icon: <AlertTriangle size={17} />, badge: '1' },
      { id: 'dynamic-scheduling', label: 'Dynamic Scheduling', icon: <Zap size={17} /> },
    ],
  },
  {
    label: 'Engineering',
    items: [
      { id: 'benchmarks', label: 'Engine Benchmarks', icon: <BarChart3 size={17} /> },
      { id: 'deployments', label: 'Deployments & OTA', icon: <Rocket size={17} /> },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'integrations', label: 'Integrations', icon: <Cloud size={17} /> },
      { id: 'team', label: 'Team & Access', icon: <Users size={17} /> },
      { id: 'billing', label: 'Plans & Quotas', icon: <Zap size={17} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
      { id: 'reports', label: 'Help & Center', icon: <HelpCircle size={17} /> },
    ],
  },
];

export function Sidebar({
  isOpen,
  onClose,
  currentRoute,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const handleItemClick = (id: NavRoute) => {
    onNavigate(id);
    onClose();
  };

  const renderLink = (item: NavItem) => {
    const isActive = currentRoute === item.id;
    return (
      <button
        key={item.id}
        type="button"
        className={`es-sidebar-item ${isActive ? 'is-active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => handleItemClick(item.id)}
        title={item.label}
      >
        <span className="es-sidebar-item-icon">{item.icon}</span>
        {!isCollapsed && <span className="es-sidebar-item-label">{item.label}</span>}
        {!isCollapsed && item.badge && (
          <span className="es-sidebar-item-badge">{item.badge}</span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`es-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`es-unified-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Connexio Brand Header */}
        <div className="es-sidebar-header">
          <div className="es-sidebar-logo-box">
            <Cpu size={18} />
          </div>
          {!isCollapsed && (
            <div className="es-sidebar-brand-text">
              <span className="es-brand-title">EdgeSphere</span>
              <span className="es-brand-plan">Community Plan</span>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              className="es-sidebar-collapse-btn"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          )}

          <button
            type="button"
            className="es-icon-btn es-mobile-toggle"
            onClick={onClose}
            aria-label="Close navigation"
            style={{ marginLeft: 'auto' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Workspace Context Badge (Explicitly Non-Interactive Demo Context) */}
        {!isCollapsed && (
          <div
            className="es-sidebar-workspace-pill es-workspace-context-static"
            role="region"
            aria-label="Active workspace context"
            title="Non-interactive workspace context (Simulated Demo)"
          >
            <div className="es-workspace-avatar" aria-hidden="true">ES</div>
            <div className="es-workspace-info">
              <span className="es-workspace-name">Factory Fleet 01 (Demo)</span>
              <span className="es-workspace-email">Local Cluster • Non-Auth Context</span>
            </div>
            <span
              style={{
                fontSize: '9.5px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-primary-600)',
                background: 'var(--color-primary-50)',
                padding: '2px 5px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              DEMO
            </span>
          </div>
        )}

        {/* Navigation Body */}
        <nav className="es-sidebar-scroll" aria-label="EdgeSphere sections">
          {navGroups.map((group) => (
            <div key={group.label} className="es-sidebar-group">
              {!isCollapsed && <span className="es-group-label">{group.label}</span>}
              <div className="es-nav-list">{group.items.map(renderLink)}</div>
            </div>
          ))}

          {/* Plan & Quota Panel (Explicitly Labeled as Demo Configuration) */}
          {!isCollapsed && (
            <div className="es-sidebar-upgrade-card">
              <div className="es-upgrade-header">
                <div className="es-upgrade-icon">
                  <Zap size={14} />
                </div>
                <strong>Demo Plan Quota</strong>
              </div>
              <p className="es-upgrade-desc">
                Demo Configuration: 5 / 15 simulated nodes. Production server subscription required for fleet scaling.
              </p>
              <div className="es-upgrade-progress-wrap">
                <div className="es-upgrade-progress-bar">
                  <div className="es-upgrade-progress-fill" style={{ width: '33.3%' }} />
                </div>
                <div className="es-upgrade-progress-text">5 / 15 Nodes Allocated (Configured)</div>
              </div>
              <button
                type="button"
                className="es-upgrade-btn"
                onClick={() => handleItemClick('billing')}
              >
                View Plans & Quotas
              </button>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}

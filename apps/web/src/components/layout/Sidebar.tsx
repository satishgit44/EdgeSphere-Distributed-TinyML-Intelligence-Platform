import { useState, type ReactNode } from 'react';
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
  ChevronDown,
  Cloud,
  ChevronRight,
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const mainMenu: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'devices', label: 'Devices', icon: <Cpu size={18} /> },
  { id: 'telemetry', label: 'Data Streams', icon: <Radio size={18} /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertTriangle size={18} />, badge: '1' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { id: 'predictive-ai', label: 'Predictive AI (Node 3)', icon: <Activity size={18} /> },
  { id: 'federated-learning', label: 'Federated Learning', icon: <Layers size={18} /> },
  { id: 'dynamic-scheduling', label: 'Dynamic Scheduling', icon: <Zap size={18} /> },
  { id: 'benchmarks', label: 'Engine Benchmarks', icon: <BarChart3 size={18} /> },
  { id: 'models', label: 'Model Registry', icon: <Box size={18} /> },
  { id: 'deployments', label: 'Deployments & OTA', icon: <Rocket size={18} /> },
];

const otherMenu: NavItem[] = [
  { id: 'team', label: 'Team & Access', icon: <Users size={18} /> },
  { id: 'reports', label: 'Help & Center', icon: <HelpCircle size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export function Sidebar({
  isOpen,
  onClose,
  currentRoute,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [integrationsOpen, setIntegrationsOpen] = useState(true);

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

        {/* Connexio Workspace Selector Pill */}
        {!isCollapsed && (
          <div className="es-sidebar-workspace-pill">
            <div className="es-workspace-avatar">AC</div>
            <div className="es-workspace-info">
              <span className="es-workspace-name">Alex Carter</span>
              <span className="es-workspace-email">alex.carter@edgesphere.local</span>
            </div>
            <div className="es-workspace-chevrons">
              <ChevronDown size={14} />
            </div>
          </div>
        )}

        {/* Navigation Body */}
        <nav className="es-sidebar-scroll">
          {/* Main Menu */}
          <div className="es-sidebar-group">
            {!isCollapsed && <span className="es-group-label">Main Menu</span>}
            <div className="es-nav-list">{mainMenu.map(renderLink)}</div>
          </div>

          {/* Integrations Tree (Connexio style) */}
          {!isCollapsed && (
            <div className="es-sidebar-group">
              <div
                className="es-group-label-row"
                onClick={() => setIntegrationsOpen((p) => !p)}
                role="button"
                tabIndex={0}
              >
                <span className="es-group-label">Integrations</span>
                <span className="es-group-toggle">
                  {integrationsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </span>
              </div>

              {integrationsOpen && (
                <div className="es-tree-sublist">
                  <button
                    type="button"
                    className={`es-tree-item ${currentRoute === 'integrations' ? 'is-active' : ''}`}
                    onClick={() => handleItemClick('integrations')}
                  >
                    <Cloud size={14} />
                    <span>Eclipse Mosquitto (MQTT)</span>
                  </button>
                  <button
                    type="button"
                    className="es-tree-item"
                    onClick={() => handleItemClick('integrations')}
                  >
                    <Layers size={14} />
                    <span>Local Ingest Daemon</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Connexio "Unlock More Features" Upgrade Card */}
          {!isCollapsed && (
            <div className="es-sidebar-upgrade-card">
              <div className="es-upgrade-header">
                <div className="es-upgrade-icon">
                  <Zap size={14} />
                </div>
                <strong>Unlock More Features</strong>
              </div>
              <p className="es-upgrade-desc">
                Advanced FFT harmonics, extended telemetry retention, and batch OTA rollouts.
              </p>
              <div className="es-upgrade-progress-wrap">
                <div className="es-upgrade-progress-bar">
                  <div className="es-upgrade-progress-fill" style={{ width: '50%' }} />
                </div>
                <div className="es-upgrade-progress-text">5 / 15 Nodes (Free tier)</div>
              </div>
              <button
                type="button"
                className="es-upgrade-btn"
                onClick={() => handleItemClick('billing')}
              >
                Get Premium Access
              </button>
            </div>
          )}

          {/* Other Group */}
          <div className="es-sidebar-group es-sidebar-group--bottom">
            {!isCollapsed && <span className="es-group-label">Other</span>}
            <div className="es-nav-list">{otherMenu.map(renderLink)}</div>
          </div>
        </nav>
      </aside>
    </>
  );
}

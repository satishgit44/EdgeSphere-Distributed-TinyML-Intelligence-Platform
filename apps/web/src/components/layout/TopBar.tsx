import { useState } from 'react';
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  AlertTriangle,
  Cpu,
  Box,
  Sparkles,
} from 'lucide-react';
import type { NavRoute } from './Sidebar';
import { useSimulator } from '@/context/SimulatorContext';

interface TopBarProps {
  onMenuToggle: () => void;
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  onOpenAiChat?: () => void;
}

const routeTitles: Record<NavRoute, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Monitor and control your IoT devices & edge intelligence',
  },
  devices: {
    title: 'Devices',
    subtitle: 'Manage and configure your 5 embedded sensor nodes and gateway',
  },
  telemetry: {
    title: 'Data Streams',
    subtitle: 'Live MQTT packet inspector, ring buffer status, and ingestion graphs',
  },
  alerts: {
    title: 'Alerts',
    subtitle: 'Active fault notifications, sensor anomalies, and recovery workflows',
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Historical message ingestion, energy metrics, and temperature trends',
  },
  'predictive-ai': {
    title: 'Predictive AI (Node 3)',
    subtitle: 'ADXL345 motor vibration FFT spectra, feature importance, and wear forecasts',
  },
  models: {
    title: 'Model Registry',
    subtitle: 'TFLite Micro INT8 artifacts, flash/RAM footprints, and SHA256 signatures',
  },
  deployments: {
    title: 'Deployments & OTA',
    subtitle: 'Staged firmware rollout workflows, chunked MQTT transfers, and rollbacks',
  },
  reports: {
    title: 'Help & Center',
    subtitle: 'Diagnostics bundles, documentation, and exportable operational audits',
  },
  integrations: {
    title: 'Integrations',
    subtitle: 'Local Mosquitto MQTT broker, gateway services, and network ports',
  },
  billing: {
    title: 'Billing & Plans',
    subtitle: 'Community/Local, Developer, Team, and Enterprise plan entitlements',
  },
  team: {
    title: 'Team & Access',
    subtitle: 'Operator accounts, role permissions (Owner, Admin, Engineer, Viewer)',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Raspberry Pi 5 daemon configurations, security certificates, and audit log',
  },
};

export function TopBar({
  onMenuToggle,
  currentRoute,
  onNavigate,
  onOpenAiChat,
}: TopBarProps) {
  const { mode, nodes, incidents, models } = useSimulator();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const routeMeta = routeTitles[currentRoute] || routeTitles.dashboard;

  // Real local search
  const matchingNodes = nodes.filter(
    (n) =>
      searchQuery.trim() !== '' &&
      (n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const matchingIncidents = incidents.filter(
    (i) =>
      searchQuery.trim() !== '' &&
      i.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const matchingModels = models.filter(
    (m) =>
      searchQuery.trim() !== '' &&
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const hasSearchResults =
    matchingNodes.length > 0 || matchingIncidents.length > 0 || matchingModels.length > 0;

  return (
    <header className="es-topbar-unified" role="banner">
      <div className="es-topbar-left">
        <button
          className="es-icon-btn es-mobile-toggle"
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="es-topbar-title-block">
          <h1 className="es-topbar-title">{routeMeta.title}</h1>
          <p className="es-topbar-subtitle">{routeMeta.subtitle}</p>
        </div>
      </div>

      <div className="es-topbar-right">
        {/* Connexio Search Bar */}
        <div className="es-topbar-search-wrap">
          <Search size={14} className="es-topbar-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="es-topbar-search-input"
            placeholder="Search Anythings…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 250)}
            aria-label="Search EdgeSphere console"
          />

          {searchOpen && searchQuery.trim() !== '' && (
            <div className="es-search-dropdown" role="listbox">
              {matchingNodes.length > 0 && (
                <div className="es-search-section">
                  <span className="es-search-section-label">Nodes</span>
                  {matchingNodes.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="es-search-item"
                      onClick={() => {
                        onNavigate('devices');
                        setSearchQuery('');
                      }}
                    >
                      <Cpu size={13} />
                      <span>{n.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {matchingModels.length > 0 && (
                <div className="es-search-section">
                  <span className="es-search-section-label">Models</span>
                  {matchingModels.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="es-search-item"
                      onClick={() => {
                        onNavigate('models');
                        setSearchQuery('');
                      }}
                    >
                      <Box size={13} />
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {matchingIncidents.length > 0 && (
                <div className="es-search-section">
                  <span className="es-search-section-label">Alerts</span>
                  {matchingIncidents.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      className="es-search-item"
                      onClick={() => {
                        onNavigate('alerts');
                        setSearchQuery('');
                      }}
                    >
                      <AlertTriangle size={13} />
                      <span>{i.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {!hasSearchResults && (
                <div className="es-search-empty">
                  No registered resources matching &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mode Pill */}
        <span className={`es-mode-badge ${mode === 'simulation' ? 'is-sim' : 'is-hw'}`}>
          <span className="es-mode-dot" />
          {mode === 'simulation' ? 'SIMULATION' : 'HARDWARE'}
        </span>

        {/* Ask AI Header Button */}
        {onOpenAiChat && (
          <button
            type="button"
            className="es-ai-header-btn"
            onClick={onOpenAiChat}
            title="Ask Explainable AI"
          >
            <Sparkles size={14} />
            <span>Ask AI</span>
          </button>
        )}

        {/* Notifications Icon Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="es-topbar-icon-btn"
            onClick={() => setNotificationsOpen((p) => !p)}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {incidents.filter((i) => i.status !== 'resolved').length > 0 && (
              <span className="es-bell-unread-dot" />
            )}
          </button>

          {notificationsOpen && (
            <div className="es-notifs-dropdown">
              <div className="es-dropdown-header">
                <strong>Notifications</strong>
                <span className="es-mini-badge">
                  {incidents.filter((i) => i.status !== 'resolved').length} Active
                </span>
              </div>
              <div className="es-dropdown-body">
                {incidents.slice(0, 3).map((inc) => (
                  <div key={inc.id} className="es-notif-row">
                    <span className="es-notif-dot" />
                    <div>
                      <div className="es-notif-title">{inc.title}</div>
                      <div className="es-notif-sub">{inc.severity} • {inc.nodeId || 'gateway'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="es-topbar-profile-btn"
            onClick={() => setUserMenuOpen((p) => !p)}
            aria-label="User profile"
          >
            <div className="es-profile-avatar-circle">AC</div>
            <span className="es-profile-name-text">Alex Carter</span>
            <ChevronDown size={14} className="es-profile-chevron" />
          </button>

          {userMenuOpen && (
            <div className="es-user-dropdown">
              <div className="es-user-dropdown-header">
                <strong>Alex Carter</strong>
                <span>Workspace Owner</span>
              </div>
              <div className="es-dropdown-divider" />
              <button
                type="button"
                className="es-dropdown-link"
                onClick={() => {
                  onNavigate('team');
                  setUserMenuOpen(false);
                }}
              >
                Team & Access
              </button>
              <button
                type="button"
                className="es-dropdown-link"
                onClick={() => {
                  onNavigate('billing');
                  setUserMenuOpen(false);
                }}
              >
                Billing & Subscription
              </button>
              <button
                type="button"
                className="es-dropdown-link"
                onClick={() => {
                  onNavigate('settings');
                  setUserMenuOpen(false);
                }}
              >
                System Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

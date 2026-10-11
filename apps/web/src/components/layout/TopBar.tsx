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
  'federated-learning': {
    title: 'Federated Learning',
    subtitle: 'Simulated FedAvg parameter aggregation and on-device training convergence',
  },
  'dynamic-scheduling': {
    title: 'Dynamic Scheduling',
    subtitle: 'Edge Gateway workload allocation, latency/energy tradeoffs, and failover',
  },
  benchmarks: {
    title: 'Engine Benchmarks',
    subtitle: 'Comparative latency, footprint, and accuracy across TFLite, EON, and CMSIS-NN',
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
  const { mode, nodes, incidents, models, setSelectedNode } = useSimulator();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const routeMeta = routeTitles[currentRoute] || routeTitles.dashboard;

  // Real local search
  const matchingNodes = nodes.filter(
    (n) =>
      searchQuery.trim() !== '' &&
      (n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.role.toLowerCase().includes(searchQuery.toLowerCase())),
  );
  const matchingIncidents = incidents.filter(
    (i) =>
      searchQuery.trim() !== '' &&
      i.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const matchingModels = models.filter(
    (m) =>
      searchQuery.trim() !== '' &&
      m.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Flattened results for keyboard navigation and stable listbox indices
  interface SearchResultItem {
    id: string;
    type: 'node' | 'model' | 'alert';
    title: string;
    onSelect: () => void;
  }

  const flatResults: SearchResultItem[] = [
    ...matchingNodes.map((n) => ({
      id: `node-${n.id}`,
      type: 'node' as const,
      title: n.name,
      onSelect: () => {
        setSelectedNode(n);
        onNavigate('devices');
        setSearchQuery('');
        setSearchOpen(false);
      },
    })),
    ...matchingModels.map((m) => ({
      id: `model-${m.id}`,
      type: 'model' as const,
      title: m.name,
      onSelect: () => {
        onNavigate('models');
        setSearchQuery('');
        setSearchOpen(false);
      },
    })),
    ...matchingIncidents.map((i) => ({
      id: `incident-${i.id}`,
      type: 'alert' as const,
      title: i.title,
      onSelect: () => {
        onNavigate('alerts');
        setSearchQuery('');
        setSearchOpen(false);
      },
    })),
  ];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen || flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < flatResults.length) {
        e.preventDefault();
        flatResults[highlightedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  const hasSearchResults = flatResults.length > 0;

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
        {/* Local Catalog Search Bar with Combobox Semantics */}
        <div className="es-topbar-search-wrap">
          <Search size={14} className="es-topbar-search-icon" aria-hidden="true" />
          <input
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={searchOpen && searchQuery.trim() !== ''}
            aria-controls="es-topbar-search-listbox"
            aria-activedescendant={
              highlightedIndex >= 0 && flatResults[highlightedIndex]
                ? flatResults[highlightedIndex].id
                : undefined
            }
            className="es-topbar-search-input"
            placeholder="Search nodes, models, alerts…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              if (searchQuery.trim() !== '') setSearchOpen(true);
            }}
            onBlur={() => {
              setTimeout(() => setSearchOpen(false), 200);
            }}
            aria-label="Search local nodes, models, and alerts"
          />

          {searchOpen && searchQuery.trim() !== '' && (
            <div
              id="es-topbar-search-listbox"
              className="es-search-dropdown"
              role="listbox"
              aria-label="Search suggestions"
              onMouseDown={(e) => e.preventDefault()}
            >
              {matchingNodes.length > 0 && (
                <div className="es-search-section">
                  <span className="es-search-section-label">Nodes</span>
                  {matchingNodes.map((n) => {
                    const itemIndex = flatResults.findIndex((r) => r.id === `node-${n.id}`);
                    const isHighlighted = highlightedIndex === itemIndex;
                    return (
                      <button
                        key={n.id}
                        id={`node-${n.id}`}
                        role="option"
                        aria-selected={isHighlighted}
                        type="button"
                        className={`es-search-item ${isHighlighted ? 'is-highlighted' : ''}`}
                        onClick={() => {
                          setSelectedNode(n);
                          onNavigate('devices');
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                      >
                        <Cpu size={13} />
                        <span>{n.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {matchingModels.length > 0 && (
                <div className="es-search-section">
                  <span className="es-search-section-label">Models</span>
                  {matchingModels.map((m) => {
                    const itemIndex = flatResults.findIndex((r) => r.id === `model-${m.id}`);
                    const isHighlighted = highlightedIndex === itemIndex;
                    return (
                      <button
                        key={m.id}
                        id={`model-${m.id}`}
                        role="option"
                        aria-selected={isHighlighted}
                        type="button"
                        className={`es-search-item ${isHighlighted ? 'is-highlighted' : ''}`}
                        onClick={() => {
                          onNavigate('models');
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                      >
                        <Box size={13} />
                        <span>{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {matchingIncidents.length > 0 && (
                <div className="es-search-section">
                  <span className="es-search-section-label">Alerts</span>
                  {matchingIncidents.map((i) => {
                    const itemIndex = flatResults.findIndex((r) => r.id === `incident-${i.id}`);
                    const isHighlighted = highlightedIndex === itemIndex;
                    return (
                      <button
                        key={i.id}
                        id={`incident-${i.id}`}
                        role="option"
                        aria-selected={isHighlighted}
                        type="button"
                        className={`es-search-item ${isHighlighted ? 'is-highlighted' : ''}`}
                        onClick={() => {
                          onNavigate('alerts');
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                      >
                        <AlertTriangle size={13} />
                        <span>{i.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!hasSearchResults && (
                <div className="es-search-empty" role="status">
                  No local resources matching &ldquo;{searchQuery}&rdquo; • Local catalog filter
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
                  <div
                    key={inc.id}
                    className="es-notif-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onNavigate('alerts');
                      setNotificationsOpen(false);
                    }}
                    role="button"
                    tabIndex={0}
                  >
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
                <span>Demo Operator • Local Workspace</span>
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

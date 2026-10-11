import { useState } from 'react';
import { Cpu, ExternalLink, Search } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { PlannedNode, NodeIntegrationState } from '@/types';

export type FilterState = 'all' | 'active' | 'awaiting' | 'fault';

export interface PlannedNodeInventoryProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  filterState?: FilterState;
  onFilterChange?: (filter: FilterState) => void;
  onClearFilters?: () => void;
  hideToolbar?: boolean;
}

export function PlannedNodeInventory({
  searchTerm: controlledSearch,
  onSearchChange,
  filterState: controlledFilter,
  onFilterChange,
  onClearFilters,
  hideToolbar = false,
}: PlannedNodeInventoryProps = {}) {
  const { nodes, setSelectedNode, predictions } = useSimulator();
  const [internalSearch, setInternalSearch] = useState('');
  const [internalFilter, setInternalFilter] = useState<FilterState>('all');

  const searchTerm = controlledSearch !== undefined ? controlledSearch : internalSearch;
  const filterState = controlledFilter !== undefined ? controlledFilter : internalFilter;

  const setSearchTerm = (term: string) => {
    if (onSearchChange) onSearchChange(term);
    else setInternalSearch(term);
  };

  const setFilterState = (filter: FilterState) => {
    if (onFilterChange) onFilterChange(filter);
    else setInternalFilter(filter);
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      setInternalSearch('');
      setInternalFilter('all');
    }
  };

  const getIntegrationBadge = (state: NodeIntegrationState) => {
    switch (state) {
      case 'simulated':
        return <StatusBadge variant="simulated" label="SIMULATED ACTIVE" />;
      case 'connected':
        return <StatusBadge variant="connected" label="HARDWARE LINK" />;
      case 'fault':
        return <StatusBadge variant="critical" label="FAULT / OVERRUN" pulse={true} />;
      case 'configured':
        return <StatusBadge variant="configured" label="CONFIGURED" />;
      case 'awaiting_integration':
      default:
        return <StatusBadge variant="awaiting" label="AWAITING HARDWARE" />;
    }
  };

  const filteredNodes = nodes.filter((node) => {
    // Search query matching across all node attributes
    const matchesSearch =
      searchTerm.trim() === '' ||
      node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.targetMcu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.onboardSensors.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      node.intendedTinyML.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filter pill matching (mutually exclusive partitions)
    if (filterState === 'active') {
      return node.integrationState === 'connected' || node.integrationState === 'simulated';
    }
    if (filterState === 'awaiting') {
      return node.integrationState === 'awaiting_integration' || node.integrationState === 'configured';
    }
    if (filterState === 'fault') {
      return node.integrationState === 'fault';
    }
    return true;
  });

  return (
    <article className="es-card">
      <div className="es-card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="es-card-title">
            <Cpu size={16} color="var(--color-primary-600)" />
            Planned Embedded Node Inventory
          </h3>
          <p className="es-card-subtitle">
            5 target microcontroller nodes paired with the Raspberry Pi 5 gateway
          </p>
        </div>

        {/* Untitled UI Style Search & Filter Bar (rendered when hideToolbar is false) */}
        {!hideToolbar && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="es-table-search-box" style={{ position: 'relative', minWidth: 200 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
              <input
                type="search"
                placeholder="Filter nodes, MCUs, sensors…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '6px 10px 6px 30px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--es-border, #E9E9F0)',
                  background: '#FFFFFF',
                  color: 'var(--es-text, #17171C)',
                  outline: 'none',
                }}
                aria-label="Filter fleet nodes"
              />
            </div>

            <div role="group" aria-label="Node status filters" style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className={`es-filter-pill-btn ${filterState === 'all' ? 'is-active' : ''}`}
                onClick={() => setFilterState('all')}
                style={{
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  border: '1px solid var(--es-border, #E9E9F0)',
                  background: filterState === 'all' ? 'var(--color-primary-50, #F3F0FF)' : '#FFFFFF',
                  color: filterState === 'all' ? 'var(--color-primary-600, #6744E8)' : 'var(--es-text-secondary, #737487)',
                  cursor: 'pointer',
                }}
              >
                All ({nodes.length})
              </button>
              <button
                type="button"
                className={`es-filter-pill-btn ${filterState === 'active' ? 'is-active' : ''}`}
                onClick={() => setFilterState('active')}
                style={{
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  border: '1px solid var(--es-border, #E9E9F0)',
                  background: filterState === 'active' ? 'var(--color-primary-50, #F3F0FF)' : '#FFFFFF',
                  color: filterState === 'active' ? 'var(--color-primary-600, #6744E8)' : 'var(--es-text-secondary, #737487)',
                  cursor: 'pointer',
                }}
              >
                Active Sim ({nodes.filter((n) => n.integrationState === 'connected' || n.integrationState === 'simulated').length})
              </button>
              <button
                type="button"
                className={`es-filter-pill-btn ${filterState === 'awaiting' ? 'is-active' : ''}`}
                onClick={() => setFilterState('awaiting')}
                style={{
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  border: '1px solid var(--es-border, #E9E9F0)',
                  background: filterState === 'awaiting' ? 'var(--color-primary-50, #F3F0FF)' : '#FFFFFF',
                  color: filterState === 'awaiting' ? 'var(--color-primary-600, #6744E8)' : 'var(--es-text-secondary, #737487)',
                  cursor: 'pointer',
                }}
              >
                Awaiting HW ({nodes.filter((n) => n.integrationState === 'awaiting_integration' || n.integrationState === 'configured').length})
              </button>
              {nodes.some((n) => n.integrationState === 'fault') && (
                <button
                  type="button"
                  className={`es-filter-pill-btn ${filterState === 'fault' ? 'is-active' : ''}`}
                  onClick={() => setFilterState('fault')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    borderRadius: '9999px',
                    border: '1px solid #FAB8C2',
                    background: '#FDE8EC',
                    color: '#D83A4E',
                    cursor: 'pointer',
                  }}
                >
                  Fault ({nodes.filter((n) => n.integrationState === 'fault').length})
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="es-table">
          <thead>
            <tr>
              <th scope="col">Node ID</th>
              <th scope="col">Hardware & MCU</th>
              <th scope="col">Onboard Sensors</th>
              <th scope="col">TinyML Target</th>
              <th scope="col">Live Inference</th>
              <th scope="col">Integration State</th>
              <th scope="col">Last Packet</th>
              <th scope="col" style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredNodes.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--es-text, #17171C)' }}>
                      No nodes matching current search & filter criteria
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--es-text-secondary, #737487)' }}>
                      Search: &ldquo;{searchTerm || 'none'}&rdquo; • Filter: &ldquo;{filterState}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      style={{
                        marginTop: 6,
                        padding: '6px 14px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid var(--es-border, #E9E9F0)',
                        background: 'var(--color-primary-50, #F3F0FF)',
                        color: 'var(--color-primary-600, #6744E8)',
                        cursor: 'pointer',
                      }}
                    >
                      Clear Filters & Reset
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredNodes.map((node: PlannedNode) => {
                const pred = predictions[node.id];
                const timeDisplay = node.lastSeenTimestamp
                  ? formatTimeAgo(new Date(node.lastSeenTimestamp))
                  : '—';
                const confPct = pred ? Math.round(pred.confidence * 100) : 90;

              return (
                <tr
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedNode(node);
                    }
                  }}
                  aria-label={`Inspect ${node.name}`}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <span className="es-chip" style={{ fontWeight: 600 }}>
                      {node.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                        {node.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-neutral-500)', fontFamily: 'var(--font-mono)' }}>
                        {node.targetMcu.split('(')[0].trim()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: 'var(--color-neutral-700)' }}>
                      {node.onboardSensors[0]}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: 'var(--color-neutral-700)' }}>
                      {node.intendedTinyML.split('(')[0].trim()}
                    </span>
                  </td>
                  <td>
                    {pred ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'var(--surface-card-subtle, #F8F8FB)',
                          border: '1px solid var(--es-border, #E9E9F0)',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-neutral-800)',
                        }}
                      >
                        <strong>{pred.predictionClass.replace(/_/g, ' ')}</strong>
                        <span style={{ color: 'var(--color-primary-600)' }}>{confPct}%</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--color-neutral-400)' }}>
                        evaluating…
                      </span>
                    )}
                  </td>
                  <td>{getIntegrationBadge(node.integrationState)}</td>
                  <td>
                    <span className="es-mono" style={{ color: 'var(--color-neutral-500)' }}>
                      {timeDisplay}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="es-icon-btn"
                      title={`Inspect ${node.name}`}
                      aria-label={`Inspect ${node.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                      }}
                    >
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          borderTop: '1px solid var(--es-border, #E9E9F0)',
          fontSize: '11.5px',
          color: 'var(--es-text-secondary, #737487)',
        }}
      >
        <span>
          Showing <strong>{filteredNodes.length}</strong> of <strong>{nodes.length}</strong> nodes
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          EdgeSphere v1.2.0 • Local Simulation Bus
        </span>
      </div>
    </article>
  );
}

function formatTimeAgo(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

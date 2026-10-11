import { useState } from 'react';
import { LiveNodesGrid } from '@/components/devices/LiveNodesGrid';
import { PlannedNodeInventory } from '@/components/dashboard/PlannedNodeInventory';
import { TopologySchematic } from '@/components/dashboard/TopologySchematic';
import { RegisterDeviceModal } from '@/components/devices/RegisterDeviceModal';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function DevicesPage() {
  const { nodes } = useSimulator();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'active' | 'awaiting' | 'fault'>('all');

  const totalCount = nodes.length;
  const activeCount = nodes.filter(
    (n) => n.integrationState === 'connected' || n.integrationState === 'simulated',
  ).length;
  const awaitingCount = nodes.filter(
    (n) => n.integrationState === 'awaiting_integration' || n.integrationState === 'configured',
  ).length;
  const faultCount = nodes.filter((n) => n.integrationState === 'fault').length;

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterState('all');
  };

  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Devices & Nodes</span>
          </div>
          <h1 className="es-nexus-title">Fleet Node Inventory & Live Inference</h1>
          <p className="es-nexus-subtitle">
            Audited 5-node distributed TinyML operations, live rule-based prediction inference, and pinout telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View Toggle */}
          <div className="es-view-mode-toggle" role="group" aria-label="View toggle">
            <button
              type="button"
              className={`es-view-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Live Inference Cards View"
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              type="button"
              className={`es-view-btn ${viewMode === 'table' ? 'is-active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Technical Pinout Table View"
            >
              <List size={14} /> Table
            </button>
          </div>

          <button
            type="button"
            className="es-nexus-action-button-primary"
            onClick={() => setIsRegisterModalOpen(true)}
          >
            <Plus size={14} /> Register Node
          </button>
        </div>
      </div>

      {/* Shared Accessible Search & Status Filter Toolbar */}
      <div
        className="es-devices-filter-toolbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          background: '#FFFFFF',
          border: '1px solid var(--es-border, #E9E9F0)',
          borderRadius: '12px',
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
        role="search"
        aria-label="Filter edge nodes"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-neutral-400, #9693A5)',
              }}
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by ID, name, MCU, sensors, or workload…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: 36,
                padding: '0 12px 0 34px',
                fontSize: '12.5px',
                borderRadius: '8px',
                border: '1px solid var(--es-border, #E9E9F0)',
                background: '#FFFFFF',
                color: 'var(--es-text, #17171C)',
                outline: 'none',
              }}
              aria-label="Search edge devices"
            />
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11px',
                color: 'var(--color-primary-600, #6744E8)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Node status filters"
          style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
        >
          <button
            type="button"
            className={`es-filter-pill-btn ${filterState === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilterState('all')}
            style={{
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              borderRadius: '9999px',
              border: '1px solid var(--es-border, #E9E9F0)',
              background: filterState === 'all' ? 'var(--color-primary-50, #F3F0FF)' : '#FFFFFF',
              color: filterState === 'all' ? 'var(--color-primary-600, #6744E8)' : 'var(--es-text-secondary, #737487)',
              cursor: 'pointer',
            }}
          >
            All Nodes ({totalCount})
          </button>
          <button
            type="button"
            className={`es-filter-pill-btn ${filterState === 'active' ? 'is-active' : ''}`}
            onClick={() => setFilterState('active')}
            style={{
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              borderRadius: '9999px',
              border: '1px solid var(--es-border, #E9E9F0)',
              background: filterState === 'active' ? 'var(--color-primary-50, #F3F0FF)' : '#FFFFFF',
              color: filterState === 'active' ? 'var(--color-primary-600, #6744E8)' : 'var(--es-text-secondary, #737487)',
              cursor: 'pointer',
            }}
          >
            Simulated Active ({activeCount})
          </button>
          <button
            type="button"
            className={`es-filter-pill-btn ${filterState === 'awaiting' ? 'is-active' : ''}`}
            onClick={() => setFilterState('awaiting')}
            style={{
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              borderRadius: '9999px',
              border: '1px solid var(--es-border, #E9E9F0)',
              background: filterState === 'awaiting' ? 'var(--color-primary-50, #F3F0FF)' : '#FFFFFF',
              color: filterState === 'awaiting' ? 'var(--color-primary-600, #6744E8)' : 'var(--es-text-secondary, #737487)',
              cursor: 'pointer',
            }}
          >
            Awaiting HW ({awaitingCount})
          </button>
          {faultCount > 0 ? (
            <button
              type="button"
              className={`es-filter-pill-btn ${filterState === 'fault' ? 'is-active' : ''}`}
              onClick={() => setFilterState('fault')}
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 600,
                borderRadius: '9999px',
                border: '1px solid #FAB8C2',
                background: '#FDE8EC',
                color: '#D83A4E',
                cursor: 'pointer',
              }}
            >
              Fault / Overrun ({faultCount})
            </button>
          ) : (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-success-600, #166E30)',
                background: 'var(--color-success-50, #F2F9F3)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              0 Faults (Nominal)
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {viewMode === 'cards' ? (
          <>
            <LiveNodesGrid
              searchTerm={searchTerm}
              filterState={filterState}
              onClearFilters={handleClearFilters}
            />
            <TopologySchematic />
          </>
        ) : (
          <>
            <PlannedNodeInventory
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterState={filterState}
              onFilterChange={setFilterState}
              onClearFilters={handleClearFilters}
              hideToolbar={true}
            />
            <TopologySchematic />
          </>
        )}
      </div>

      <RegisterDeviceModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}

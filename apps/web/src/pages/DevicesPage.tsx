import { useState } from 'react';
import { LiveNodesGrid } from '@/components/devices/LiveNodesGrid';
import { PlannedNodeInventory } from '@/components/dashboard/PlannedNodeInventory';
import { TopologySchematic } from '@/components/dashboard/TopologySchematic';
import { RegisterDeviceModal } from '@/components/devices/RegisterDeviceModal';
import { Plus, LayoutGrid, List } from 'lucide-react';

export function DevicesPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {viewMode === 'cards' ? (
          <>
            <LiveNodesGrid />
            <TopologySchematic />
          </>
        ) : (
          <>
            <PlannedNodeInventory />
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

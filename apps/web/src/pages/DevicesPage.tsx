import { useState } from 'react';
import { PlannedNodeInventory } from '@/components/dashboard/PlannedNodeInventory';
import { TopologySchematic } from '@/components/dashboard/TopologySchematic';
import { NodeDetailModal } from '@/components/dashboard/NodeDetailModal';
import { RegisterDeviceModal } from '@/components/devices/RegisterDeviceModal';
import { Plus } from 'lucide-react';

export function DevicesPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Devices & Nodes</span>
          </div>
          <h1 className="es-nexus-title">Fleet Node Inventory</h1>
          <p className="es-nexus-subtitle">
            Manage your 5 embedded hardware nodes, inspect target MCUs, pinouts, and TinyML workloads.
          </p>
        </div>

        <button
          type="button"
          className="es-nexus-action-button-primary"
          onClick={() => setIsRegisterModalOpen(true)}
        >
          <Plus size={14} /> Register Node
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <PlannedNodeInventory />
        <TopologySchematic />
      </div>

      <NodeDetailModal />
      <RegisterDeviceModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown, ChevronUp, Server } from 'lucide-react';
import { GatewayStatusPanel } from '@/components/dashboard/GatewayStatusPanel';
import { PlannedNodeInventory } from '@/components/dashboard/PlannedNodeInventory';
import { TopologySchematic } from '@/components/dashboard/TopologySchematic';
import { SimulatorControlBar } from '@/components/dashboard/SimulatorControlBar';
import { EditorialStatusStrip } from '@/components/dashboard/EditorialStatusStrip';

export function HardwareTopologySection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="es-nexus-hardware-toggle-section">
      <div className="es-nexus-hardware-toggle-bar">
        <div className="es-nexus-hardware-toggle-left">
          <Server size={16} color="#7455F5" />
          <strong className="es-nexus-hardware-toggle-title">
            Hardware Engineering & Local Edge Manager Topology
          </strong>
          <span className="es-nexus-mini-badge">Raspberry Pi 5 + 5 Nodes</span>
        </div>

        <button
          type="button"
          className="es-nexus-pill es-nexus-pill--interactive"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <>
              Hide Schematic & Hardware Details <ChevronUp size={14} />
            </>
          ) : (
            <>
              View Topology Schematic & Node Hardware <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="es-nexus-hardware-content">
          <SimulatorControlBar />
          <EditorialStatusStrip />
          <div className="es-nexus-hardware-grid">
            <GatewayStatusPanel />
            <PlannedNodeInventory />
          </div>
          <TopologySchematic />
        </div>
      )}
    </section>
  );
}

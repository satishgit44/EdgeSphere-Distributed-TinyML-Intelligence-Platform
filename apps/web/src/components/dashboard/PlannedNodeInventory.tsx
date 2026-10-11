import { Cpu, ExternalLink } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { PlannedNode, NodeIntegrationState } from '@/types';

export function PlannedNodeInventory() {
  const { nodes, setSelectedNode } = useSimulator();

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

  return (
    <article className="es-card">
      <div className="es-card-header">
        <div>
          <h3 className="es-card-title">
            <Cpu size={16} color="var(--color-primary-600)" />
            Planned Embedded Node Inventory
          </h3>
          <p className="es-card-subtitle">
            5 target microcontroller nodes paired with the Raspberry Pi 5 gateway
          </p>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-neutral-500)', fontFamily: 'var(--font-mono)' }}>
          Click row to inspect hardware pinout & signals
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="es-table">
          <thead>
            <tr>
              <th scope="col">Node ID</th>
              <th scope="col">Hardware & MCU</th>
              <th scope="col">Onboard Sensors</th>
              <th scope="col">TinyML Target</th>
              <th scope="col">Integration State</th>
              <th scope="col">Last Packet</th>
              <th scope="col" style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node: PlannedNode) => {
              const timeDisplay = node.lastSeenTimestamp
                ? formatTimeAgo(new Date(node.lastSeenTimestamp))
                : '—';

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
            })}
          </tbody>
        </table>
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

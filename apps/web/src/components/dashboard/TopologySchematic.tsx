import { Server, Wifi, Bluetooth, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import type { PlannedNode } from '@/types';

export function TopologySchematic() {
  const { gateway, nodes, setSelectedNode, isFreshInstall } = useSimulator();

  const getLinkIcon = (node: PlannedNode) => {
    if (node.integrationState === 'fault') {
      return <AlertOctagon size={13} color="var(--color-danger-600)" />;
    }
    if (node.integrationState === 'simulated' || node.integrationState === 'connected') {
      return <CheckCircle2 size={13} color="var(--color-success-600)" />;
    }
    return <Clock size={13} color="var(--color-neutral-400)" />;
  };

  const getLinkText = (node: PlannedNode) => {
    if (isFreshInstall) return 'Awaiting Pairing';
    switch (node.integrationState) {
      case 'fault':
        return 'Bus Overrun / Fault';
      case 'simulated':
        return 'Active (Simulated)';
      case 'connected':
        return 'Hardware Active';
      case 'awaiting_integration':
      default:
        return 'Awaiting Hardware';
    }
  };

  return (
    <article className="es-card">
      <div className="es-card-header">
        <div>
          <h3 className="es-card-title">
            Hardware Topology & Comms Bus Map
          </h3>
          <p className="es-card-subtitle">
            Physical & simulated interconnects between manager gateway and embedded sensor targets
          </p>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-neutral-500)', fontFamily: 'var(--font-mono)' }}>
          Explicit link states (no fabricated connections)
        </span>
      </div>

      <div className="es-card-body">
        {/* Central Hub: Raspberry Pi 5 */}
        <div className="es-topology-hub">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Server size={18} color="var(--color-primary-600)" />
              <div>
                <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-900)' }}>
                  {gateway.name}
                </strong>
                <span className="es-mono" style={{ display: 'block', fontSize: '11px', color: 'var(--color-neutral-500)' }}>
                  Manager Hub · {gateway.host} · Mosquitto Broker (1883)
                </span>
              </div>
            </div>

            <span className="es-chip" style={{ background: '#FFFFFF' }}>
              {isFreshInstall ? 'UNBOUND' : 'GATEWAY HUB ACTIVE'}
            </span>
          </div>
        </div>

        {/* Bus Links & Peripheral Nodes */}
        <div className="es-topology-nodes">
          {nodes.map((node) => {
            const isBle = node.commsBus.includes('BLE');
            return (
              <div
                key={node.id}
                className={`es-topology-node-card ${node.integrationState === 'fault' ? 'fault' : ''}`}
                onClick={() => setSelectedNode(node)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedNode(node);
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="es-chip">{node.id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isBle ? <Bluetooth size={13} color="var(--color-primary-600)" /> : <Wifi size={13} color="var(--color-cyan-600)" />}
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-neutral-500)' }}>
                      {isBle ? 'BLE' : 'WiFi'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                    {node.name}
                  </span>
                  <p style={{ fontSize: '10px', color: 'var(--color-neutral-500)', lineHeight: 1.3, marginTop: 2 }}>
                    {node.onboardSensors[0]}
                  </p>
                </div>

                <div className="es-topology-link" style={{ marginTop: 6, paddingTop: 6, borderTop: 'var(--border-subtle)' }}>
                  {getLinkIcon(node)}
                  <span>{getLinkText(node)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

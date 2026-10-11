import { Cpu } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function TopNodesCard() {
  const { nodes, setSelectedNode } = useSimulator();

  return (
    <div className="es-nexus-top-nodes-wrap">
      <div className="es-nexus-rail-header">
        <span className="es-nexus-rail-title">Active Fleet Nodes</span>
      </div>

      <div className="es-nexus-top-nodes-list">
        {nodes.slice(0, 3).map((node, idx) => {
          const isFault = node.integrationState === 'fault';
          return (
            <div
              key={node.id}
              className="es-nexus-node-pill"
              onClick={() => setSelectedNode(node)}
              role="button"
              tabIndex={0}
            >
              <div className="es-nexus-node-avatar">
                <Cpu size={14} />
              </div>
              <div className="es-nexus-node-info">
                <div className="es-nexus-node-name">{node.name}</div>
                <div className="es-nexus-node-mcu">Node 0{idx + 1} · {node.role.split(' ')[0]}</div>
              </div>
              <div className="es-nexus-node-metric">
                <span className={`es-nexus-node-rate ${isFault ? 'is-fault' : ''}`}>
                  {isFault ? 'Fault' : '1.2 KB/s'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

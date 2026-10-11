import { Plus, Wrench, Rocket, Download } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function QuickActionsCard() {
  const { transmitSingleBurst } = useSimulator();

  return (
    <article className="es-nexus-card es-nexus-rail-card">
      <div className="es-nexus-rail-header">
        <span className="es-nexus-rail-title">Quick actions</span>
      </div>

      <div className="es-nexus-actions-box">
        <div className="es-nexus-actions-sub">Fleet operations</div>

        <div className="es-nexus-actions-grid">
          <button
            type="button"
            className="es-nexus-action-btn"
            onClick={transmitSingleBurst}
          >
            <Plus size={13} />
            <span>Telemetry burst</span>
          </button>

          <button
            type="button"
            className="es-nexus-action-btn"
            onClick={() => alert('Diagnostics triggered: Gateway CPU normal (14%), Mosquitto operational, ring buffer valid.')}
          >
            <Wrench size={13} />
            <span>Run diagnostics</span>
          </button>

          <button
            type="button"
            className="es-nexus-action-btn"
            onClick={() => alert('Model deployment queued: TFLite Micro INT8 runtime ready for Node 3.')}
          >
            <Rocket size={13} />
            <span>Deploy model</span>
          </button>

          <button
            type="button"
            className="es-nexus-action-btn"
            onClick={() => alert('Exporting PDF/JSON edge performance report...')}
          >
            <Download size={13} />
            <span>Export report</span>
          </button>
        </div>
      </div>
    </article>
  );
}

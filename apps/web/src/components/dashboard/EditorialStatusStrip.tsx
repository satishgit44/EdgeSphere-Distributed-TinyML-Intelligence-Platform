import { StatusBadge } from '@/components/common/StatusBadge';

export function EditorialStatusStrip() {
  return (
    <section aria-label="Edge Infrastructure Operational Summary and Implementation Roadmap">
      <div className="es-status-strip" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Cell 1: Phase A */}
        <div className="es-status-strip-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="es-status-strip-label">Phase A: Correctness First</span>
            <StatusBadge variant="healthy" label="COMPLETE" />
          </div>
          <div className="es-status-strip-value" style={{ marginTop: 4 }}>
            <span>5 Initial Nodes</span>
          </div>
          <div className="es-status-strip-meta">
            <span>5 logical nodes immutable · KPI labels & Unicode verified · Grounded baseline</span>
          </div>
        </div>

        {/* Cell 2: Phase B */}
        <div className="es-status-strip-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="es-status-strip-label">Phase B: Functional Controls</span>
            <StatusBadge variant="healthy" label="COMPLETE" />
          </div>
          <div className="es-status-strip-value" style={{ marginTop: 4 }}>
            <span>Interactive Controls</span>
          </div>
          <div className="es-status-strip-meta">
            <span>In-app XAI evidence routing · Device registration modal · CSV/JSON exports</span>
          </div>
        </div>

        {/* Cell 3: Phase C */}
        <div className="es-status-strip-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="es-status-strip-label">Phase C: Live Simulation</span>
            <StatusBadge variant="healthy" label="COMPLETE" />
          </div>
          <div className="es-status-strip-value" style={{ marginTop: 4 }}>
            <span>Telemetry & XAI</span>
          </div>
          <div className="es-status-strip-meta">
            <span>Continuous synthetic telemetry (disclosed) · Bounded buffer · v1 persistence</span>
          </div>
        </div>

        {/* Cell 4: Phase D */}
        <div className="es-status-strip-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="es-status-strip-label">Phase D: Production Readiness</span>
            <StatusBadge variant="warning" label="IN PROGRESS" />
          </div>
          <div className="es-status-strip-value" style={{ marginTop: 4 }}>
            <span>Gateway Sim Active</span>
          </div>
          <div className="es-status-strip-meta">
            <span>Simulated RPi 5 active · Physical hardware, prod MQTT, Auth & OTA planned</span>
          </div>
        </div>
      </div>
    </section>
  );
}

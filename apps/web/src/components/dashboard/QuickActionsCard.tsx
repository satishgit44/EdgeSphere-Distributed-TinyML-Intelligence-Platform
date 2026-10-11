import { Plus, Wrench, Rocket, Download } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { useNavigation } from '@/context/NavigationContext';
import { downloadReportJson } from '@/utils/reportExport';

export function QuickActionsCard() {
  const { transmitSingleBurst, nodes, gateway, pipeline, incidents, models } = useSimulator();
  const { navigate } = useNavigation();

  const handleExportReport = () => {
    downloadReportJson({
      date: new Date().toISOString().split('T')[0],
      gateway,
      nodes,
      pipeline,
      models,
      incidents,
    });
  };

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
            title="Inject simulated MQTT telemetry burst"
          >
            <Plus size={13} />
            <span>Telemetry burst</span>
          </button>

          <button
            type="button"
            className="es-nexus-action-btn"
            onClick={() => navigate('integrations')}
            title="Navigate to Gateway Diagnostics & Local Ingestion"
          >
            <Wrench size={13} />
            <span>Run diagnostics</span>
          </button>

          <button
            type="button"
            className="es-nexus-action-btn"
            onClick={() => navigate('deployments')}
            title="Navigate to Model Deployments & OTA Coordinator"
          >
            <Rocket size={13} />
            <span>Deploy model</span>
          </button>

          <button
            type="button"
            className="es-nexus-action-btn"
            onClick={handleExportReport}
            title="Download JSON telemetry and fleet report"
          >
            <Download size={13} />
            <span>Export report</span>
          </button>
        </div>
      </div>
    </article>
  );
}

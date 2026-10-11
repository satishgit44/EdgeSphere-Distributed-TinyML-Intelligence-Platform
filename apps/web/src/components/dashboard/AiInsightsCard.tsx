import { Sparkles } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { useNavigation } from '@/context/NavigationContext';
import { downloadReportJson } from '@/utils/reportExport';

export function AiInsightsCard() {
  const { nodes, gateway, pipeline, incidents, models } = useSimulator();
  const { navigate } = useNavigation();
  const faultNode = nodes.find((n) => n.integrationState === 'fault');

  return (
    <div className="es-nexus-insights-wrapper">
      <div className="es-nexus-rail-header">
        <span className="es-nexus-rail-title">AI insights</span>
      </div>

      {/* Vibrant purple card matching screenshot */}
      <div className="es-nexus-purple-card">
        <div className="es-nexus-purple-top">
          <div className="es-nexus-ai-badge">
            <Sparkles size={12} />
          </div>
          <strong className="es-nexus-purple-title">
            {faultNode
              ? 'Motor vibration anomaly detected'
              : 'Fleet baseline telemetry nominal'}
          </strong>
        </div>

        <p className="es-nexus-purple-desc">
          {faultNode
            ? 'Node 3 (ADXL345) reported peak RMS vibration of 0.284g with high-frequency harmonics at 120Hz. Motor health index degraded to 68%.'
            : 'Node 3 (ADXL345) reported normal baseline FFT vibration (0.018g RMS). Inference latency stable at 8.4ms. Motor health index at 94%.'}
        </p>
      </div>

      {/* Next best action section */}
      <div className="es-nexus-next-action-wrap">
        <span className="es-nexus-next-action-label">Next best action</span>
        <div className="es-nexus-next-action-pills">
          <button
            type="button"
            className="es-nexus-action-pill"
            onClick={() => navigate('predictive-ai', { nodeId: 'node-esp32-adxl345' })}
            title="Navigate to Predictive AI vibration dashboard"
          >
            Inspect Node 3 FFT
          </button>
          <button
            type="button"
            className="es-nexus-action-pill"
            onClick={() =>
              downloadReportJson({
                date: new Date().toISOString().split('T')[0],
                gateway,
                nodes,
                pipeline,
                models,
                incidents,
              })
            }
            title="Download JSON diagnostics bundle"
          >
            Download diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}

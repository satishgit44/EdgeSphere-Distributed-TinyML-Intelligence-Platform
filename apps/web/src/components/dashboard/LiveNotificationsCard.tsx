import { Pause, Play } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function LiveNotificationsCard() {
  const { pipeline, isSimulatorRunning, toggleSimulatorRunning } = useSimulator();

  return (
    <article className="es-nexus-card es-nexus-rail-card">
      <div className="es-nexus-rail-header">
        <span className="es-nexus-rail-title">Live notifications</span>
      </div>

      <div className="es-nexus-stream-box">
        <div className="es-nexus-stream-top">
          <div>
            <div className="es-nexus-stream-name">Realtime stream</div>
            <div className="es-nexus-stream-time">Trailing 60 seconds</div>
          </div>
          <button
            type="button"
            className="es-nexus-circle-btn"
            onClick={toggleSimulatorRunning}
            title={isSimulatorRunning ? 'Pause stream' : 'Resume stream'}
            aria-label={isSimulatorRunning ? 'Pause stream' : 'Resume stream'}
          >
            {isSimulatorRunning ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>

        {/* Realtime event pills matching reference */}
        <div className="es-nexus-event-pills">
          <span className="es-nexus-event-pill">
            + {pipeline.ingestionRatePerSec.toFixed(0)} msgs/s
          </span>
          <span className="es-nexus-event-pill">Heartbeat ACK</span>
          <span className="es-nexus-event-pill">Node 3 sync</span>
        </div>
      </div>
    </article>
  );
}

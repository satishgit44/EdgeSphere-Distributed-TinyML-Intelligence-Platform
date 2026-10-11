import {
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  Zap,
  Cpu,
} from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function SimulatorControlBar() {
  const {
    isFreshInstall,
    isSimulatorRunning,
    mode,
    resetToFreshInstall,
    startSimulatorFleet,
    toggleSimulatorRunning,
    injectSensorFault,
    transmitSingleBurst,
  } = useSimulator();

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-2) var(--space-4)',
        background: 'var(--surface-card)',
        border: 'var(--border-default)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-xs)',
      }}
      role="toolbar"
      aria-label="Simulator Controls"
    >
      {/* Mode & Fleet Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span
          className={`es-badge ${mode === 'simulation' ? 'es-badge--simulated' : 'es-badge--connected'}`}
          style={{ letterSpacing: '0.04em', fontWeight: 600 }}
        >
          {mode === 'simulation' ? 'SIMULATION MODE' : 'HARDWARE MODE'}
        </span>

        <span style={{ color: 'var(--color-neutral-600)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Cpu size={14} color="var(--color-neutral-500)" />
          Target Fleet: <strong>Raspberry Pi 5 + 5 Planned Embedded Nodes</strong>
        </span>

        {isFreshInstall ? (
          <span className="es-badge es-badge--awaiting">FRESH INSTALL / UNCONFIGURED</span>
        ) : (
          <span className="es-badge es-badge--active">
            {isSimulatorRunning ? 'INGESTION RUNNING' : 'INGESTION PAUSED'}
          </span>
        )}
      </div>

      {/* Interactive Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {isFreshInstall ? (
          <button
            type="button"
            className="es-btn es-btn--primary"
            onClick={startSimulatorFleet}
            title="Initialize simulator fleet with Raspberry Pi 5 + 5 planned nodes"
          >
            <Play size={13} />
            Start Planned Fleet
          </button>
        ) : (
          <>
            <button
              type="button"
              className="es-btn"
              onClick={toggleSimulatorRunning}
              title={isSimulatorRunning ? 'Pause telemetry generator' : 'Resume telemetry generator'}
            >
              {isSimulatorRunning ? <Pause size={13} /> : <Play size={13} />}
              {isSimulatorRunning ? 'Pause' : 'Resume'}
            </button>

            <button
              type="button"
              className="es-btn"
              onClick={transmitSingleBurst}
              title="Emit a single telemetry packet from each active simulated node"
            >
              <Zap size={13} />
              Manual Burst
            </button>

            <button
              type="button"
              className="es-btn es-btn--danger"
              onClick={() => injectSensorFault('node-esp32-adxl345')}
              title="Simulate an ADXL345 SPI bus overrun fault"
            >
              <AlertTriangle size={13} />
              Inject ADXL345 Fault
            </button>
          </>
        )}

        <button
          type="button"
          className="es-btn"
          onClick={resetToFreshInstall}
          title="Reset dashboard to unconfigured fresh-install state"
        >
          <RotateCcw size={13} />
          Reset to Fresh Install
        </button>
      </div>
    </div>
  );
}

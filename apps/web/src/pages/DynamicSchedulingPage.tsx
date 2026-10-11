import { useState } from 'react';
import {
  Zap,
  RotateCcw,
  ShieldCheck,
  Clock,
  Battery,
} from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

interface ScheduledTask {
  id: string;
  name: string;
  assignedNodeId: string;
  assignedNodeName: string;
  targetMcu: string;
  estimatedLatencyMs: number;
  energyCostUj: number;
  priority: 'high' | 'medium' | 'low';
  reassignedFrom?: string;
  reassignmentReason?: string;
}

interface NodeCapability {
  hasIMU: boolean;
  imuSensorType?: string;
  hasAudio: boolean;
  hasProximity: boolean;
  hasEnv: boolean;
  maxSpiSpeedKhz: number;
  ramKb: number;
  maxSamplingRateHz: number;
  canAccessExternalAdxl345Spi: boolean;
}

const NODE_CAPABILITIES: Record<string, NodeCapability> = {
  'node-nano33-ble': {
    hasIMU: true,
    imuSensorType: 'LSM9DS1 (Onboard I2C/SPI)',
    hasAudio: false,
    hasProximity: false,
    hasEnv: false,
    maxSpiSpeedKhz: 8000,
    ramKb: 256,
    maxSamplingRateHz: 952, // LSM9DS1 max accelerometer output data rate
    canAccessExternalAdxl345Spi: false, // Physical pinout isolation: Nano cannot sample Node 3's ADXL345
  },
  'node-esp32-max9814': {
    hasIMU: false,
    hasAudio: true,
    hasProximity: false,
    hasEnv: false,
    maxSpiSpeedKhz: 10000,
    ramKb: 520,
    maxSamplingRateHz: 16000,
    canAccessExternalAdxl345Spi: false,
  },
  'node-esp32-adxl345': {
    hasIMU: true,
    imuSensorType: 'ADXL345 (Dedicated High-Bandwidth SPI)',
    hasAudio: false,
    hasProximity: false,
    hasEnv: false,
    maxSpiSpeedKhz: 5000,
    ramKb: 520,
    maxSamplingRateHz: 3200, // ADXL345 3.2kHz output data rate for bearing vibration
    canAccessExternalAdxl345Spi: true,
  },
  'node-esp32-pir-dist': {
    hasIMU: false,
    hasAudio: false,
    hasProximity: true,
    hasEnv: false,
    maxSpiSpeedKhz: 10000,
    ramKb: 520,
    maxSamplingRateHz: 50,
    canAccessExternalAdxl345Spi: false,
  },
  'node-esp32-env-bme': {
    hasIMU: false,
    hasAudio: false,
    hasProximity: false,
    hasEnv: true,
    maxSpiSpeedKhz: 10000,
    ramKb: 520,
    maxSamplingRateHz: 10,
    canAccessExternalAdxl345Spi: false,
  },
};

export function DynamicSchedulingPage() {
  const { nodes, injectSensorFault, resolveIncident, incidents } = useSimulator();
  const [policy, setPolicy] = useState<'latency' | 'energy' | 'fault_tolerant'>('fault_tolerant');
  const [schedulerLog, setSchedulerLog] = useState<Array<{ time: string; msg: string; type: 'info' | 'warn' | 'success' }>>([
    { time: '14:24:00', msg: 'Gateway Scheduler initialized with policy: Fault-Tolerant High-Availability.', type: 'info' },
  ]);

  const node3 = nodes.find((n) => n.id === 'node-esp32-adxl345');
  const isNode3Fault = node3?.integrationState === 'fault';

  // Workload Migration Compatibility Audit for Node 3's ADXL345 Bearing Vibration FFT:
  // Requires: 3200 Hz sampling rate, 128-pt FFT (min 16KB DSP memory), and direct physical access to the motor-mounted accelerometer.
  // Note: While the Arduino Nano 33 BLE Sense has an onboard LSM9DS1 IMU (952Hz max), it lacks physical wired access
  // to Node 3's motor accelerometer and operates at insufficient sample rate for bearing defect harmonics (>1.5kHz).
  // Therefore, dynamic failover cannot migrate to Nano 33 BLE. The workload must route to Raspberry Pi 5 Gateway.
  const getVibrationAssignment = (): ScheduledTask => {
    if (!isNode3Fault) {
      return {
        id: 'task-vib-fft',
        name: 'Vibration Harmonic Feature Extraction (3.2 kHz ADXL345)',
        assignedNodeId: 'node-esp32-adxl345',
        assignedNodeName: 'ESP32 Vibration Node (ADXL345)',
        targetMcu: 'ESP32-WROOM-32D',
        estimatedLatencyMs: policy === 'latency' ? 8.2 : 8.8,
        energyCostUj: policy === 'energy' ? 36 : 42,
        priority: 'high',
      };
    }

    // Programmatic verification against NODE_CAPABILITIES matrix:
    const nanoCap = NODE_CAPABILITIES['node-nano33-ble'];
    const peerHasSensorAccess = nanoCap.canAccessExternalAdxl345Spi && nanoCap.maxSamplingRateHz >= 3200;

    if (peerHasSensorAccess) {
      return {
        id: 'task-vib-fft',
        name: 'Vibration Harmonic Feature Extraction (3.2 kHz ADXL345)',
        assignedNodeId: 'node-nano33-ble',
        assignedNodeName: 'Arduino Nano 33 BLE Sense (Failover)',
        targetMcu: 'Nordic nRF52840 (64MHz Cortex-M4F)',
        estimatedLatencyMs: 14.8,
        energyCostUj: 64,
        priority: 'high',
        reassignedFrom: 'node-esp32-adxl345',
        reassignmentReason: 'Dynamic failover to compatible edge peer.',
      };
    }

    // Failover evaluation: No edge peer possesses physical wiring or 3.2kHz bandwidth to Node 3's motor sensor.
    // Assigning to Raspberry Pi 5 Gateway for central spectral FFT analysis.
    return {
      id: 'task-vib-fft',
      name: 'Vibration Harmonic Feature Extraction (3.2 kHz ADXL345)',
      assignedNodeId: 'gateway-rpi5',
      assignedNodeName: 'Raspberry Pi 5 Gateway (Host Failover)',
      targetMcu: 'Broadcom BCM2712 (Quad Cortex-A76 @ 2.4GHz)',
      estimatedLatencyMs: 1.8,
      energyCostUj: 280,
      priority: 'high',
      reassignedFrom: 'node-esp32-adxl345',
      reassignmentReason:
        'Primary Node 3 SPI overrun. Edge peer Arduino Nano 33 BLE rejected: lack of physical wiring to motor sensor (ADXL345 SPI) and LSM9DS1 limited to 952Hz. Workload failed over to Raspberry Pi 5 Gateway. Estimated penalty: +238µJ energy (simulated).',
    };
  };

  const scheduledTasks: ScheduledTask[] = [
    getVibrationAssignment(),
    {
      id: 'task-kws-audio',
      name: 'Acoustic Anomaly & Sound Classifier',
      assignedNodeId: 'node-esp32-max9814',
      assignedNodeName: 'ESP32 Acoustic Node (MAX9814)',
      targetMcu: 'ESP32-WROOM-32D',
      estimatedLatencyMs: policy === 'energy' ? 14.2 : policy === 'latency' ? 9.8 : 11.5,
      energyCostUj: policy === 'energy' ? 32 : policy === 'latency' ? 56 : 48,
      priority: 'medium',
    },
    {
      id: 'task-zone-detect',
      name: 'Workcell Safety Perimeter Verification',
      assignedNodeId: 'node-esp32-pir-dist',
      assignedNodeName: 'ESP32 Motion & Proximity Node',
      targetMcu: 'ESP32-WROOM-32D',
      estimatedLatencyMs: policy === 'energy' ? 5.1 : 3.2,
      energyCostUj: policy === 'energy' ? 12 : 18,
      priority: 'high',
    },
    {
      id: 'task-aqi-compensate',
      name: 'Gas Sensor Baseline Drift Compensation',
      assignedNodeId: 'node-esp32-env-bme',
      assignedNodeName: 'ESP32 Environmental Node',
      targetMcu: 'ESP32-WROOM-32D',
      estimatedLatencyMs: policy === 'energy' ? 6.8 : 4.6,
      energyCostUj: policy === 'energy' ? 16 : 22,
      priority: 'low',
    },
  ];

  const handlePolicyChange = (newPolicy: 'latency' | 'energy' | 'fault_tolerant') => {
    setPolicy(newPolicy);
    const nowTime = new Date().toTimeString().slice(0, 8);
    setSchedulerLog((prev) => [
      {
        time: nowTime,
        msg: `Policy recalculated: ${newPolicy.toUpperCase()}. Updated duty cycles, sleep intervals, and compute budget across 5 nodes.`,
        type: 'info',
      },
      ...prev,
    ]);
  };

  const handleTriggerSimulatedFault = () => {
    injectSensorFault('node-esp32-adxl345');
    const nowTime = new Date().toTimeString().slice(0, 8);
    setSchedulerLog((prev) => [
      {
        time: nowTime,
        msg: 'ALERT: Node 3 SPI Overrun! Verified edge peer constraints (lack of motor sensor access). Autonomously migrated task-vib-fft to Raspberry Pi 5 Gateway.',
        type: 'warn',
      },
      ...prev,
    ]);
  };

  const handleClearFault = () => {
    const inc = incidents.find((i) => i.nodeId === 'node-esp32-adxl345' && i.status !== 'resolved');
    if (inc) {
      resolveIncident(inc.id);
    }
    const nowTime = new Date().toTimeString().slice(0, 8);
    setSchedulerLog((prev) => [
      {
        time: nowTime,
        msg: 'Node 3 fault resolved. Gateway restored primary vibration task to ESP32-ADXL345. Energy-optimal baseline re-established.',
        type: 'success',
      },
      ...prev,
    ]);
  };

  return (
    <div className="es-page-container">
      {/* Header */}
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Dynamic Scheduling</span>
          </div>
          <h1 className="es-nexus-title">Edge Gateway Workload Coordinator</h1>
          <p className="es-nexus-subtitle">
            Simulate dynamic inference scheduling, energy-latency tradeoffs, and fault-triggered failover across nodes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {isNode3Fault ? (
            <button
              type="button"
              className="es-nexus-action-button-primary"
              onClick={handleClearFault}
            >
              <RotateCcw size={13} /> Clear Fault & Restore Task
            </button>
          ) : (
            <button
              type="button"
              className="es-btn es-btn--danger"
              onClick={handleTriggerSimulatedFault}
            >
              <Zap size={13} /> Inject Node 3 Fault (Test Failover)
            </button>
          )}
        </div>
      </div>

      {/* Prototype Disclosure */}
      <div className="es-simulation-disclosure-banner">
        <ShieldCheck size={16} color="#42DDE7" />
        <span>
          <strong>Simulated Gateway Scheduler:</strong> The Raspberry Pi 5 coordinates scheduling decisions. Task migration displays proposed reassignments based on deterministic rule sets rather than physical firmware re-flashing.
        </span>
      </div>

      {/* Policy Selector & Top Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 2fr)', gap: 16 }}>
        {/* Policy Selector Card */}
        <article className="es-nexus-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 700, textTransform: 'uppercase' }}>
            Scheduling Optimization Policy
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={() => handlePolicyChange('fault_tolerant')}
              className={`es-policy-btn ${policy === 'fault_tolerant' ? 'is-active' : ''}`}
            >
              <strong>Fault-Tolerant High Availability (Recommended)</strong>
              <span>Autonomously migrates critical workloads when heartbeat or SPI overrun occurs.</span>
            </button>
            <button
              type="button"
              onClick={() => handlePolicyChange('latency')}
              className={`es-policy-btn ${policy === 'latency' ? 'is-active' : ''}`}
            >
              <strong>Lowest Inference Latency</strong>
              <span>Prioritizes MCUs with higher clock speeds and dedicated hardware DSP units.</span>
            </button>
            <button
              type="button"
              onClick={() => handlePolicyChange('energy')}
              className={`es-policy-btn ${policy === 'energy' ? 'is-active' : ''}`}
            >
              <strong>Energy Conservation</strong>
              <span>Applies power duty-cycling and downsamples non-critical sensor polling.</span>
            </button>
          </div>
        </article>

        {/* Fleet Workload Overview */}
        <article className="es-nexus-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
            Proposed Dynamic Task Assignments
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scheduledTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: t.reassignedFrom ? '1.5px solid #FF9800' : '1px solid #ECEAF5',
                  background: t.reassignedFrom ? '#FFF9F0' : '#FAF9FD',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: '13px', color: '#17171C' }}>{t.name}</strong>
                    {t.reassignedFrom && (
                      <span className="es-nexus-mini-badge" style={{ background: '#FFE8D6', color: '#C05621' }}>
                        FAILOVER REASSIGNED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#737487', marginTop: 3 }}>
                    Assigned: <span style={{ color: '#1677F8', fontWeight: 600 }}>{t.assignedNodeName}</span> ({t.targetMcu})
                  </div>
                  {t.reassignmentReason && (
                    <div style={{ fontSize: '11px', color: '#C05621', marginTop: 3 }}>
                      ⚠ {t.reassignmentReason}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#17171C' }} title="Estimated simulated latency">
                      <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                      {t.estimatedLatencyMs} est. ms
                    </div>
                    <div style={{ fontSize: '11px', color: '#8F90A6' }} title="Estimated simulated compute energy">
                      <Battery size={11} style={{ display: 'inline', marginRight: 4 }} />
                      {t.energyCostUj} est. µJ
                    </div>
                  </div>
                  <span className={`es-impact-pill is-${t.priority}`}>{t.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Scheduler Event Log */}
      <article className="es-nexus-card">
        <div className="es-nexus-card-header">
          <div>
            <h3 className="es-nexus-card-title">Gateway Scheduler Operational Event Log</h3>
            <p className="es-nexus-card-subtitle">Real-time scheduling decisions and failover audit trail</p>
          </div>
        </div>

        <div className="es-nexus-card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {schedulerLog.map((log, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: '#F8F8FB',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span style={{ color: '#8F90A6' }}>[{log.time}]</span>
                <span style={{ color: log.type === 'warn' ? '#D83A4E' : log.type === 'success' ? '#16A36A' : '#17171C' }}>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

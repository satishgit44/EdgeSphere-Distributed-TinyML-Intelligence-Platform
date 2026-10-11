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

export function DynamicSchedulingPage() {
  const { nodes, injectSensorFault, resolveIncident, incidents } = useSimulator();
  const [policy, setPolicy] = useState<'latency' | 'energy' | 'fault_tolerant'>('fault_tolerant');
  const [schedulerLog, setSchedulerLog] = useState<Array<{ time: string; msg: string; type: 'info' | 'warn' | 'success' }>>([
    { time: '14:24:00', msg: 'Gateway Scheduler initialized with policy: Fault-Tolerant High-Availability.', type: 'info' },
  ]);

  const node3 = nodes.find((n) => n.id === 'node-esp32-adxl345');
  const isNode3Fault = node3?.integrationState === 'fault';

  // Deterministic task assignment based on current fleet condition and selected policy
  const baseTasks: ScheduledTask[] = [
    {
      id: 'task-vib-fft',
      name: 'Vibration Harmonic Feature Extraction',
      assignedNodeId: isNode3Fault ? 'node-nano33-ble' : 'node-esp32-adxl345',
      assignedNodeName: isNode3Fault ? 'Arduino Nano 33 BLE Sense (Failover)' : 'ESP32 Vibration Node (ADXL345)',
      targetMcu: isNode3Fault ? 'Nordic nRF52840' : 'ESP32-WROOM-32D',
      estimatedLatencyMs: isNode3Fault ? 14.8 : 8.8,
      energyCostUj: isNode3Fault ? 64 : 42,
      priority: 'high',
      reassignedFrom: isNode3Fault ? 'node-esp32-adxl345' : undefined,
      reassignmentReason: isNode3Fault ? 'Primary node in SPI overrun fault state. Workload migrated to backup Cortex-M4.' : undefined,
    },
    {
      id: 'task-kws-audio',
      name: 'Acoustic Anomaly & Sound Classifier',
      assignedNodeId: 'node-esp32-max9814',
      assignedNodeName: 'ESP32 Acoustic Node (MAX9814)',
      targetMcu: 'ESP32-WROOM-32D',
      estimatedLatencyMs: policy === 'energy' ? 14.2 : 11.5,
      energyCostUj: policy === 'energy' ? 32 : 48,
      priority: 'medium',
    },
    {
      id: 'task-zone-detect',
      name: 'Workcell Safety Perimeter Verification',
      assignedNodeId: 'node-esp32-pir-dist',
      assignedNodeName: 'ESP32 Motion & Proximity Node',
      targetMcu: 'ESP32-WROOM-32D',
      estimatedLatencyMs: 3.2,
      energyCostUj: 18,
      priority: 'high',
    },
    {
      id: 'task-aqi-compensate',
      name: 'Gas Sensor Baseline Drift Compensation',
      assignedNodeId: 'node-esp32-env-bme',
      assignedNodeName: 'ESP32 Environmental Node',
      targetMcu: 'ESP32-WROOM-32D',
      estimatedLatencyMs: 4.6,
      energyCostUj: 22,
      priority: 'low',
    },
  ];

  const handlePolicyChange = (newPolicy: 'latency' | 'energy' | 'fault_tolerant') => {
    setPolicy(newPolicy);
    const nowTime = new Date().toTimeString().slice(0, 8);
    setSchedulerLog((prev) => [
      { time: nowTime, msg: `Scheduling policy switched to: ${newPolicy.toUpperCase()}. Evaluating fleet latency and energy trade-offs.`, type: 'info' },
      ...prev,
    ]);
  };

  const handleTriggerSimulatedFault = () => {
    injectSensorFault('node-esp32-adxl345');
    const nowTime = new Date().toTimeString().slice(0, 8);
    setSchedulerLog((prev) => [
      {
        time: nowTime,
        msg: 'ALERT: Node 3 SPI Overrun triggered! Gateway Scheduler autonomously migrated task-vib-fft to Arduino Nano 33 BLE Sense.',
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
        msg: 'Node 3 fault cleared. Gateway restored primary vibration extraction workload back to ESP32 ADXL345.',
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
            {baseTasks.map((t) => (
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
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#17171C' }}>
                      <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                      {t.estimatedLatencyMs} ms
                    </div>
                    <div style={{ fontSize: '11px', color: '#8F90A6' }}>
                      <Battery size={11} style={{ display: 'inline', marginRight: 4 }} />
                      {t.energyCostUj} µJ
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

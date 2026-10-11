import { Server, Activity, Thermometer, HardDrive, Cpu, Radio } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { StatusBadge } from '@/components/common/StatusBadge';

export function GatewayStatusPanel() {
  const { gateway, isFreshInstall, startSimulatorFleet } = useSimulator();

  if (isFreshInstall) {
    return (
      <article className="es-card">
        <div className="es-card-header">
          <h3 className="es-card-title">
            <Server size={16} color="var(--color-neutral-500)" />
            Raspberry Pi 5 — Edge Intelligence Manager
          </h3>
          <StatusBadge variant="configured" label="UNCONFIGURED" />
        </div>
        <div className="es-card-body" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{ maxWidth: 440, margin: '0 auto' }}>
            <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
              Gateway Not Yet Connected
            </h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginTop: 6, lineHeight: 1.5 }}>
              The Raspberry Pi 5 manager daemon (<code>edgesphere-manager</code>) has not reported its heartbeat.
              Pair your gateway hardware via SSH or start the simulator fleet to explore with synthetic telemetry.
            </p>
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="es-btn es-btn--primary"
                onClick={startSimulatorFleet}
              >
                Initialize Simulator Fleet
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="es-card">
      <div className="es-card-header">
        <div>
          <h3 className="es-card-title">
            <Server size={16} color="var(--color-primary-600)" />
            {gateway.name}
          </h3>
          <p className="es-card-subtitle es-mono">{gateway.hardwareModel} · {gateway.host}</p>
        </div>
        <StatusBadge variant="healthy" label="DAEMON ACTIVE (SIMULATED)" />
      </div>

      <div className="es-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Hardware Resource Gauge Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            background: 'var(--surface-card-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Cpu size={18} color="var(--color-neutral-600)" />
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
                CPU Load
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {gateway.cpuLoadPct}%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Thermometer size={18} color={gateway.thermalTempC > 65 ? 'var(--color-danger-500)' : 'var(--color-neutral-600)'} />
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
                Thermal
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {gateway.thermalTempC}°C
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Activity size={18} color="var(--color-neutral-600)" />
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
                Memory
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {(gateway.ramUsageMb / 1024).toFixed(1)} / {(gateway.ramTotalMb / 1024).toFixed(0)} GB
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <HardDrive size={18} color="var(--color-neutral-600)" />
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
                Ring Buffer
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {gateway.storageUsageGb} / {gateway.storageTotalGb} GB
              </div>
            </div>
          </div>
        </div>

        {/* Gateway Services List */}
        <div>
          <h4
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-500)',
              letterSpacing: '0.04em',
              marginBottom: 'var(--space-2)',
            }}
          >
            Manager Daemons & Microservices
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {gateway.services.map((svc) => (
              <div
                key={svc.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'var(--surface-card)',
                  border: 'var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Radio size={13} color="var(--color-success-600)" />
                  <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)', fontFamily: 'var(--font-mono)' }}>
                    {svc.name}
                  </span>
                  <span style={{ color: 'var(--color-neutral-500)' }}>· {svc.detail}</span>
                </div>
                <StatusBadge variant="healthy" label="RUNNING" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

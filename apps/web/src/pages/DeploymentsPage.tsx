import { useState } from 'react';
import { Rocket, RefreshCw, ArrowUpRight } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function DeploymentsPage() {
  const { models } = useSimulator();
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const handleTriggerOta = (modelId: string) => {
    setDeployingId(modelId);
    setTimeout(() => {
      setDeployingId(null);
      alert('OTA deployment staged: Binary compiled and queued for MQTT chunked transfer.');
    }, 1200);
  };

  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Deployments & OTA</span>
          </div>
          <h1 className="es-nexus-title">Model Rollouts & Firmware OTA</h1>
          <p className="es-nexus-subtitle">
            Orchestrate over-the-air firmware updates and TinyML model flashing across edge MCUs.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <article className="es-nexus-card">
          <div className="es-nexus-card-header">
            <div>
              <h3 className="es-nexus-card-title">Staged Deployment Workflows</h3>
              <p className="es-nexus-card-subtitle">Explicit state tracking: Draft • Queued • In Progress • Succeeded • Failed</p>
            </div>
          </div>
          <div className="es-nexus-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {models.map((mod) => (
                <div
                  key={mod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid #ECEAF5',
                    background: '#FAF9FD',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Rocket size={15} color="#7455F5" />
                      <strong style={{ fontSize: '13.5px', color: '#161528' }}>{mod.name}</strong>
                      <span className="es-nexus-mini-badge">v{mod.version}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#8F90A6', marginTop: 4 }}>
                      Target: {mod.targetMcu} • Flash: {mod.flashFootprintKb} KB • RAM: {mod.ramFootprintKb} KB
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="es-nexus-status-pill es-nexus-status--active">
                      {mod.deploymentState === 'deployed' ? 'Active on Hardware' : 'Staged in Registry'}
                    </span>
                    <button
                      type="button"
                      className="es-nexus-action-button-primary"
                      onClick={() => handleTriggerOta(mod.id)}
                      disabled={deployingId === mod.id}
                    >
                      {deployingId === mod.id ? (
                        <>
                          <RefreshCw size={12} className="spin" /> Flashing OTA…
                        </>
                      ) : (
                        <>
                          Rollout OTA <ArrowUpRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

import { ModelRegistryCard } from '@/components/dashboard/ModelRegistryCard';

export function ModelsPage() {
  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Model Registry</span>
          </div>
          <h1 className="es-nexus-title">TinyML Artifacts & Quantization</h1>
          <p className="es-nexus-subtitle">
            Audited TFLite Micro INT8 models, flash/RAM footprints, and cryptographic SHA256 signatures.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ModelRegistryCard />
      </div>
    </div>
  );
}

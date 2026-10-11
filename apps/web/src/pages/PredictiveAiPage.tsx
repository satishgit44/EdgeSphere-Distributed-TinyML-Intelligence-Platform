import { Zap, Info } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useSimulator } from '@/context/SimulatorContext';

const FFT_SPECTRUM_DATA = [
  { freq: '10Hz', power: 0.012, baseline: 0.011 },
  { freq: '30Hz', power: 0.018, baseline: 0.016 },
  { freq: '60Hz (RPM)', power: 0.045, baseline: 0.042 },
  { freq: '120Hz (2X)', power: 0.185, baseline: 0.024 }, // harmonic peak during fault
  { freq: '240Hz', power: 0.032, baseline: 0.018 },
  { freq: '500Hz', power: 0.022, baseline: 0.015 },
  { freq: '1kHz', power: 0.014, baseline: 0.012 },
];

export function PredictiveAiPage() {
  const { nodes, injectSensorFault } = useSimulator();
  const node3 = nodes.find((n) => n.id === 'node-esp32-adxl345');
  const isFault = node3?.integrationState === 'fault';

  return (
    <div className="es-page-container">
      {/* Page Header */}
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span>Predictive AI</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Node 3 Motor Diagnostics</span>
          </div>
          <h1 className="es-nexus-title">Motor Predictive Maintenance & Explainability</h1>
          <p className="es-nexus-subtitle">
            Audited vibration analysis, FFT frequency-domain feature extraction, and TFLite Micro INT8 inference.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className={`es-nexus-pill ${isFault ? 'active' : ''}`}
            onClick={() => injectSensorFault('node-esp32-adxl345')}
          >
            <Zap size={13} />
            <span>{isFault ? 'Reset to Baseline' : 'Inject Bearing Fault'}</span>
          </button>
        </div>
      </div>

      {/* Top Health & Diagnostic Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <article className="es-nexus-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 700, textTransform: 'uppercase' }}>
            Motor Health Index
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: isFault ? '#D83A4E' : '#16A36A' }}>
              {isFault ? '68%' : '94%'}
            </span>
            <span className={`es-kpi-trend-pill ${isFault ? 'is-danger' : 'is-positive'}`}>
              {isFault ? 'Degraded Wear' : 'Nominal Baseline'}
            </span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#737487', marginTop: 4 }}>
            Calculated via ADXL345 3-axis spectral power & kurtosis
          </div>
        </article>

        <article className="es-nexus-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 700, textTransform: 'uppercase' }}>
            RMS Vibration Vector
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: '#17171C' }}>
              {isFault ? '0.284g' : '0.018g'}
            </span>
            <span className="es-kpi-trend-pill is-blue">ISO 10816-3 Class I</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#737487', marginTop: 4 }}>
            Threshold: 0.080g &bull; Sampling rate: 3.2 kHz SPI
          </div>
        </article>

        <article className="es-nexus-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 700, textTransform: 'uppercase' }}>
            Anomaly Confidence
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: isFault ? '#B7791F' : '#16A36A' }}>
              {isFault ? '0.88' : '0.04'}
            </span>
            <span className="es-kpi-trend-pill is-orange">Autoencoder INT8</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#737487', marginTop: 4 }}>
            Reconstruction loss above 0.65 triggers warning
          </div>
        </article>
      </div>

      {/* Main Charts Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '20px' }}>
        {/* Left: FFT Harmonic Power Spectrum */}
        <article className="es-nexus-card">
          <div className="es-nexus-card-header">
            <div>
              <h3 className="es-nexus-card-title">Frequency Domain (FFT Spectrum)</h3>
              <p className="es-nexus-card-subtitle">Harmonic energy peaks across motor rotational frequencies</p>
            </div>
            <span className="es-nexus-mini-badge">ADXL345 SPI Bus</span>
          </div>

          <div className="es-nexus-card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FFT_SPECTRUM_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF7" />
                <XAxis dataKey="freq" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
                <Tooltip />
                <Bar dataKey="power" name="Measured Power (g²)" fill={isFault ? '#D83A4E' : '#1677F8'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="baseline" name="Baseline Normal" fill="#E9E9F0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Right: Explainable Feature Importance Panel */}
        <article className="es-nexus-card">
          <div className="es-nexus-card-header">
            <div>
              <h3 className="es-nexus-card-title">Feature Importance & Attribution</h3>
              <p className="es-nexus-card-subtitle">Evidence breakdown evaluated by TFLite model</p>
            </div>
            <span className="es-nexus-mini-badge" style={{ background: '#EDE9FE', color: '#7955E9' }}>
              SHAP Attribution
            </span>
          </div>

          <div className="es-nexus-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: '#17171C' }}>120Hz 2X Harmonic Energy</span>
                <strong style={{ color: isFault ? '#D83A4E' : '#16A36A' }}>{isFault ? '+64% impact' : 'Normal'}</strong>
              </div>
              <div style={{ width: '100%', height: 6, background: '#F0EDF7', borderRadius: 999, marginTop: 6 }}>
                <div style={{ width: isFault ? '85%' : '15%', height: '100%', background: isFault ? '#D83A4E' : '#1677F8', borderRadius: 999 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: '#17171C' }}>Kurtosis (Peak Spikiness)</span>
                <strong style={{ color: isFault ? '#B7791F' : '#16A36A' }}>{isFault ? '+22% impact' : 'Normal'}</strong>
              </div>
              <div style={{ width: '100%', height: 6, background: '#F0EDF7', borderRadius: 999, marginTop: 6 }}>
                <div style={{ width: isFault ? '54%' : '18%', height: '100%', background: isFault ? '#B7791F' : '#42DDE7', borderRadius: 999 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: '#17171C' }}>Crest Factor</span>
                <strong>{isFault ? '+14% impact' : 'Normal'}</strong>
              </div>
              <div style={{ width: '100%', height: 6, background: '#F0EDF7', borderRadius: 999, marginTop: 6 }}>
                <div style={{ width: isFault ? '35%' : '12%', height: '100%', background: '#7955E9', borderRadius: 999 }} />
              </div>
            </div>

            <div style={{ marginTop: 10, padding: '12px', background: '#F8F8FB', borderRadius: '8px', fontSize: '11.5px', color: '#737487', lineHeight: 1.5 }}>
              <Info size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
              <strong>Explainability Note:</strong> Model prediction is derived from INT8 quantized feature embeddings on the ESP32. A model alert is a statistical warning and does not constitute human-verified mechanical failure.
            </div>
          </div>
        </article>
      </div>

      {/* Recommended Inspection Actions */}
      <article className="es-nexus-card">
        <div className="es-nexus-card-header">
          <h3 className="es-nexus-card-title">Recommended Mechanical Inspection Steps</h3>
        </div>
        <div className="es-nexus-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E9E9F0', background: '#FFFFFF' }}>
              <strong style={{ fontSize: '13px', color: '#17171C' }}>1. Physical Alignment Check</strong>
              <p style={{ fontSize: '12px', color: '#737487', marginTop: 4 }}>
                Inspect flexible shaft coupling for angular or parallel misalignment causing the 120Hz 2X running speed harmonic.
              </p>
            </div>
            <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E9E9F0', background: '#FFFFFF' }}>
              <strong style={{ fontSize: '13px', color: '#17171C' }}>2. Lubrication & Bearing Inspection</strong>
              <p style={{ fontSize: '12px', color: '#737487', marginTop: 4 }}>
                Verify grease lubrication level on drive-end bearing. Check acoustic feedback on Node 2 (MAX9814) for high-frequency clicking.
              </p>
            </div>
            <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E9E9F0', background: '#FFFFFF' }}>
              <strong style={{ fontSize: '13px', color: '#17171C' }}>3. Retrain/Recalibrate Baseline</strong>
              <p style={{ fontSize: '12px', color: '#737487', marginTop: 4 }}>
                If mechanical inspection confirms normal mounting, capture a new 30-minute vibration baseline to update INT8 model weights.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

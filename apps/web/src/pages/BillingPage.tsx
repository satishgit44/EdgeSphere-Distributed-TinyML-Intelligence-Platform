import { Check } from 'lucide-react';

interface PlanTier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
  highlight?: boolean;
}

const PLANS: PlanTier[] = [
  {
    id: 'community',
    name: 'Community / Local',
    price: '$0',
    cadence: 'forever free',
    description: 'Local-first embedded management on Raspberry Pi 5 without external dependencies.',
    features: [
      'Core local dashboard on Pi 5',
      'Initial 5-node hardware setup',
      'Local Mosquitto MQTT & telemetry',
      'Basic alerts and incident logs',
      'Local offline operation',
    ],
    isCurrent: true,
  },
  {
    id: 'developer',
    name: 'Developer',
    price: '$29',
    cadence: 'per month',
    description: 'Expanded telemetry retention, model compiler tooling, and custom nodes.',
    features: [
      'Up to 15 registered edge nodes',
      'Extended 30-day telemetry retention',
      'Automated TFLite INT8 compilation',
      'Model version registry & rollback',
      'Exportable PDF/JSON diagnostic reports',
    ],
    highlight: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$99',
    cadence: 'per month',
    description: 'Multi-seat access control, shared fleet groups, and predictive maintenance.',
    features: [
      'Up to 50 edge nodes across gateways',
      'Multi-user RBAC (Owner, Admin, Engineer)',
      'Advanced motor FFT vibration analysis',
      'OTA batch deployment orchestration',
      'Configurable telemetry retention',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'annual billing',
    description: 'Fleet-wide scaling, dedicated edge gateways, and air-gapped compliance.',
    features: [
      'Unlimited edge nodes & gateways',
      'Federated Learning coordinator',
      'Custom SLA & dedicated support',
      'Air-gapped on-premise licensing',
      'Custom security audits & compliance',
    ],
  },
];

export function BillingPage() {
  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Billing & Subscription</span>
          </div>
          <h1 className="es-nexus-title">Plans & Workspace Entitlements</h1>
          <p className="es-nexus-subtitle">
            Manage your EdgeSphere plan, review device quotas, and inspect local vs cloud entitlements.
          </p>
        </div>
      </div>

      {/* Quota Dashboard Card */}
      <article className="es-nexus-card" style={{ marginBottom: '24px' }}>
        <div className="es-nexus-card-header">
          <div>
            <h3 className="es-nexus-card-title">Current Plan Quotas & Usage</h3>
            <p className="es-nexus-card-subtitle">Local Plan • Raspberry Pi 5 Gateway Active</p>
          </div>
          <span className="es-nexus-status-pill es-nexus-status--active">Community Plan</span>
        </div>
        <div className="es-nexus-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#8F90A6', textTransform: 'uppercase', fontWeight: 600 }}>
                Registered Nodes Quota
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#161528', marginTop: 4 }}>
                5 / 5 Nodes Used (100%)
              </div>
              <div style={{ width: '100%', height: 6, background: '#EDE9FE', borderRadius: 999, marginTop: 8 }}>
                <div style={{ width: '100%', height: '100%', background: '#7455F5', borderRadius: 999 }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#8F90A6', textTransform: 'uppercase', fontWeight: 600 }}>
                Local Ring Buffer Storage
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#161528', marginTop: 4 }}>
                48.2 MB / 250 MB (19%)
              </div>
              <div style={{ width: '100%', height: 6, background: '#EDE9FE', borderRadius: 999, marginTop: 8 }}>
                <div style={{ width: '19%', height: '100%', background: '#20C9D9', borderRadius: 999 }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#8F90A6', textTransform: 'uppercase', fontWeight: 600 }}>
                Active Team Members
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#161528', marginTop: 4 }}>
                1 / 1 Seat (Owner)
              </div>
              <div style={{ width: '100%', height: 6, background: '#EDE9FE', borderRadius: 999, marginTop: 8 }}>
                <div style={{ width: '100%', height: '100%', background: '#7455F5', borderRadius: 999 }} />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Plan Tier Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`es-nexus-card ${plan.highlight ? 'es-nexus-plan-highlight' : ''}`}
            style={{
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: plan.highlight ? '2px solid #7455F5' : '1px solid #ECEAF5',
            }}
          >
            {plan.highlight && (
              <span
                style={{
                  position: 'absolute',
                  top: -12,
                  right: 18,
                  background: '#7455F5',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 999,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Recommended
              </span>
            )}

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#161528' }}>{plan.name}</h3>
            <p style={{ fontSize: '12px', color: '#8F90A6', marginTop: 4, minHeight: 36 }}>{plan.description}</p>

            <div style={{ margin: '16px 0 20px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#161528' }}>{plan.price}</span>
              <span style={{ fontSize: '12px', color: '#8F90A6', marginLeft: 6 }}>/ {plan.cadence}</span>
            </div>

            <button
              type="button"
              className={plan.isCurrent ? 'es-nexus-pill active' : 'es-nexus-action-button-primary'}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}
              onClick={() => alert(`Upgrading to ${plan.name} plan: Staged for Phase 5 sandbox checkout.`)}
            >
              {plan.isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              {plan.features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#4B4A5A' }}>
                  <Check size={14} color="#7455F5" style={{ flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

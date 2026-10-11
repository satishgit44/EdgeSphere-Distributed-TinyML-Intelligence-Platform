import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MetricSpecBanner } from '@/components/analytics/MetricSpecBanner';
import {
  TELEMETRY_OVER_TIME,
  CONNECTIVITY_HISTORY,
  LATENCY_DISTRIBUTION,
  MODEL_BENCHMARKS,
  DEPLOYMENT_STATS,
  INCIDENT_RECOVERY_METRICS,
  FEDERATED_LEARNING_SUMMARY,
} from '@/data/analyticsSimulator';

export function AnalyticsReporting() {
  return (
    <div className="es-dashboard-grid">
      {/* Header */}
      <div className="es-page-header">
        <h1 className="es-page-header-title">Analytics & Operational Reports</h1>
        <p className="es-page-header-subtitle">
          Audited edge metrics, distributions, federated learning rounds, and fleet performance
        </p>
      </div>

      {/* Grid of Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))', gap: 'var(--space-5)' }}>
        
        {/* 1. Telemetry Over Time (with Missing Data Window Clearly Shown) */}
        <article className="es-card">
          <div className="es-card-header">
            <div>
              <h3 className="es-card-title">1. Telemetry Ingestion Over Time</h3>
              <p className="es-card-subtitle">Sensor message throughput with missing data window detection</p>
            </div>
          </div>
          <div className="es-card-body">
            <MetricSpecBanner def={TELEMETRY_OVER_TIME.spec} hasMissingData={true} />
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TELEMETRY_OVER_TIME.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
                  <XAxis dataKey="time" tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-neutral-0)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [val ? `${val} msg/s` : 'MISSING DATA (Gateway Disconnect)', 'Ingestion Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    connectNulls={false}
                    dot={{ r: 3, fill: '#7C3AED' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

        {/* 2. Heartbeat & Connectivity History */}
        <article className="es-card">
          <div className="es-card-header">
            <div>
              <h3 className="es-card-title">2. Heartbeat & Connectivity History</h3>
              <p className="es-card-subtitle">7-day fleet connectivity availability and ping degradation</p>
            </div>
          </div>
          <div className="es-card-body">
            <MetricSpecBanner def={CONNECTIVITY_HISTORY.spec} />
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONNECTIVITY_HISTORY.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
                  <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} />
                  <YAxis domain={[90, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-neutral-0)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                      fontSize: '12px',
                    }}
                    formatter={(v: any) => [`${v}%`, '']}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="connected" name="Connected (%)" fill="#22C55E" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="degraded" name="Degraded (%)" fill="#F59E0B" stackId="a" />
                  <Bar dataKey="dropped" name="Dropped (%)" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

        {/* 3. Inference Latency Distribution */}
        <article className="es-card">
          <div className="es-card-header">
            <div>
              <h3 className="es-card-title">3. Inference Latency Distributions</h3>
              <p className="es-card-subtitle">Execution time histogram across MCU cores</p>
            </div>
          </div>
          <div className="es-card-body">
            <MetricSpecBanner def={LATENCY_DISTRIBUTION.spec} />
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LATENCY_DISTRIBUTION.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
                  <XAxis dataKey="bucket" tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-neutral-0)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                      fontSize: '12px',
                    }}
                    formatter={(v: any) => [`${v} samples`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

        {/* 4. Model Benchmark Comparisons */}
        <article className="es-card">
          <div className="es-card-header">
            <div>
              <h3 className="es-card-title">4. Model Benchmark Comparisons</h3>
              <p className="es-card-subtitle">Quantized TinyML models evaluated on hardware targets</p>
            </div>
          </div>
          <div className="es-card-body">
            <MetricSpecBanner def={MODEL_BENCHMARKS.spec} />
            <div style={{ overflowX: 'auto' }}>
              <table className="es-table">
                <thead>
                  <tr>
                    <th>Model Variant</th>
                    <th>Accuracy</th>
                    <th>Latency</th>
                    <th>Flash Storage</th>
                    <th>RAM Footprint</th>
                  </tr>
                </thead>
                <tbody>
                  {MODEL_BENCHMARKS.data.map((m) => (
                    <tr key={m.model}>
                      <td style={{ fontWeight: 600 }}>{m.model}</td>
                      <td>
                        <span style={{ color: 'var(--color-success-700)', fontWeight: 600 }}>
                          {m.accuracy}%
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--color-primary-700)', fontWeight: 500 }}>
                          {m.latencyMs} ms
                        </span>
                      </td>
                      <td>{m.flashKb} KB</td>
                      <td>{m.ramKb} KB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>

        {/* 5. Deployment Success & Failure Rates */}
        <article className="es-card">
          <div className="es-card-header">
            <div>
              <h3 className="es-card-title">5. Deployment Success & Failure Rates</h3>
              <p className="es-card-subtitle">OTA rollout delivery metrics across major firmware releases</p>
            </div>
          </div>
          <div className="es-card-body">
            <MetricSpecBanner def={DEPLOYMENT_STATS.spec} />
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPLOYMENT_STATS.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
                  <XAxis dataKey="campaign" tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} />
                  <YAxis domain={[90, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-neutral-0)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="successRate" name="Success (%)" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failureRate" name="Failure (%)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

        {/* 6. Incident Frequency & Recovery Duration */}
        <article className="es-card">
          <div className="es-card-header">
            <div>
              <h3 className="es-card-title">6. Incident Frequency & MTTR</h3>
              <p className="es-card-subtitle">Monthly incident occurrences versus mean recovery duration (minutes)</p>
            </div>
          </div>
          <div className="es-card-body">
            <MetricSpecBanner def={INCIDENT_RECOVERY_METRICS.spec} />
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={INCIDENT_RECOVERY_METRICS.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} tickFormatter={(v) => `${v}m`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-neutral-0)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="incidents" name="Incident Count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="mttrMinutes" name="MTTR (Minutes)" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

        {/* 7. Experiment & Federated Learning Summary */}
        <article className="es-card" style={{ gridColumn: '1 / -1' }}>
          <div className="es-card-header">
            <div>
              <h3 className="es-card-title">7. Federated Learning Round Convergence</h3>
              <p className="es-card-subtitle">Decentralized model training convergence curve (loss vs accuracy vs nodes)</p>
            </div>
          </div>
          <div className="es-card-body">
            <MetricSpecBanner def={FEDERATED_LEARNING_SUMMARY.spec} />
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FEDERATED_LEARNING_SUMMARY.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
                  <XAxis dataKey="round" tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} />
                  <YAxis domain={[90, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-neutral-0)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="accuracy" name="Fleet Model Accuracy (%)" stroke="#06B6D4" strokeWidth={2.5} fill="url(#accuracyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { MoreVertical } from 'lucide-react';

const USAGE_DATA = [
  { month: 'Jan', usage: 140, isHighlight: false },
  { month: 'Feb', usage: 165, isHighlight: false },
  { month: 'Mar', usage: 180, isHighlight: false },
  { month: 'Apr', usage: 155, isHighlight: false },
  { month: 'May', usage: 195, isHighlight: false },
  { month: 'Jun', usage: 230, isHighlight: true },
  { month: 'Jul', usage: 175, isHighlight: false },
  { month: 'Aug', usage: 160, isHighlight: false },
  { month: 'Sep', usage: 185, isHighlight: false },
  { month: 'Oct', usage: 210, isHighlight: false },
  { month: 'Nov', usage: 190, isHighlight: false },
  { month: 'Dec', usage: 220, isHighlight: false },
];

const TEMP_DATA = [
  { time: '04.00', temp: 21.8 },
  { time: '08.00', temp: 26.2 },
  { time: '12.00', temp: 22.1 },
  { time: '16.00', temp: 25.0 },
  { time: '20.00', temp: 28.4 },
  { time: '23.00', temp: 26.8 },
];

const ENERGY_DATA = [
  { time: '12.00', primary: 68, secondary: 34 },
  { time: '14.00', primary: 92, secondary: 38 },
  { time: '16.00', primary: 85, secondary: 28 },
  { time: '18.00', primary: 75, secondary: 42 },
  { time: '20.00', primary: 64, secondary: 32 },
  { time: '23.00', primary: 82, secondary: 36 },
];

export function UnifiedAnalyticsGrid() {
  const [usageRange, setUsageRange] = useState('Last 1 Years');
  const [tempRange, setTempRange] = useState('Last 24 Hours');
  const [energyRange, setEnergyRange] = useState('Last 24 Hours');

  return (
    <div className="es-analytics-2x2-grid">
      {/* 1. Devices Usage Analytics (Connexio Bar Chart with Blue Peak) */}
      <article className="es-chart-panel">
        <div className="es-panel-header">
          <div>
            <h3 className="es-panel-title">Devices Usage Analytics</h3>
          </div>
          <div className="es-panel-header-controls">
            <select
              className="es-select-pill"
              value={usageRange}
              onChange={(e) => setUsageRange(e.target.value)}
              aria-label="Usage range"
            >
              <option>Last 1 Years</option>
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
            <button type="button" className="es-icon-kebab" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        <div className="es-panel-body" style={{ height: 220, position: 'relative' }}>
          {/* Connexio Style Popover Pin above June */}
          <div className="es-june-popover">
            <div className="es-popover-month">Juni</div>
            <div className="es-popover-usage">Usage: <strong>230 GB</strong></div>
            <div className="es-popover-comp">Compare to Last Year: <span className="is-positive">+12%</span></div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={USAGE_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF7" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #ECEAF5',
                  boxShadow: '0 4px 16px rgba(20,20,40,0.08)',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="usage"
                radius={[4, 4, 0, 0]}
                fill="#E8E6F5"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const isHighlight = payload.isHighlight;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={4}
                      fill={isHighlight ? '#1677F8' : '#ECE9F6'}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      {/* 2. Temperature & Vibration Monitoring (Connexio Smooth Curved Line Chart) */}
      <article className="es-chart-panel">
        <div className="es-panel-header">
          <div>
            <h3 className="es-panel-title">Temperature & Vibration Monitoring</h3>
          </div>
          <div className="es-panel-header-controls">
            <select
              className="es-select-pill"
              value={tempRange}
              onChange={(e) => setTempRange(e.target.value)}
              aria-label="Temperature range"
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Realtime (1h)</option>
            </select>
            <button type="button" className="es-icon-kebab" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        <div className="es-panel-body" style={{ height: 220, position: 'relative' }}>
          {/* Popover Pin over peak */}
          <div className="es-temp-popover">
            <span>Celsius</span>
            <strong>26°C • 0.018g</strong>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TEMP_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF7" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
              <YAxis domain={[18, 32]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #ECEAF5',
                  fontSize: '12px',
                }}
              />
              <Line
                type="natural"
                dataKey="temp"
                stroke="#1677F8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#1677F8', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      {/* 3. Energy Consumption & Latency (Connexio Dual-Line Chart) */}
      <article className="es-chart-panel">
        <div className="es-panel-header">
          <div>
            <h3 className="es-panel-title">Energy Consumption & Inference Latency</h3>
          </div>
          <div className="es-panel-header-controls">
            <select
              className="es-select-pill"
              value={energyRange}
              onChange={(e) => setEnergyRange(e.target.value)}
              aria-label="Energy range"
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
            <button type="button" className="es-icon-kebab" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        <div className="es-panel-body" style={{ height: 200, position: 'relative' }}>
          {/* Popover Legend on right */}
          <div className="es-energy-popover">
            <div className="es-pop-date">Jun, 2026</div>
            <div className="es-pop-row"><span className="es-dot-blue" /> 75 kWh • 9.4 ms <span className="is-pos">↑ 12</span></div>
            <div className="es-pop-row"><span className="es-dot-dark" /> 32 kWh • 4.2 ms <span className="is-pos">↓ 12</span></div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ENERGY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF7" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
              <YAxis domain={[0, 110]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
              <Tooltip />
              <Line type="monotone" dataKey="primary" stroke="#1677F8" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="secondary" stroke="#17171C" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      {/* 4. Device Distribution (Connexio 4-Cluster Vertical Bars) */}
      <article className="es-chart-panel">
        <div className="es-panel-header">
          <div>
            <h3 className="es-panel-title">Device Distribution</h3>
          </div>
          <button type="button" className="es-icon-kebab" aria-label="More options">
            <MoreVertical size={15} />
          </button>
        </div>

        <div className="es-panel-body es-dist-body">
          <div className="es-dist-total">
            <span className="es-dist-num">250</span>
            <span className="es-dist-lbl">Total Devices</span>
          </div>

          <div className="es-dist-columns">
            {/* Cluster 1: Sensors */}
            <div className="es-dist-col">
              <span className="es-dist-col-title">Sensors</span>
              <strong className="es-dist-col-count">120</strong>
              <div className="es-dist-pill-rack">
                {[10, 8, 9, 10, 7, 8, 9, 10].map((h, i) => (
                  <div key={i} className="es-dist-pill is-blue" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="es-dist-col-pct">60%</span>
            </div>

            {/* Cluster 2: Actuators */}
            <div className="es-dist-col">
              <span className="es-dist-col-title">Actuators</span>
              <strong className="es-dist-col-count">80</strong>
              <div className="es-dist-pill-rack">
                {[7, 6, 8, 7, 6, 8, 7, 6].map((h, i) => (
                  <div key={i} className="es-dist-pill is-cyan" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="es-dist-col-pct">40%</span>
            </div>

            {/* Cluster 3: Temperature */}
            <div className="es-dist-col">
              <span className="es-dist-col-title">Temperature</span>
              <strong className="es-dist-col-count">25</strong>
              <div className="es-dist-pill-rack">
                {[4, 5, 4, 5, 4, 5, 4, 5].map((h, i) => (
                  <div key={i} className="es-dist-pill is-light-blue" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="es-dist-col-pct">25%</span>
            </div>

            {/* Cluster 4: Controllers */}
            <div className="es-dist-col">
              <span className="es-dist-col-title">Controllers</span>
              <strong className="es-dist-col-count">25</strong>
              <div className="es-dist-pill-rack">
                {[4, 5, 4, 5, 4, 5, 4, 5].map((h, i) => (
                  <div key={i} className="es-dist-pill is-light-blue" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="es-dist-col-pct">25%</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

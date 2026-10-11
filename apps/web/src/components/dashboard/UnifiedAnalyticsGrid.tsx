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
import { useSimulator } from '@/context/SimulatorContext';

export function UnifiedAnalyticsGrid() {
  const { history, nodes, pipeline, isFreshInstall } = useSimulator();
  const [usageRange, setUsageRange] = useState('Realtime (Live)');
  const [tempRange, setTempRange] = useState('Realtime (Live)');
  const [energyRange, setEnergyRange] = useState('Realtime (Live)');

  // 1. Devices Usage Analytics: use live telemetry history if available
  // Map history to 6-12 points or fallback to default smoothly
  const liveUsageData = history.length > 0
    ? history.slice(-12).map((pt, idx, arr) => ({
        month: pt.timeLabel.slice(3, 8), // "02:30"
        usage: Math.round(pt.dataUsageMb % 300 + 100),
        isHighlight: idx === arr.length - 1,
      }))
    : [
        { month: 'T-5', usage: 140, isHighlight: false },
        { month: 'T-4', usage: 165, isHighlight: false },
        { month: 'T-3', usage: 180, isHighlight: false },
        { month: 'T-2', usage: 155, isHighlight: false },
        { month: 'T-1', usage: 195, isHighlight: false },
        { month: 'Now', usage: 230, isHighlight: true },
      ];

  // 2. Temperature & Vibration Monitoring: live gateway thermal temperature
  const liveTempData = history.length > 0
    ? history.slice(-8).map((pt) => ({
        time: pt.timeLabel.slice(3, 8),
        temp: pt.gatewayTemp,
        vib: pt.node3RmsG,
      }))
    : [
        { time: '04.00', temp: 42.8, vib: 0.018 },
        { time: '08.00', temp: 43.5, vib: 0.019 },
        { time: '12.00', temp: 44.1, vib: 0.018 },
        { time: '16.00', temp: 43.8, vib: 0.018 },
        { time: '20.00', temp: 44.2, vib: 0.020 },
        { time: '23.00', temp: 43.9, vib: 0.019 },
      ];

  // 3. Ingestion Rate & Latency: live msg/s and inference latency
  const liveEnergyData = history.length > 0
    ? history.slice(-8).map((pt) => ({
        time: pt.timeLabel.slice(3, 8),
        primary: +(pt.ingestionRate * 30).toFixed(1), // Scaled packet flux
        secondary: +(pt.latencyMs * 5).toFixed(1), // Scaled ms latency
      }))
    : [
        { time: '12.00', primary: 68, secondary: 34 },
        { time: '14.00', primary: 75, secondary: 38 },
        { time: '16.00', primary: 72, secondary: 36 },
        { time: '18.00', primary: 75, secondary: 42 },
        { time: '20.00', primary: 68, secondary: 35 },
        { time: '23.00', primary: 74, secondary: 36 },
      ];

  // 4. Device Distribution: Truthful grounded fleet distribution based on actual nodes!
  const totalDeviceCount = isFreshInstall ? 0 : nodes.length;
  // Calculate category count from actual fleet:
  // Node 1 (Nano BLE) = Gesture/IMU, Node 2 (MAX9814) = Acoustic, Node 3 (ADXL345) = Vibration,
  // Node 4 (PIR/Dist) = Motion/Proximity, Node 5 (MQ135) = Environmental
  const sensorNodes = nodes.filter((n) => n.id.includes('adxl345') || n.id.includes('max9814') || n.id.includes('nano33')).length;
  const presenceNodes = nodes.filter((n) => n.id.includes('pir') || n.id.includes('dist')).length;
  const envNodes = nodes.filter((n) => n.id.includes('env') || n.id.includes('bme')).length;
  const customNodes = nodes.filter((n) => !n.id.startsWith('node-')).length;

  const sensorPct = totalDeviceCount > 0 ? Math.round((sensorNodes / totalDeviceCount) * 100) : 0;
  const motionPct = totalDeviceCount > 0 ? Math.round((presenceNodes / totalDeviceCount) * 100) : 0;
  const envPct = totalDeviceCount > 0 ? Math.round((envNodes / totalDeviceCount) * 100) : 0;
  const customPct = totalDeviceCount > 0 ? Math.round((customNodes / totalDeviceCount) * 100) : 0;

  const latestPoint = history[history.length - 1];

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
              <option>Realtime (Live)</option>
              <option>Last 6 Hours</option>
              <option>Last 24 Hours</option>
            </select>
            <button type="button" className="es-icon-kebab" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        <div className="es-panel-body" style={{ height: 220, position: 'relative' }}>
          {/* Popover Pin above current peak */}
          <div className="es-june-popover">
            <div className="es-popover-month">Live Stream</div>
            <div className="es-popover-usage">
              Usage: <strong>{latestPoint ? `${latestPoint.dataUsageMb} MB` : '1.2 GB'}</strong>
            </div>
            <div className="es-popover-comp">
              Rate: <span className="is-positive">{pipeline.ingestionRatePerSec.toFixed(1)} msg/s</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={liveUsageData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
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
            <h3 className="es-panel-title">Gateway Thermals & Vibration Stream</h3>
          </div>
          <div className="es-panel-header-controls">
            <select
              className="es-select-pill"
              value={tempRange}
              onChange={(e) => setTempRange(e.target.value)}
              aria-label="Temperature range"
            >
              <option>Realtime (Live)</option>
              <option>Last 6 Hours</option>
              <option>Last 24 Hours</option>
            </select>
            <button type="button" className="es-icon-kebab" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        <div className="es-panel-body" style={{ height: 220, position: 'relative' }}>
          {/* Popover Pin over peak */}
          <div className="es-temp-popover">
            <span>Gateway / ADXL345</span>
            <strong>
              {latestPoint ? `${latestPoint.gatewayTemp}°C • ${latestPoint.node3RmsG}g` : '43.8°C • 0.018g'}
            </strong>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liveTempData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF7" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
              <YAxis domain={[38, 50]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
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
            <h3 className="es-panel-title">Packet Flux & Inference Latency</h3>
          </div>
          <div className="es-panel-header-controls">
            <select
              className="es-select-pill"
              value={energyRange}
              onChange={(e) => setEnergyRange(e.target.value)}
              aria-label="Energy range"
            >
              <option>Realtime (Live)</option>
              <option>Last 6 Hours</option>
              <option>Last 24 Hours</option>
            </select>
            <button type="button" className="es-icon-kebab" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        <div className="es-panel-body" style={{ height: 200, position: 'relative' }}>
          {/* Popover Legend on right */}
          <div className="es-energy-popover">
            <div className="es-pop-date">Simulated Telemetry Bus</div>
            <div className="es-pop-row">
              <span className="es-dot-blue" />
              {latestPoint ? `${latestPoint.ingestionRate} msg/s` : '2.4 msg/s'}
              <span className="is-pos">Nominal</span>
            </div>
            <div className="es-pop-row">
              <span className="es-dot-dark" />
              {latestPoint ? `${latestPoint.latencyMs} ms` : '9.4 ms'}
              <span className="is-pos">INT8</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liveEnergyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

      {/* 4. Device Distribution: Grounded Fleet Distribution */}
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
            <span className="es-dist-num">{totalDeviceCount}</span>
            <span className="es-dist-lbl">Fleet Nodes</span>
          </div>

          <div className="es-dist-columns">
            {/* Cluster 1: TinyML Sensors (IMU, Acoustic, Vibration) */}
            <div className="es-dist-col">
              <span className="es-dist-col-title">ML Sensors</span>
              <strong className="es-dist-col-count">{sensorNodes}</strong>
              <div className="es-dist-pill-rack">
                {[10, 8, 9, 10, 7, 8, 9, 10].map((h, i) => (
                  <div key={i} className="es-dist-pill is-blue" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="es-dist-col-pct">{sensorPct}%</span>
            </div>

            {/* Cluster 2: Presence / PIR / Distance */}
            <div className="es-dist-col">
              <span className="es-dist-col-title">Motion/PIR</span>
              <strong className="es-dist-col-count">{presenceNodes}</strong>
              <div className="es-dist-pill-rack">
                {[7, 6, 8, 7, 6, 8, 7, 6].map((h, i) => (
                  <div key={i} className="es-dist-pill is-cyan" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="es-dist-col-pct">{motionPct}%</span>
            </div>

            {/* Cluster 3: Environmental / Gas */}
            <div className="es-dist-col">
              <span className="es-dist-col-title">Environment</span>
              <strong className="es-dist-col-count">{envNodes}</strong>
              <div className="es-dist-pill-rack">
                {[5, 6, 5, 6, 5, 6, 5, 6].map((h, i) => (
                  <div key={i} className="es-dist-pill is-light-blue" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="es-dist-col-pct">{envPct}%</span>
            </div>

            {/* Cluster 4: Custom Registered Nodes */}
            <div className="es-dist-col">
              <span className="es-dist-col-title">Registered</span>
              <strong className="es-dist-col-count">{customNodes}</strong>
              <div className="es-dist-pill-rack">
                {[4, 5, 4, 5, 4, 5, 4, 5].map((h, i) => (
                  <div key={i} className="es-dist-pill is-light-blue" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <span className="es-dist-col-pct">{customPct}%</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

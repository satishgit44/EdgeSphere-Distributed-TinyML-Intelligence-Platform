import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type RangeOption = '1h' | '24h' | '7d';

const SAMPLE_DATA_1H = [
  { time: '15:00', msgs: 18, latency: 8.2 },
  { time: '15:10', msgs: 22, latency: 8.5 },
  { time: '15:20', msgs: 25, latency: 9.1 },
  { time: '15:30', msgs: 24, latency: 8.4 },
  { time: '15:40', msgs: 28, latency: 10.2 },
  { time: '15:50', msgs: 26, latency: 8.9 },
  { time: '16:00', msgs: 31, latency: 9.4 },
];

const SAMPLE_DATA_24H = [
  { time: '00:00', msgs: 12, latency: 7.9 },
  { time: '04:00', msgs: 14, latency: 8.0 },
  { time: '08:00', msgs: 28, latency: 9.5 },
  { time: '12:00', msgs: 34, latency: 11.2 },
  { time: '16:00', msgs: 30, latency: 8.8 },
  { time: '20:00', msgs: 22, latency: 8.2 },
];

const SAMPLE_DATA_7D = [
  { time: 'Mon', msgs: 210, latency: 8.4 },
  { time: 'Tue', msgs: 235, latency: 8.6 },
  { time: 'Wed', msgs: 242, latency: 8.8 },
  { time: 'Thu', msgs: 260, latency: 9.2 },
  { time: 'Fri', msgs: 280, latency: 9.0 },
  { time: 'Sat', msgs: 190, latency: 8.1 },
  { time: 'Sun', msgs: 185, latency: 8.0 },
];

export function FleetTrendsCard() {
  const [range, setRange] = useState<RangeOption>('1h');

  const chartData =
    range === '1h'
      ? SAMPLE_DATA_1H
      : range === '24h'
      ? SAMPLE_DATA_24H
      : SAMPLE_DATA_7D;

  return (
    <article className="es-nexus-card es-nexus-trends-card">
      <div className="es-nexus-card-header">
        <div>
          <h3 className="es-nexus-card-title">Fleet & telemetry trends</h3>
          <p className="es-nexus-card-subtitle">
            Sensor message ingestion & TinyML inference latency
          </p>
        </div>

        {/* Time-range filter pills matching Nexus AI reference */}
        <div className="es-nexus-filter-pills" role="group" aria-label="Time range selector">
          <button
            type="button"
            className={`es-nexus-pill ${range === '1h' ? 'active' : ''}`}
            onClick={() => setRange('1h')}
          >
            Last 1 hr
          </button>
          <button
            type="button"
            className={`es-nexus-pill ${range === '24h' ? 'active' : ''}`}
            onClick={() => setRange('24h')}
          >
            24 hrs
          </button>
          <button
            type="button"
            className={`es-nexus-pill ${range === '7d' ? 'active' : ''}`}
            onClick={() => setRange('7d')}
          >
            7 days
          </button>
        </div>
      </div>

      <div className="es-nexus-card-body" style={{ height: 230, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7455F5" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#7455F5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EEFB" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#8F90A6' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#8F90A6' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #ECEAF5',
                boxShadow: '0 4px 16px rgba(45, 30, 95, 0.08)',
                fontSize: '12px',
                color: '#161528',
              }}
            />
            <Area
              type="monotone"
              dataKey="msgs"
              name="Messages / sec"
              stroke="#7455F5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorMsgs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

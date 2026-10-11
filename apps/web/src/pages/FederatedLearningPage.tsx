import { useState } from 'react';
import {
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useSimulator } from '@/context/SimulatorContext';

interface RoundResult {
  round: number;
  loss: number;
  valAccuracy: number;
  participatingCount: number;
  timestamp: string;
}

export function FederatedLearningPage() {
  const { nodes } = useSimulator();

  // Baseline nodes that can participate in FL
  const baselineNodes = nodes.filter((n) =>
    ['node-nano33-ble', 'node-esp32-max9814', 'node-esp32-adxl345'].includes(n.id)
  );

  const [selectedNodes, setSelectedNodes] = useState<string[]>([
    'node-nano33-ble',
    'node-esp32-max9814',
    'node-esp32-adxl345',
  ]);
  const [currentRound, setCurrentRound] = useState(3);
  const targetRounds = 5;
  const [isTraining, setIsTraining] = useState(false);
  const [globalVersion, setGlobalVersion] = useState('v1.2.0');
  const [roundHistory, setRoundHistory] = useState<RoundResult[]>([
    { round: 1, loss: 0.62, valAccuracy: 0.74, participatingCount: 3, timestamp: '14:20:10' },
    { round: 2, loss: 0.44, valAccuracy: 0.83, participatingCount: 3, timestamp: '14:21:40' },
    { round: 3, loss: 0.28, valAccuracy: 0.89, participatingCount: 3, timestamp: '14:23:15' },
  ]);

  // Per-node local training delta status
  const nodeUpdates = selectedNodes.map((id, index) => {
    const nodeObj = nodes.find((n) => n.id === id);
    const weightShiftPct = +(0.08 - currentRound * 0.01 + index * 0.005).toFixed(3);
    const sampleSize = 120 + index * 40;
    return {
      nodeId: id,
      name: nodeObj?.name || id,
      mcu: nodeObj?.targetMcu.split('(')[0].trim() || 'ESP32',
      weightShiftPct,
      sampleSize,
      status: isTraining ? 'Uploading Gradients' : 'Synced with Global Model',
    };
  });

  const toggleNodeSelection = (id: string) => {
    if (selectedNodes.includes(id)) {
      if (selectedNodes.length > 1) {
        setSelectedNodes((prev) => prev.filter((item) => item !== id));
      }
    } else {
      setSelectedNodes((prev) => [...prev, id]);
    }
  };

  const handleStartFederatedRound = () => {
    if (isTraining || selectedNodes.length === 0) return;
    setIsTraining(true);

    setTimeout(() => {
      const nextRoundNum = currentRound + 1;
      const prevAccuracy = roundHistory[roundHistory.length - 1]?.valAccuracy ?? 0.89;
      const prevLoss = roundHistory[roundHistory.length - 1]?.loss ?? 0.28;
      const nextAcc = +Math.min(0.97, prevAccuracy + 0.03).toFixed(2);
      const nextLoss = +Math.max(0.08, prevLoss - 0.05).toFixed(2);
      const nowTime = new Date().toTimeString().slice(0, 8);

      const newRound: RoundResult = {
        round: nextRoundNum,
        loss: nextLoss,
        valAccuracy: nextAcc,
        participatingCount: selectedNodes.length,
        timestamp: nowTime,
      };

      setRoundHistory((prev) => [...prev, newRound]);
      setCurrentRound(nextRoundNum);
      setGlobalVersion(`v1.${nextRoundNum}.0`);
      setIsTraining(false);
    }, 1500);
  };

  const handleResetTraining = () => {
    setIsTraining(false);
    setCurrentRound(1);
    setGlobalVersion('v1.0.0');
    setRoundHistory([
      { round: 1, loss: 0.65, valAccuracy: 0.72, participatingCount: selectedNodes.length, timestamp: new Date().toTimeString().slice(0, 8) },
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
            <span className="es-nexus-breadcrumb-current">Federated Learning</span>
          </div>
          <h1 className="es-nexus-title">Decentralized TinyML Federated Learning</h1>
          <p className="es-nexus-subtitle">
            Simulated on-device federated learning (FedAvg aggregation) across edge nodes with zero raw-telemetry leakage.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="es-nexus-action-button-primary"
            onClick={handleStartFederatedRound}
            disabled={isTraining}
          >
            <Play size={13} /> {isTraining ? 'Running FedAvg Round…' : 'Execute FedAvg Round'}
          </button>
          <button
            type="button"
            className="es-btn"
            onClick={handleResetTraining}
            disabled={isTraining}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Honest Prototype Disclosure */}
      <div className="es-simulation-disclosure-banner">
        <ShieldCheck size={16} color="#42DDE7" />
        <span>
          <strong>UI Federated Learning Prototype:</strong> Simulated FedAvg parameter aggregation. Sensor nodes retain private local sample sets while sending simulated weight deltas to the Raspberry Pi 5 Gateway aggregator.
        </span>
      </div>

      {/* Top Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <article className="es-nexus-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 700, textTransform: 'uppercase' }}>
            Global Model Version
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#17171C' }}>{globalVersion}</span>
            <span className="es-kpi-trend-pill is-blue">Round {currentRound} / {targetRounds}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#737487', marginTop: 4 }}>
            Aggregator: Raspberry Pi 5 Gateway
          </div>
        </article>

        <article className="es-nexus-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 700, textTransform: 'uppercase' }}>
            Simulated Validation Accuracy
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#16A36A' }}>
              {(roundHistory[roundHistory.length - 1]?.valAccuracy * 100).toFixed(0)}%
            </span>
            <span className="es-kpi-trend-pill is-positive">↑ FedAvg Gain</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#737487', marginTop: 4 }}>
            Evaluated on held-out synthetic test set
          </div>
        </article>

        <article className="es-nexus-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 700, textTransform: 'uppercase' }}>
            Convergence Loss
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#1677F8' }}>
              {roundHistory[roundHistory.length - 1]?.loss.toFixed(2)}
            </span>
            <span className="es-kpi-trend-pill is-blue">Cross-Entropy</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#737487', marginTop: 4 }}>
            Bounded gradient descent
          </div>
        </article>

        <article className="es-nexus-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 700, textTransform: 'uppercase' }}>
            Participating Edge Nodes
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#17171C' }}>
              {selectedNodes.length} / {baselineNodes.length}
            </span>
            <span className="es-kpi-trend-pill is-orange">Zero-Leakage</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#737487', marginTop: 4 }}>
            Local training on INT8 quantized buffers
          </div>
        </article>
      </div>

      {/* Main Grid: Participating Nodes Selection & Convergence Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.4fr)', gap: 20 }}>
        {/* Node Selection & Weight Deltas */}
        <article className="es-nexus-card">
          <div className="es-nexus-card-header">
            <div>
              <h3 className="es-nexus-card-title">Participating Edge Nodes</h3>
              <p className="es-nexus-card-subtitle">Select edge clients contributing local weight deltas</p>
            </div>
            <span className="es-nexus-mini-badge">FedAvg Clients</span>
          </div>

          <div className="es-nexus-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {baselineNodes.map((n) => {
                const isSelected = selectedNodes.includes(n.id);
                const info = nodeUpdates.find((u) => u.nodeId === n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => toggleNodeSelection(n.id)}
                    role="button"
                    tabIndex={0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #1677F8' : '1px solid #E9E9F0',
                      background: isSelected ? '#F0F6FF' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        aria-label={`Select ${n.name}`}
                        style={{ cursor: 'pointer' }}
                      />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#17171C' }}>{n.name}</strong>
                        <div style={{ fontSize: '11px', color: '#737487' }}>
                          {n.targetMcu.split('(')[0].trim()} • {info ? `${info.sampleSize} local samples` : '100 samples'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1677F8' }}>
                        Δw: {info ? `±${(info.weightShiftPct * 100).toFixed(1)}%` : '±0.0%'}
                      </span>
                      <div style={{ fontSize: '10.5px', color: isTraining ? '#B7791F' : '#16A36A' }}>
                        {isTraining ? 'Computing Δ' : 'Converged'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        {/* Convergence Visualization */}
        <article className="es-nexus-card">
          <div className="es-nexus-card-header">
            <div>
              <h3 className="es-nexus-card-title">Convergence & Accuracy Progression</h3>
              <p className="es-nexus-card-subtitle">FedAvg loss minimization over communication rounds</p>
            </div>
            <span className="es-nexus-mini-badge">Convergence Curve</span>
          </div>

          <div className="es-nexus-card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roundHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF7" />
                <XAxis dataKey="round" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
                <YAxis domain={[0, 1]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8F90A6' }} />
                <Tooltip />
                <Line type="monotone" dataKey="valAccuracy" name="Validation Accuracy" stroke="#16A36A" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="loss" name="Cross-Entropy Loss" stroke="#1677F8" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </div>
  );
}

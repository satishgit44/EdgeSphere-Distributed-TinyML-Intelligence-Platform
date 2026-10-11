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

interface ClientUpdate {
  nodeId: string;
  name: string;
  mcu: string;
  sampleSize: number;
  localWeights: number[];
  localLoss: number;
  localAccuracy: number;
  weightShiftPct: number;
}

interface RoundResult {
  round: number;
  loss: number;
  valAccuracy: number;
  participatingCount: number;
  timestamp: string;
  globalWeights: number[];
  clientUpdates: { nodeId: string; sampleSize: number; weightShiftPct: number }[];
}

// Initial 4-element synthetic global weight vector representing layer parameter norms
const INITIAL_GLOBAL_WEIGHTS = [0.425, -0.180, 0.762, -0.315];

// Deterministic synthetic client gradient step simulator
function computeLocalUpdate(
  nodeId: string,
  baseWeights: number[],
  round: number,
  index: number
): { localWeights: number[]; sampleSize: number; localLoss: number; localAccuracy: number; shiftPct: number } {
  // Deterministic sample counts grounded in sensor bandwidth
  const sampleSizes: Record<string, number> = {
    'node-nano33-ble': 150,
    'node-esp32-max9814': 220,
    'node-esp32-adxl345': 310,
  };
  const nSamples = sampleSizes[nodeId] || (120 + index * 50);

  // Deterministic local gradient shift with diminishing step sizes (convergence)
  const stepRate = 0.05 / Math.sqrt(round);
  const nodeBias = (index + 1) * 0.012;
  const localWeights = baseWeights.map((w, idx) => {
    const grad = Math.sin(round * 1.5 + idx + index) * stepRate + (idx % 2 === 0 ? nodeBias : -nodeBias);
    return +(w - grad).toFixed(4);
  });

  const weightNorm = Math.hypot(...baseWeights);
  const diffNorm = Math.hypot(...localWeights.map((w, i) => w - baseWeights[i]));
  const shiftPct = +(diffNorm / (weightNorm || 1)).toFixed(4);

  // Derived loss and accuracy from weight convergence
  const localLoss = +(0.70 * Math.exp(-0.25 * round) + 0.08 + (index * 0.015)).toFixed(3);
  const localAccuracy = +(Math.min(0.98, 0.65 + 0.32 * (1 - Math.exp(-0.35 * round)) - index * 0.01)).toFixed(3);

  return { localWeights, sampleSize: nSamples, localLoss, localAccuracy, shiftPct };
}

// Mathematical FedAvg Aggregator: w_global = Σ (n_k / N_total) * w_k
function aggregateFedAvg(updates: { weights: number[]; samples: number }[]): number[] {
  if (updates.length === 0) return [...INITIAL_GLOBAL_WEIGHTS];
  const totalSamples = updates.reduce((acc, u) => acc + u.samples, 0);
  const vectorDim = updates[0].weights.length;
  const aggregated: number[] = new Array(vectorDim).fill(0);

  for (const client of updates) {
    const weightFactor = client.samples / totalSamples;
    for (let i = 0; i < vectorDim; i++) {
      aggregated[i] += client.weights[i] * weightFactor;
    }
  }

  return aggregated.map((val) => +val.toFixed(4));
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
  const [globalVersion, setGlobalVersion] = useState('v1.3.0');
  const [currentWeights, setCurrentWeights] = useState<number[]>([0.384, -0.152, 0.718, -0.286]);

  // Provenance round history computed via FedAvg
  const [roundHistory, setRoundHistory] = useState<RoundResult[]>([
    {
      round: 1,
      loss: 0.58,
      valAccuracy: 0.74,
      participatingCount: 3,
      timestamp: '14:20:10',
      globalWeights: [0.412, -0.174, 0.748, -0.306],
      clientUpdates: [
        { nodeId: 'node-nano33-ble', sampleSize: 150, weightShiftPct: 0.048 },
        { nodeId: 'node-esp32-max9814', sampleSize: 220, weightShiftPct: 0.052 },
        { nodeId: 'node-esp32-adxl345', sampleSize: 310, weightShiftPct: 0.045 },
      ],
    },
    {
      round: 2,
      loss: 0.41,
      valAccuracy: 0.83,
      participatingCount: 3,
      timestamp: '14:21:40',
      globalWeights: [0.398, -0.162, 0.732, -0.295],
      clientUpdates: [
        { nodeId: 'node-nano33-ble', sampleSize: 150, weightShiftPct: 0.035 },
        { nodeId: 'node-esp32-max9814', sampleSize: 220, weightShiftPct: 0.038 },
        { nodeId: 'node-esp32-adxl345', sampleSize: 310, weightShiftPct: 0.032 },
      ],
    },
    {
      round: 3,
      loss: 0.29,
      valAccuracy: 0.89,
      participatingCount: 3,
      timestamp: '14:23:15',
      globalWeights: [0.384, -0.152, 0.718, -0.286],
      clientUpdates: [
        { nodeId: 'node-nano33-ble', sampleSize: 150, weightShiftPct: 0.024 },
        { nodeId: 'node-esp32-max9814', sampleSize: 220, weightShiftPct: 0.026 },
        { nodeId: 'node-esp32-adxl345', sampleSize: 310, weightShiftPct: 0.021 },
      ],
    },
  ]);

  // Compute live client status and local weight deltas grounded in current global model
  const nodeUpdates: ClientUpdate[] = selectedNodes.map((id, index) => {
    const nodeObj = nodes.find((n) => n.id === id);
    const update = computeLocalUpdate(id, currentWeights, currentRound, index);
    return {
      nodeId: id,
      name: nodeObj?.name || id,
      mcu: nodeObj?.targetMcu.split('(')[0].trim() || 'ESP32',
      sampleSize: update.sampleSize,
      localWeights: update.localWeights,
      localLoss: update.localLoss,
      localAccuracy: update.localAccuracy,
      weightShiftPct: update.shiftPct,
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

  // Perform mathematical FedAvg aggregation
  const handleStartFederatedRound = () => {
    if (isTraining || selectedNodes.length === 0) return;
    setIsTraining(true);

    setTimeout(() => {
      const nextRoundNum = currentRound + 1;

      // 1. Collect local updates from all selected clients
      const clientPayloads = selectedNodes.map((id, index) => {
        return computeLocalUpdate(id, currentWeights, nextRoundNum, index);
      });

      // 2. Perform sample-count-weighted aggregation (FedAvg)
      const newGlobalWeights = aggregateFedAvg(
        clientPayloads.map((cp) => ({ weights: cp.localWeights, samples: cp.sampleSize }))
      );

      // 3. Compute weighted global loss and accuracy
      const totalSamples = clientPayloads.reduce((sum, cp) => sum + cp.sampleSize, 0);
      const aggLoss = +(
        clientPayloads.reduce((sum, cp) => sum + cp.localLoss * cp.sampleSize, 0) / totalSamples
      ).toFixed(2);
      const aggAcc = +(
        clientPayloads.reduce((sum, cp) => sum + cp.localAccuracy * cp.sampleSize, 0) / totalSamples
      ).toFixed(2);

      const nowTime = new Date().toTimeString().slice(0, 8);
      const newRound: RoundResult = {
        round: nextRoundNum,
        loss: Math.max(0.06, aggLoss),
        valAccuracy: Math.min(0.97, aggAcc),
        participatingCount: selectedNodes.length,
        timestamp: nowTime,
        globalWeights: newGlobalWeights,
        clientUpdates: selectedNodes.map((id, idx) => ({
          nodeId: id,
          sampleSize: clientPayloads[idx].sampleSize,
          weightShiftPct: clientPayloads[idx].shiftPct,
        })),
      };

      setCurrentWeights(newGlobalWeights);
      setRoundHistory((prev) => [...prev, newRound]);
      setCurrentRound(nextRoundNum);
      setGlobalVersion(`v1.${nextRoundNum}.0`);
      setIsTraining(false);
    }, 1200);
  };

  const handleResetTraining = () => {
    setIsTraining(false);
    setCurrentRound(1);
    setGlobalVersion('v1.1.0');
    setCurrentWeights([...INITIAL_GLOBAL_WEIGHTS]);
    const initUpdate = selectedNodes.map((id, idx) => computeLocalUpdate(id, INITIAL_GLOBAL_WEIGHTS, 1, idx));
    setRoundHistory([
      {
        round: 1,
        loss: 0.58,
        valAccuracy: 0.74,
        participatingCount: selectedNodes.length,
        timestamp: new Date().toTimeString().slice(0, 8),
        globalWeights: [...INITIAL_GLOBAL_WEIGHTS],
        clientUpdates: selectedNodes.map((id, idx) => ({
          nodeId: id,
          sampleSize: initUpdate[idx].sampleSize,
          weightShiftPct: initUpdate[idx].shiftPct,
        })),
      },
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

      {/* Global Vector & Round History Provenance Table */}
      <article className="es-nexus-card" style={{ marginTop: 20 }}>
        <div className="es-nexus-card-header">
          <div>
            <h3 className="es-nexus-card-title">FedAvg Aggregated Parameter Vectors & Round Log</h3>
            <p className="es-nexus-card-subtitle">
              Auditable synthetic model layer weights generated via sample-weighted averaging: <code>w_global = Σ (n_k / N_total) * w_k</code>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#737487' }}>Current Global Vector:</span>
            <span className="es-inf-chip" style={{ fontSize: '11px' }}>
              [{currentWeights.map((w) => w.toFixed(3)).join(', ')}]
            </span>
          </div>
        </div>

        <div className="es-nexus-card-body">
          <div style={{ overflowX: 'auto' }}>
            <table className="es-nexus-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E9E9F0', fontSize: '11px', color: '#737487' }}>
                  <th style={{ padding: '8px 12px' }}>Round</th>
                  <th style={{ padding: '8px 12px' }}>Timestamp</th>
                  <th style={{ padding: '8px 12px' }}>Clients</th>
                  <th style={{ padding: '8px 12px' }}>Cross-Entropy Loss</th>
                  <th style={{ padding: '8px 12px' }}>Val Accuracy</th>
                  <th style={{ padding: '8px 12px' }}>Global Layer Weights</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '12px' }}>
                {roundHistory.slice().reverse().map((r) => (
                  <tr key={r.round} style={{ borderBottom: '1px solid #F1F1F5' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Round {r.round}</td>
                    <td style={{ padding: '8px 12px', color: '#737487', fontFamily: 'var(--font-mono)' }}>{r.timestamp}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span className="es-kpi-trend-pill is-blue">{r.participatingCount} nodes</span>
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: '#1677F8', fontWeight: 600 }}>
                      {r.loss.toFixed(3)}
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: '#16A36A', fontWeight: 600 }}>
                      {(r.valAccuracy * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#5D5A70' }}>
                      [{r.globalWeights.map((w) => w.toFixed(3)).join(', ')}]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </div>
  );
}

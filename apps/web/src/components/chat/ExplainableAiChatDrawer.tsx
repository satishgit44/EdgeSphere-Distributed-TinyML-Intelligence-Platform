import { useState, useCallback } from 'react';
import {
  Sparkles,
  X,
  Send,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import type { ChatMessage } from '@/types';

interface ExplainableAiChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const STARTER_PROMPTS = [
  "Summarize today's fleet health.",
  "Why is Node 3 showing elevated vibration?",
  "What changed compared with yesterday?",
  "Which devices missed heartbeats?",
  "Explain this alert in plain language.",
  "What evidence supports this recommendation?",
  "Show telemetry gaps in the selected period.",
  "Which deployments failed, and why?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    timestamp: '16:30',
    content:
      "Hello! I am your EdgeSphere Explainable AI assistant. I analyze local telemetry streams, TFLite Micro INT8 model inferences, and edge gateway logs on your Raspberry Pi 5. All data stays local to your edge infrastructure.",
    suggestedActions: [
      "Summarize today's fleet health",
      "Explain Node 3 motor vibration status",
    ],
  },
];

export function ExplainableAiChatDrawer({ isOpen, onClose, initialPrompt }: ExplainableAiChatProps) {
  const { nodes, gateway, pipeline, incidents } = useSimulator();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialPrompt) {
      return [
        ...INITIAL_MESSAGES,
        {
          id: 'msg-user-init',
          sender: 'user',
          timestamp: '16:30',
          content: initialPrompt,
        },
      ];
    }
    return INITIAL_MESSAGES;
  });
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const faultNode = nodes.find((n) => n.integrationState === 'fault');

  const handleSendPrompt = useCallback((promptText: string) => {
    if (!promptText.trim()) return;

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: ts,
      content: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      let aiContent = '';
      let evidenceLinks: Array<{ title: string; target: string; value?: string }> = [];
      let caveats = 'Sourced strictly from local Raspberry Pi 5 ring buffer and TFLite Micro INT8 inference state.';
      let uncertainty = 'High confidence (grounded in direct sensor measurements)';

      if (promptText.toLowerCase().includes('vibration') || promptText.toLowerCase().includes('node 3')) {
        if (faultNode) {
          aiContent =
            'Node 3 (ESP32 + ADXL345) has triggered an anomaly warning. Peak vibration reached 0.284g RMS (baseline is 0.018g RMS). High-frequency spectral power at 120Hz indicates potential bearing inner raceway degradation or shaft misalignment.';
          evidenceLinks = [
            { title: 'ADXL345 Telemetry Stream', target: '/telemetry', value: '0.284g RMS' },
            { title: 'Fault Incident #INC-ADXL-01', target: '/alerts', value: 'Requires Attention' },
            { title: 'TFLite Vibration Model', target: '/models', value: 'anomaly-adxl-v0.3.tflite' },
          ];
          uncertainty = 'Model Anomaly Score: 0.88 / 1.00 (Threshold: 0.65)';
        } else {
          aiContent =
            'Node 3 (ESP32 + ADXL345) is currently operating within nominal parameters. RMS vibration is 0.018g with harmonic spectral density across 10Hz-1kHz matching baseline recordings.';
          evidenceLinks = [
            { title: 'ADXL345 Telemetry Stream', target: '/telemetry', value: '0.018g RMS' },
            { title: 'Node 3 Device Inspector', target: '/devices', value: 'Status: Online' },
          ];
        }
      } else if (promptText.toLowerCase().includes('fleet') || promptText.toLowerCase().includes('health') || promptText.toLowerCase().includes('summarize')) {
        aiContent = `The EdgeSphere fleet currently has ${nodes.length} registered embedded nodes. The Raspberry Pi 5 Gateway is reporting ${gateway.thermalTempC.toFixed(1)}°C operating temperature and ${gateway.cpuLoadPct.toFixed(1)}% CPU load across Mosquitto MQTT and edgesphere-ingestd. Ingestion rate is stable at ${pipeline.ingestionRatePerSec.toFixed(1)} msg/s with 0 packet drops.`;
        evidenceLinks = [
          { title: 'Gateway Diagnostics', target: '/integrations', value: 'Raspberry Pi 5' },
          { title: 'Active Ingest Pipeline', target: '/telemetry', value: `${pipeline.messagesReceivedTotal} msgs` },
        ];
      } else if (promptText.toLowerCase().includes('heartbeat') || promptText.toLowerCase().includes('missed')) {
        aiContent = faultNode
          ? `Node 3 (${faultNode.name}) missed 1 heartbeat window during high vibration saturation, but has recovered MQTT ping acknowledgment.`
          : 'All 5 embedded nodes are acknowledging heartbeat pings within the configured 15-second polling interval.';
        evidenceLinks = [
          { title: 'Heartbeat Monitor Daemon', target: '/integrations', value: 'Interval: 15s' },
        ];
      } else {
        aiContent = `Based on the latest edge telemetry and audited event logs, the 5 sensor nodes and Raspberry Pi 5 gateway are actively communicating over Eclipse Mosquitto MQTT. There are currently ${incidents.filter((i) => i.status !== 'resolved').length} open alerts in the incident log.`;
        evidenceLinks = [
          { title: 'Fleet Incident Log', target: '/alerts', value: 'Review alerts' },
          { title: 'Daily Fleet Summary', target: '/dashboard', value: 'Review summary' },
        ];
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: aiContent,
        evidenceLinks,
        uncertainty,
        caveats,
        suggestedActions: [
          'Inspect Node 3 vibration FFT spectrum',
          'Download edge diagnostics bundle',
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 600);
  }, [faultNode, nodes, gateway, pipeline, incidents]);

  if (!isOpen) return null;

  return (
    <aside className="es-chat-drawer" aria-label="Explainable AI Assistant">
      <div className="es-chat-header">
        <div className="es-chat-header-title-wrap">
          <div className="es-chat-ai-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="es-chat-title">EdgeSphere Explainable AI</h3>
            <span className="es-chat-status-pill">
              <span className="es-chat-status-dot" /> Local Edge Grounding
            </span>
          </div>
        </div>

        <button
          type="button"
          className="es-chat-close-btn"
          onClick={onClose}
          aria-label="Close Explainable AI chat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Context Chips matching specification */}
      <div className="es-chat-context-chips">
        <span className="es-chat-context-chip">Workspace: Default Local</span>
        <span className="es-chat-context-chip">Target: Node 3 (ADXL345)</span>
        <span className="es-chat-context-chip">Date: Today</span>
        <span className="es-chat-context-chip">Mode: Local TFLite</span>
      </div>

      {/* Message Stream */}
      <div className="es-chat-stream">
        {messages.map((m) => (
          <div key={m.id} className={`es-chat-msg is-${m.sender}`}>
            <div className="es-chat-msg-top">
              <span className="es-chat-msg-sender">
                {m.sender === 'user' ? 'Operator' : 'EdgeSphere AI'}
              </span>
              <span className="es-chat-msg-time">{m.timestamp}</span>
            </div>

            <div className="es-chat-msg-content">{m.content}</div>

            {/* Evidence Links */}
            {m.evidenceLinks && m.evidenceLinks.length > 0 && (
              <div className="es-chat-evidence-block">
                <span className="es-chat-evidence-title">Verified In-App Evidence:</span>
                <div className="es-chat-evidence-links">
                  {m.evidenceLinks.map((ev, i) => (
                    <a
                      key={i}
                      href={ev.target}
                      className="es-chat-evidence-link"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Navigating to verified edge record: ${ev.title} (${ev.value})`);
                      }}
                    >
                      <ExternalLink size={11} />
                      <span>{ev.title}</span>
                      {ev.value && <strong className="es-chat-ev-val">{ev.value}</strong>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence & Uncertainty */}
            {m.uncertainty && (
              <div className="es-chat-uncertainty">
                <Info size={11} />
                <span>{m.uncertainty}</span>
              </div>
            )}

            {/* Caveats */}
            {m.caveats && (
              <div className="es-chat-caveats">
                <ShieldAlert size={11} />
                <span>{m.caveats}</span>
              </div>
            )}

            {/* Suggested Next Actions */}
            {m.suggestedActions && (
              <div className="es-chat-suggested-actions">
                {m.suggestedActions.map((act, i) => (
                  <button
                    key={i}
                    type="button"
                    className="es-chat-action-pill"
                    onClick={() => handleSendPrompt(act)}
                  >
                    {act}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="es-chat-thinking">
            <RefreshCw size={14} className="spin" />
            <span>Consulting local edge models & telemetry records…</span>
          </div>
        )}
      </div>

      {/* Starter Prompts */}
      <div className="es-chat-starters">
        <span className="es-chat-starters-label">Ask about today&apos;s edge events:</span>
        <div className="es-chat-starters-scroll">
          {STARTER_PROMPTS.slice(0, 4).map((p, i) => (
            <button
              key={i}
              type="button"
              className="es-chat-starter-btn"
              onClick={() => handleSendPrompt(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        className="es-chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(input);
        }}
      >
        <input
          type="text"
          className="es-chat-input"
          placeholder="Ask AI to explain telemetry, alerts, or models…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="es-chat-send-btn"
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      </form>
    </aside>
  );
}

export function FloatingAiChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="es-floating-ai-btn"
      onClick={onClick}
      title="Open EdgeSphere Explainable AI Assistant"
      aria-label="Open Explainable AI chat"
    >
      <div className="es-floating-ai-pulse" />
      <Sparkles size={18} />
      <span className="es-floating-ai-label">Ask AI</span>
    </button>
  );
}

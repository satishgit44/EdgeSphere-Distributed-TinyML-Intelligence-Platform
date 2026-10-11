import { useState, useEffect, useRef } from 'react';
import { X, Plus, AlertCircle, Cpu, CheckCircle } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import type { PlannedNode, NodeIntegrationState } from '@/types';

interface RegisterDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (registeredNode: PlannedNode) => void;
}

const MCU_OPTIONS = [
  'Espressif ESP32-WROOM-32D (Dual Xtensa LX6 @ 240MHz)',
  'Espressif ESP32-S3 (Dual Xtensa LX7 with Vector AI)',
  'Nordic nRF52840 (ARM Cortex-M4F @ 64MHz)',
  'Raspberry Pi Pico W (RP2040 Dual ARM Cortex-M0+)',
  'STMicroelectronics STM32F401 (ARM Cortex-M4 @ 84MHz)',
];

const SENSOR_TYPE_OPTIONS = [
  { label: 'Vibration & Accelerometer (ADXL345 / I2C / SPI)', role: 'Motor Vibration FFT Analysis', icon: 'vibration' },
  { label: 'Acoustic Classifier (I2S Microphone)', role: 'Acoustic Sound & Noise Classifier', icon: 'mic' },
  { label: 'Environmental & Gas (BME280 / BME680 / MQ135)', role: 'Environmental Quality & Gas Monitoring', icon: 'air' },
  { label: 'Motion & Presence (PIR / Ultrasonic / ToF)', role: 'Perimeter Presence & Distance Detection', icon: 'motion' },
  { label: 'Current & Power Consumption (INA219)', role: 'Electrical Power Draw & Current Profiler', icon: 'cpu' },
  { label: 'Thermal IR Array (MLX90640)', role: 'Surface Thermography & Hotspot Detection', icon: 'fan' },
];

export function RegisterDeviceModal({ isOpen, onClose, onSuccess }: RegisterDeviceModalProps) {
  const { nodes, registerNode } = useSimulator();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [targetMcu, setTargetMcu] = useState(MCU_OPTIONS[0]);
  const [sensorTypeIndex, setSensorTypeIndex] = useState(0);
  const [location, setLocation] = useState('');
  const [initialStatus, setInitialStatus] = useState<NodeIntegrationState>('awaiting_integration');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const initialInputRef = useRef<HTMLInputElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Auto-focus first input
    const timer = setTimeout(() => {
      initialInputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedId = id.trim();
    const trimmedName = name.trim();

    if (!trimmedId) {
      newErrors.id = 'Unique Device ID is required.';
    } else if (!/^[a-z0-9-_]+$/i.test(trimmedId)) {
      newErrors.id = 'Device ID must contain only letters, numbers, hyphens, or underscores.';
    } else if (nodes.some((n) => n.id.toLowerCase() === trimmedId.toLowerCase())) {
      newErrors.id = `Device ID "${trimmedId}" is already taken by an existing fleet node.`;
    }

    if (!trimmedName) {
      newErrors.name = 'Device name is required.';
    } else if (trimmedName.length < 3) {
      newErrors.name = 'Device name must be at least 3 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedSensor = SENSOR_TYPE_OPTIONS[sensorTypeIndex];
    const trimmedId = id.trim();
    const trimmedName = name.trim();

    const newNode: PlannedNode = {
      id: trimmedId,
      name: trimmedName,
      targetMcu,
      onboardSensors: [selectedSensor.label],
      role: selectedSensor.role,
      intendedTinyML: `Edge inference pipeline for ${selectedSensor.role}`,
      commsBus: 'WiFi MQTT (802.11 b/g/n @ 2.4GHz)',
      pinout: [],
      integrationState: initialStatus,
      mqttTopic: `edgesphere/nodes/${trimmedId}/telemetry`,
      lastSeenTimestamp: null,
      activeModelId: null,
      recentSignals: null,
      rawPayloadSnippet: null,
      packetCount: 0,
    };

    const res = registerNode(newNode, {
      location: location.trim() || 'Unassigned Line',
      isOn: false,
      icon: selectedSensor.icon as 'fan' | 'cpu' | 'mic' | 'vibration' | 'motion' | 'air',
    });

    if (!res.success) {
      setErrors({ form: res.error || 'Registration failed.' });
      return;
    }

    setSubmitSuccess(true);
    if (onSuccess) onSuccess(newNode);

    setTimeout(() => {
      onClose();
      // Reset form
      setId('');
      setName('');
      setLocation('');
      setInitialStatus('awaiting_integration');
      setSubmitSuccess(false);
    }, 700);
  };

  return (
    <div className="es-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="es-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '540px',
          width: '90%',
          boxShadow: '0 20px 45px rgba(23, 23, 28, 0.16)',
          border: '1px solid #ECEAF5',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F0EDF7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EDE9FE',
                color: '#7955E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <h2 id="register-dialog-title" style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#17171C' }}>
                Register Edge IoT Node
              </h2>
              <span style={{ fontSize: '12px', color: '#8F90A6' }}>
                Expand fleet registry beyond initial 5-node baseline
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#8F90A6',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errors.form && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errors.form}</span>
            </div>
          )}

          {submitSuccess && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                color: '#16A34A',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <CheckCircle size={16} />
              <span>Node registered successfully! Updating fleet state…</span>
            </div>
          )}

          {/* Device Name */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="reg-device-name"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#2E2F3E', marginBottom: '6px' }}
            >
              Device Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              id="reg-device-name"
              ref={initialInputRef}
              type="text"
              placeholder="e.g. Node 6: Line 2 Spindle Bearing"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.name ? '#EF4444' : '#E2E0EC'}`,
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {errors.name && (
              <span style={{ fontSize: '11.5px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                {errors.name}
              </span>
            )}
          </div>

          {/* Unique Device ID */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="reg-device-id"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#2E2F3E', marginBottom: '6px' }}
            >
              Unique Device ID <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              id="reg-device-id"
              type="text"
              placeholder="e.g. node-esp32-vibe-02"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                if (errors.id) setErrors((prev) => ({ ...prev, id: '' }));
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.id ? '#EF4444' : '#E2E0EC'}`,
                fontSize: '13.5px',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {errors.id && (
              <span style={{ fontSize: '11.5px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                {errors.id}
              </span>
            )}
          </div>

          {/* Sensor / Node Type */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="reg-sensor-type"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#2E2F3E', marginBottom: '6px' }}
            >
              Sensor / Workload Classification <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              id="reg-sensor-type"
              value={sensorTypeIndex}
              onChange={(e) => setSensorTypeIndex(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E0EC',
                fontSize: '13.5px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              {SENSOR_TYPE_OPTIONS.map((opt, i) => (
                <option key={i} value={i}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Microcontroller MCU */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="reg-target-mcu"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#2E2F3E', marginBottom: '6px' }}
            >
              Target Microcontroller (MCU)
            </label>
            <select
              id="reg-target-mcu"
              value={targetMcu}
              onChange={(e) => setTargetMcu(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E0EC',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              {MCU_OPTIONS.map((mcu, i) => (
                <option key={i} value={mcu}>
                  {mcu}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Location */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="reg-location"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#2E2F3E', marginBottom: '6px' }}
            >
              Physical Location (Optional)
            </label>
            <input
              id="reg-location"
              type="text"
              placeholder="e.g. Test Cell 02 / Conveyor Line 3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E0EC',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Initial Status (Clearly marked simulated or unintegrated) */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="reg-initial-status"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#2E2F3E', marginBottom: '6px' }}
            >
              Initial Device Status <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              id="reg-initial-status"
              value={initialStatus}
              onChange={(e) => setInitialStatus(e.target.value as NodeIntegrationState)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E0EC',
                fontSize: '13.5px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="awaiting_integration">Awaiting Hardware Pairing (Unconnected)</option>
              <option value="simulated">Simulated Virtual Node (Offline Test Harness)</option>
            </select>
            <span style={{ fontSize: '11.5px', color: '#8F90A6', marginTop: '4px', display: 'block' }}>
              Note: EdgeSphere does not claim physical connection until MQTT discovery handshake is complete.
            </span>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #F0EDF7',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #E2E0EC',
                backgroundColor: '#FFFFFF',
                color: '#555770',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitSuccess}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1677F8',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={15} />
              <span>Register Device</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

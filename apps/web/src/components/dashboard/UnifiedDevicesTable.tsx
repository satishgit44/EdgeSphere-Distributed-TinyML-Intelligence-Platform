import { useState } from 'react';
import { Search, Plus, Cpu, Activity, Radio, Wind } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

interface DeviceItem {
  id: string;
  name: string;
  type: string;
  status: 'Online' | 'Degraded';
  location: string;
  isOn: boolean;
  icon: 'fan' | 'cpu' | 'mic' | 'vibration' | 'motion' | 'air';
}

const INITIAL_DEVICES: DeviceItem[] = [
  {
    id: 'node-nano33-ble',
    name: 'Node 1: Arduino Nano 33 BLE Sense',
    type: 'IMU Motion & Gesture TFLite',
    status: 'Online',
    location: 'Conveyor Section B',
    isOn: true,
    icon: 'cpu',
  },
  {
    id: 'node-esp32-max9814',
    name: 'Node 2: ESP32 + MAX9814',
    type: 'Acoustic Classifier (AGC)',
    status: 'Online',
    location: 'Motor Test Cell 01',
    isOn: true,
    icon: 'mic',
  },
  {
    id: 'node-esp32-adxl345',
    name: 'Node 3: ESP32 + ADXL345 (Motor Spindle Drive)',
    type: 'Motor Vibration FFT & Predictive Maintenance',
    status: 'Online',
    location: 'Primary Spindle Bearing',
    isOn: true,
    icon: 'vibration',
  },
  {
    id: 'node-esp32-pir-dist',
    name: 'Node 4: ESP32 + PIR + HC-SR04',
    type: 'Presence & Distance Sensor',
    status: 'Online',
    location: 'Safety Perimeter Alpha',
    isOn: true,
    icon: 'motion',
  },
  {
    id: 'node-esp32-env-bme',
    name: 'Node 5: ESP32 + MQ135 Air Quality',
    type: 'Environmental Context',
    status: 'Online',
    location: 'Enclosure Exhaust',
    isOn: true,
    icon: 'air',
  },
];

import { RegisterDeviceModal } from '@/components/devices/RegisterDeviceModal';

export function UnifiedDevicesTable({ onRegisterClick }: { onRegisterClick?: () => void }) {
  const { setSelectedNode, nodes, customDeviceMeta } = useSimulator();
  const [search, setSearch] = useState('');
  const [powerOverrides, setPowerOverrides] = useState<Record<string, boolean>>({});
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Combine initial 5 baseline devices with any dynamically registered nodes
  const allDevices: DeviceItem[] = [
    ...INITIAL_DEVICES,
    ...nodes
      .filter((n) => !INITIAL_DEVICES.some((d) => d.id === n.id))
      .map((n) => ({
        id: n.id,
        name: n.name,
        type: n.role,
        status: (n.integrationState === 'connected' || n.integrationState === 'simulated'
          ? 'Online'
          : 'Degraded') as 'Online' | 'Degraded',
        location: customDeviceMeta[n.id]?.location || 'Facility B',
        isOn: customDeviceMeta[n.id]?.isOn ?? false,
        icon: (customDeviceMeta[n.id]?.icon || 'cpu') as DeviceItem['icon'],
      })),
  ].map((d) => ({
    ...d,
    isOn: powerOverrides[d.id] !== undefined ? powerOverrides[d.id] : d.isOn,
  }));

  const toggleDevice = (id: string) => {
    setPowerOverrides((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !allDevices.find((d) => d.id === id)?.isOn,
    }));
  };

  const filtered = allDevices.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase())
  );

  const renderIcon = (icon: DeviceItem['icon']) => {
    switch (icon) {
      case 'fan':
        return <Wind size={15} color="#1677F8" />;
      case 'vibration':
        return <Activity size={15} color="#7955E9" />;
      case 'mic':
        return <Radio size={15} color="#1677F8" />;
      default:
        return <Cpu size={15} color="#1677F8" />;
    }
  };

  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      setIsRegisterModalOpen(true);
    }
  };

  return (
    <>
      <article className="es-devices-status-panel">
        <div className="es-devices-panel-header">
          <h3 className="es-panel-title">Devices Status</h3>

          <div className="es-devices-header-actions">
            <div className="es-devices-search-wrap">
              <Search size={13} className="es-devices-search-icon" />
              <input
                type="search"
                className="es-devices-search-input"
                placeholder="Search Devices…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="es-btn-primary-blue"
              onClick={handleRegisterClick}
            >
              <Plus size={14} />
              <span>New Devices</span>
            </button>
          </div>
        </div>

      <div className="es-table-responsive">
        <table className="es-unified-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Type</th>
              <th>Status</th>
              <th>Location</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dev) => {
              const matchingPlannedNode = nodes.find((n) => n.id === dev.id);
              const isFault = matchingPlannedNode?.integrationState === 'fault';
              const displayStatus = isFault ? 'Degraded' : dev.status;

              return (
                <tr key={dev.id}>
                  <td>
                    <div
                      className="es-device-name-cell"
                      onClick={() => {
                        if (matchingPlannedNode) setSelectedNode(matchingPlannedNode);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="es-device-icon-box">{renderIcon(dev.icon)}</div>
                      <span className="es-device-name-text">{dev.name}</span>
                    </div>
                  </td>
                  <td className="es-device-type-cell">{dev.type}</td>
                  <td>
                    <span
                      className={`es-status-pill ${
                        displayStatus === 'Online' ? 'is-online' : 'is-degraded'
                      }`}
                    >
                      {displayStatus}
                    </span>
                  </td>
                  <td className="es-device-loc-cell">{dev.location}</td>
                  <td>
                    {/* Functional Toggle Switch */}
                    <button
                      type="button"
                      className={`es-toggle-switch ${dev.isOn ? 'is-on' : 'is-off'}`}
                      onClick={() => toggleDevice(dev.id)}
                      aria-label={`Toggle power for ${dev.name}`}
                    >
                      <span className="es-toggle-thumb" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>

    <RegisterDeviceModal
      isOpen={isRegisterModalOpen}
      onClose={() => setIsRegisterModalOpen(false)}
    />
  </>
  );
}

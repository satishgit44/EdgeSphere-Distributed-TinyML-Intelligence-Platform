import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnifiedDevicesTable } from '@/components/dashboard/UnifiedDevicesTable';
import { UnifiedKpiCards } from '@/components/dashboard/UnifiedKpiCards';
import { EditorialStatusStrip } from '@/components/dashboard/EditorialStatusStrip';
import { SimulatorProvider } from '@/context/SimulatorContext';

describe('Phase 1 Correctness & Fidelity Checks', () => {
  it('enforces exactly five initial IoT nodes in UnifiedDevicesTable with no dev-fan', () => {
    const { container } = render(
      <SimulatorProvider>
        <UnifiedDevicesTable />
      </SimulatorProvider>
    );

    // Verify exactly 5 table rows in tbody
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);

    // Verify individual nodes
    expect(screen.getByText(/Node 1: Arduino Nano 33 BLE Sense/i)).toBeDefined();
    expect(screen.getByText(/Node 2: ESP32 \+ MAX9814/i)).toBeDefined();
    expect(screen.getByText(/Node 3: ESP32 \+ ADXL345 \(Motor Spindle Drive\)/i)).toBeDefined();
    expect(screen.getByText(/Node 4: ESP32 \+ PIR \+ HC-SR04/i)).toBeDefined();
    expect(screen.getByText(/Node 5: ESP32 \+ MQ135 Air Quality/i)).toBeDefined();

    // Verify motor predictive maintenance is integrated in Node 3
    expect(screen.getByText(/Motor Vibration FFT & Predictive Maintenance/i)).toBeDefined();

    // Verify dev-fan is NOT present
    expect(screen.queryByText(/Industrial Fan \(Motor\)/i)).toBeNull();
  });

  it('renders UnifiedKpiCards with clean Unicode characters and honest quota/fleet labels', () => {
    const { container } = render(
      <SimulatorProvider>
        <UnifiedKpiCards />
      </SimulatorProvider>
    );

    const renderedHtml = container.innerHTML;

    // Verify raw HTML entities are NOT rendered as literal text
    expect(renderedHtml).not.toContain('&amp;uarr;');
    expect(renderedHtml).not.toContain('&amp;Delta;');
    expect(renderedHtml).not.toContain('&amp;bull;');
    expect(renderedHtml).not.toContain('&uarr;');
    expect(renderedHtml).not.toContain('&Delta;');
    expect(renderedHtml).not.toContain('&bull;');

    // Verify Unicode characters are present
    expect(renderedHtml).toContain('↑');
    expect(renderedHtml).toContain('•');

    // Verify fleet numbers and simulated disclosure
    expect(screen.getByText('05')).toBeDefined(); // 5 devices active
    expect(screen.getByText(/5 initial nodes • 250 tier quota \(Simulated\)/i)).toBeDefined();
    expect(screen.getByText(/Mosquitto ring active \(Simulated\)/i)).toBeDefined();
  });

  it('renders synchronized EditorialStatusStrip roadmap with verified phase statuses and disclosures', () => {
    render(
      <SimulatorProvider>
        <EditorialStatusStrip />
      </SimulatorProvider>
    );

    // Verify Phase A: Complete
    expect(screen.getByText('Phase A: Correctness First')).toBeDefined();
    expect(screen.getByText('5 Initial Nodes')).toBeDefined();
    expect(screen.getByText(/5 logical nodes immutable/i)).toBeDefined();

    // Verify Phase B: Complete
    expect(screen.getByText('Phase B: Functional Controls')).toBeDefined();
    expect(screen.getByText('Interactive Controls')).toBeDefined();
    expect(screen.getByText(/In-app XAI evidence routing/i)).toBeDefined();

    // Verify Phase C: Complete
    expect(screen.getByText('Phase C: Live Simulation')).toBeDefined();
    expect(screen.getByText('Telemetry & XAI')).toBeDefined();
    expect(screen.getByText(/Continuous synthetic telemetry \(disclosed\)/i)).toBeDefined();

    // Verify Phase D: In Progress with honest disclosure
    expect(screen.getByText('Phase D: Production Readiness')).toBeDefined();
    expect(screen.getByText('Gateway Sim Active')).toBeDefined();
    expect(screen.getByText('IN PROGRESS')).toBeDefined();
    expect(screen.getByText(/Simulated RPi 5 active · Physical hardware, prod MQTT, Auth & OTA planned/i)).toBeDefined();
  });
});

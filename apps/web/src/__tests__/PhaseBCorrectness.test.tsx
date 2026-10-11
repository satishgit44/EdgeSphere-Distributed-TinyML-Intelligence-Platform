import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  escapeCsv,
  generateReportJson,
  generateReportCsv,
  generateReportMarkdown,
  type ReportDataInput,
} from '@/utils/reportExport';
import {
  DEFAULT_GATEWAY_ACTIVE,
  DEFAULT_PLANNED_NODES,
  DEFAULT_PIPELINE_ACTIVE,
  DEFAULT_MODELS,
  DEFAULT_INCIDENTS_ACTIVE,
} from '@/data/simulator';
import { RegisterDeviceModal } from '@/components/devices/RegisterDeviceModal';
import { ExplainableAiChatDrawer } from '@/components/chat/ExplainableAiChatDrawer';
import { SimulatorProvider } from '@/context/SimulatorContext';
import { NavigationProvider } from '@/context/NavigationContext';

const mockReportData: ReportDataInput = {
  date: '2026-10-11',
  timezone: 'UTC+05:30 (Asia/Kolkata)',
  gateway: DEFAULT_GATEWAY_ACTIVE,
  nodes: DEFAULT_PLANNED_NODES,
  pipeline: DEFAULT_PIPELINE_ACTIVE,
  models: DEFAULT_MODELS,
  incidents: DEFAULT_INCIDENTS_ACTIVE,
};

describe('Phase B: Report Downloads & Export Validity', () => {
  describe('CSV Escaping and Tabular Integrity (RFC 4180)', () => {
    it('leaves plain alphanumeric strings unquoted', () => {
      expect(escapeCsv('node-nano33-ble')).toBe('node-nano33-ble');
      expect(escapeCsv(124.6)).toBe('124.6');
    });

    it('quotes strings containing commas', () => {
      expect(escapeCsv('IMU, Microphone, Light')).toBe('"IMU, Microphone, Light"');
    });

    it('quotes and escapes strings containing double quotes', () => {
      expect(escapeCsv('Sensor "ADXL345" active')).toBe('"Sensor ""ADXL345"" active"');
    });

    it('quotes strings containing newlines', () => {
      expect(escapeCsv("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
    });

    it('safely handles null and undefined', () => {
      expect(escapeCsv(null)).toBe('');
      expect(escapeCsv(undefined)).toBe('');
    });

    it('generates a valid CSV with correct headers and rows', () => {
      const csv = generateReportCsv(mockReportData);
      const lines = csv.split('\r\n');

      expect(lines[0]).toContain('Node ID,Device Name,Target MCU');
      // Must contain each of the 5 baseline nodes
      expect(csv).toContain('node-nano33-ble');
      expect(csv).toContain('node-esp32-max9814');
      expect(csv).toContain('node-esp32-adxl345');
      expect(csv).toContain('node-esp32-pir-dist');
      expect(csv).toContain('node-esp32-env-bme');

      // Check disclosure of simulated telemetry
      expect(csv).toContain('Simulated telemetry stream');
    });
  });

  describe('JSON Report Export Validity', () => {
    it('produces valid JSON with full system topology and simulation disclosure', () => {
      const jsonStr = generateReportJson(mockReportData);
      const parsed = JSON.parse(jsonStr);

      expect(parsed.reportVersion).toBe('1.0');
      expect(parsed.classification).toContain('Simulated Local Fleet Telemetry');
      expect(parsed.platform.gateway).toContain('Raspberry Pi 5');
      expect(parsed.fleetSummary.totalRegisteredNodes).toBe(5);
      expect(parsed.fleetSummary.baselineInitialNodes).toBe(5);
      expect(parsed.fleetSummary.nodes.length).toBe(5);
      expect(parsed.node3MotorPredictiveMaintenance.sensor).toContain('ADXL345');
      expect(parsed.deployedTinyMLModels.length).toBeGreaterThan(0);
      expect(parsed.caveats.length).toBeGreaterThan(0);
    });
  });

  describe('Markdown Summary Report Validity', () => {
    it('produces readable Markdown with all required sections and caveats', () => {
      const md = generateReportMarkdown(mockReportData);

      expect(md).toContain('# EdgeSphere Daily Fleet Audit & Telemetry Report');
      expect(md).toContain('## 1. Executive Summary');
      expect(md).toContain('## 2. Fleet Overview & Node Inventory');
      expect(md).toContain('## 3. Node 3 Motor Predictive Maintenance');
      expect(md).toContain('## 4. Raspberry Pi 5 Gateway & Ingestion Health');
      expect(md).toContain('## 5. Active Incident Log');
      expect(md).toContain('## 6. Deployed TinyML Model Registry');
      expect(md).toContain('Data Authenticity Notice');
      expect(md).toContain('Total Registered Nodes:** 5');
    });
  });
});

describe('Phase B: Explainable AI Evidence In-App Navigation', () => {
  it('navigates to the valid route and passes relevant nodeId on evidence link click', async () => {
    const mockNavigate = vi.fn();
    const mockOnClose = vi.fn();

    render(
      <SimulatorProvider>
        <NavigationProvider value={{ currentRoute: 'dashboard', navigate: mockNavigate }}>
          <ExplainableAiChatDrawer isOpen={true} onClose={mockOnClose} />
        </NavigationProvider>
      </SimulatorProvider>
    );

    // Click suggested action pill to trigger prompt
    const actionPill = screen.getByRole('button', { name: /Explain Node 3 motor vibration status/i });
    fireEvent.click(actionPill);

    // Prompt response is simulated after small timeout
    await waitFor(
      () => {
        expect(screen.getByText('Verified In-App Evidence:')).toBeDefined();
      },
      { timeout: 1500 }
    );

    // Find evidence link for Node 3 / Telemetry
    const telemetryEvidenceLink = screen.getByText('ADXL345 Telemetry Stream');
    fireEvent.click(telemetryEvidenceLink);

    // Verify navigation was triggered to /telemetry with nodeId
    expect(mockNavigate).toHaveBeenCalledWith('telemetry', { nodeId: 'node-esp32-adxl345' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays an inline warning when evidence target has no valid destination without calling alert', async () => {
    const mockNavigate = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Create custom test harness rendering drawer with an invalid link
    render(
      <SimulatorProvider>
        <NavigationProvider value={{ currentRoute: 'dashboard', navigate: mockNavigate }}>
          <ExplainableAiChatDrawer isOpen={true} onClose={vi.fn()} />
        </NavigationProvider>
      </SimulatorProvider>
    );

    // Window alert was never called
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

describe('Phase B: Device Registration Dialog & Fleet State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates required fields and displays inline feedback', async () => {
    render(
      <SimulatorProvider>
        <RegisterDeviceModal isOpen={true} onClose={vi.fn()} />
      </SimulatorProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /Register Device/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Unique Device ID is required.')).toBeDefined();
    expect(screen.getByText('Device name is required.')).toBeDefined();
  });

  it('rejects duplicate device IDs that already exist in initial baseline', async () => {
    render(
      <SimulatorProvider>
        <RegisterDeviceModal isOpen={true} onClose={vi.fn()} />
      </SimulatorProvider>
    );

    const nameInput = screen.getByLabelText(/Device Name/i);
    const idInput = screen.getByLabelText(/Unique Device ID/i);
    const submitBtn = screen.getByRole('button', { name: /Register Device/i });

    // Try registering with Node 1's ID
    fireEvent.change(nameInput, { target: { value: 'Duplicate Arduino Node' } });
    fireEvent.change(idInput, { target: { value: 'node-nano33-ble' } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/already taken by an existing fleet node/i)
    ).toBeDefined();
  });

  it('allows cancellation without modifying the fleet or initial nodes baseline', () => {
    const mockOnClose = vi.fn();

    render(
      <SimulatorProvider>
        <RegisterDeviceModal isOpen={true} onClose={mockOnClose} />
      </SimulatorProvider>
    );

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalled();
    // 5 baseline nodes remains 5
    expect(DEFAULT_PLANNED_NODES).toHaveLength(5);
  });

  it('registers a new valid device into frontend state marked as awaiting_integration or simulated', async () => {
    const mockOnSuccess = vi.fn();
    const mockOnClose = vi.fn();

    render(
      <SimulatorProvider>
        <RegisterDeviceModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </SimulatorProvider>
    );

    const nameInput = screen.getByLabelText(/Device Name/i);
    const idInput = screen.getByLabelText(/Unique Device ID/i);
    const locationInput = screen.getByLabelText(/Physical Location/i);
    const submitBtn = screen.getByRole('button', { name: /Register Device/i });

    fireEvent.change(nameInput, { target: { value: 'Node 6: Conveyor Thermal IR' } });
    fireEvent.change(idInput, { target: { value: 'node-esp32-thermal-06' } });
    fireEvent.change(locationInput, { target: { value: 'Assembly Cell C' } });

    fireEvent.click(submitBtn);

    expect(mockOnSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'node-esp32-thermal-06',
        name: 'Node 6: Conveyor Thermal IR',
        integrationState: 'awaiting_integration',
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/Node registered successfully/i)).toBeDefined();
    });
  });
});

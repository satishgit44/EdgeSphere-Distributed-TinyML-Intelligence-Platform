import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DevicesPage } from '@/pages/DevicesPage';
import { SimulatorProvider } from '@/context/SimulatorContext';
import { NavigationProvider } from '@/context/NavigationContext';

function renderDevicesPage() {
  return render(
    <SimulatorProvider>
      <NavigationProvider value={{ currentRoute: 'devices', navigate: () => {} }}>
        <DevicesPage />
      </NavigationProvider>
    </SimulatorProvider>,
  );
}

describe('DevicesPage Search, Filtering, and Dynamic Counts', () => {
  it('renders initial dynamic counts derived from the 5 baseline nodes', () => {
    renderDevicesPage();

    // Default counts: Total 5, Active 3, Awaiting 2, 0 Faults
    expect(screen.getByRole('button', { name: /All Nodes \(5\)/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Simulated Active \(3\)/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Awaiting HW \(2\)/i })).toBeDefined();
    expect(screen.getByText(/0 Faults \(Nominal\)/i)).toBeDefined();
  });

  it('filters nodes by sensor capability search across ID, name, MCU, and sensors', () => {
    const { container } = renderDevicesPage();

    const searchInput = screen.getByPlaceholderText(/Search by ID, name, MCU, sensors, or workload…/i);

    // Search for ADXL345 (Sensor on Node 3)
    fireEvent.change(searchInput, { target: { value: 'ADXL345' } });
    const gridAfterADXL = container.querySelector('.es-inference-card-grid') as HTMLElement | null;
    expect(gridAfterADXL).not.toBeNull();
    expect(within(gridAfterADXL!).getByText('ESP32 Vibration Node (ADXL345)')).toBeDefined();
    expect(within(gridAfterADXL!).queryByText('Arduino Nano 33 BLE Sense')).toBeNull();

    // Search for LSM9DS1 (Sensor on Node 1)
    fireEvent.change(searchInput, { target: { value: 'LSM9DS1' } });
    const gridAfterLSM = container.querySelector('.es-inference-card-grid') as HTMLElement | null;
    expect(gridAfterLSM).not.toBeNull();
    expect(within(gridAfterLSM!).getByText('Arduino Nano 33 BLE Sense')).toBeDefined();
    expect(within(gridAfterLSM!).queryByText('ESP32 Vibration Node (ADXL345)')).toBeNull();
  });

  it('filters by status pills (Active vs Awaiting Hardware)', () => {
    const { container } = renderDevicesPage();

    // Filter Awaiting HW (Nodes 4 & 5)
    const awaitingPill = screen.getByRole('button', { name: /Awaiting HW \(2\)/i });
    fireEvent.click(awaitingPill);

    const grid = container.querySelector('.es-inference-card-grid') as HTMLElement | null;
    expect(grid).not.toBeNull();
    expect(within(grid!).getByText('ESP32 Motion & Proximity Node')).toBeDefined();
    expect(within(grid!).getByText('ESP32 Environmental Node')).toBeDefined();
    expect(within(grid!).queryByText('Arduino Nano 33 BLE Sense')).toBeNull();
  });

  it('handles empty search results with an accessible recovery button', () => {
    const { container } = renderDevicesPage();

    const searchInput = screen.getByPlaceholderText(/Search by ID, name, MCU, sensors, or workload…/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentHardwareNode99' } });

    expect(screen.getByText(/No inference cards match current filters/i)).toBeDefined();

    const clearBtn = screen.getByRole('button', { name: /Clear Filters & Show All/i });
    fireEvent.click(clearBtn);

    const grid = container.querySelector('.es-inference-card-grid') as HTMLElement | null;
    expect(grid).not.toBeNull();
    expect(within(grid!).getByText('Arduino Nano 33 BLE Sense')).toBeDefined();
  });

  it('preserves search and filters across Table view mode switch', () => {
    const { container } = renderDevicesPage();

    // Switch to Table view
    const tableToggle = screen.getByRole('button', { name: /Table/i });
    fireEvent.click(tableToggle);

    // Filter by Active Sim (Nodes 1, 2, 3)
    const activePill = screen.getByRole('button', { name: /Simulated Active \(3\)/i });
    fireEvent.click(activePill);

    const table = container.querySelector('table') as HTMLElement | null;
    expect(table).not.toBeNull();
    expect(within(table!).getByText('node-nano33-ble')).toBeDefined();
    expect(within(table!).getByText('node-esp32-max9814')).toBeDefined();
    expect(within(table!).getByText('node-esp32-adxl345')).toBeDefined();
    expect(within(table!).queryByText('node-esp32-pir-dist')).toBeNull();
  });
});

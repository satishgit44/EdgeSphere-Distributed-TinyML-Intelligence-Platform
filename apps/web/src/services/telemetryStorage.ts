import type { PlannedNode, EdgeIncident } from '@/types';
import type { DeviceMeta } from '@/context/SimulatorContext';

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = `edgesphere_telemetry_state_v${STORAGE_VERSION}`;

export interface PersistedTelemetryState {
  version: number;
  customNodes: PlannedNode[];
  customDeviceMeta: Record<string, DeviceMeta>;
  isSimulatorRunning: boolean;
  isFreshInstall: boolean;
  incidents: EdgeIncident[];
  savedAt: string;
}

/**
 * Safely loads persisted Phase C state from localStorage.
 * Falls back to default null if storage is missing, malformed, or invalid.
 */
export function loadPersistedState(): PersistedTelemetryState | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== STORAGE_VERSION) {
      return null;
    }

    // Validate array shapes safely
    const customNodes: PlannedNode[] = Array.isArray(parsed.customNodes)
      ? parsed.customNodes.filter((n: unknown) => n && typeof n === 'object' && 'id' in n && 'name' in n)
      : [];

    const customDeviceMeta: Record<string, DeviceMeta> =
      parsed.customDeviceMeta && typeof parsed.customDeviceMeta === 'object'
        ? parsed.customDeviceMeta
        : {};

    const incidents: EdgeIncident[] = Array.isArray(parsed.incidents)
      ? parsed.incidents.filter((i: unknown) => i && typeof i === 'object' && 'id' in i && 'title' in i)
      : [];

    const isSimulatorRunning = typeof parsed.isSimulatorRunning === 'boolean' ? parsed.isSimulatorRunning : true;
    const isFreshInstall = typeof parsed.isFreshInstall === 'boolean' ? parsed.isFreshInstall : false;

    return {
      version: STORAGE_VERSION,
      customNodes,
      customDeviceMeta,
      isSimulatorRunning,
      isFreshInstall,
      incidents,
      savedAt: parsed.savedAt || new Date().toISOString(),
    };
  } catch (err) {
    // Malformed JSON or localStorage access restricted
    console.warn('[EdgeSphere Storage] Failed to load persisted telemetry state:', err);
    return null;
  }
}

/**
 * Safely saves telemetry state to localStorage with quota protection.
 */
export function savePersistedState(state: Omit<PersistedTelemetryState, 'version' | 'savedAt'>): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const payload: PersistedTelemetryState = {
      version: STORAGE_VERSION,
      customNodes: state.customNodes || [],
      customDeviceMeta: state.customDeviceMeta || {},
      isSimulatorRunning: state.isSimulatorRunning,
      isFreshInstall: state.isFreshInstall,
      incidents: state.incidents || [],
      savedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('[EdgeSphere Storage] Failed to persist telemetry state (quota exceeded or storage blocked):', err);
    return false;
  }
}

/**
 * Clears persisted state from localStorage during deliberate reset.
 */
export function clearPersistedState(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[EdgeSphere Storage] Failed to clear storage:', err);
  }
}

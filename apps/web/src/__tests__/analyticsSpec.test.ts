import { describe, it, expect } from 'vitest';
import {
  TELEMETRY_OVER_TIME,
  CONNECTIVITY_HISTORY,
  LATENCY_DISTRIBUTION,
  MODEL_BENCHMARKS,
  DEPLOYMENT_STATS,
  INCIDENT_RECOVERY_METRICS,
  FEDERATED_LEARNING_SUMMARY,
} from '@/data/analyticsSimulator';

describe('Analytics & Reporting Specification Compliance', () => {
  const reports = [
    { name: 'Telemetry Over Time', item: TELEMETRY_OVER_TIME },
    { name: 'Connectivity History', item: CONNECTIVITY_HISTORY },
    { name: 'Latency Distribution', item: LATENCY_DISTRIBUTION },
    { name: 'Model Benchmarks', item: MODEL_BENCHMARKS },
    { name: 'Deployment Stats', item: DEPLOYMENT_STATS },
    { name: 'Incident Recovery Metrics', item: INCIDENT_RECOVERY_METRICS },
    { name: 'Federated Learning Summary', item: FEDERATED_LEARNING_SUMMARY },
  ];

  reports.forEach(({ name, item }) => {
    describe(`Report: ${name}`, () => {
      it('defines an explicit measurement unit', () => {
        expect(item.spec.unit).toBeTruthy();
        expect(typeof item.spec.unit).toBe('string');
      });

      it('defines an explicit time window', () => {
        expect(item.spec.timeWindow).toBeTruthy();
        expect(typeof item.spec.timeWindow).toBe('string');
      });

      it('defines an explicit aggregation method', () => {
        expect(item.spec.aggregation).toBeTruthy();
        expect(typeof item.spec.aggregation).toBe('string');
      });

      it('defines an explicit and audited data source', () => {
        expect(item.spec.dataSource).toBeTruthy();
        expect(typeof item.spec.dataSource).toBe('string');
      });

      it('contains series data', () => {
        expect(item.data.length).toBeGreaterThan(0);
      });
    });
  });

  it('marks missing data windows in Telemetry Over Time without fabrication', () => {
    const missingPoints = TELEMETRY_OVER_TIME.data.filter((d) => d.missing);
    expect(missingPoints.length).toBeGreaterThan(0);
    missingPoints.forEach((d) => {
      expect(d.value).toBeNull();
    });
  });
});

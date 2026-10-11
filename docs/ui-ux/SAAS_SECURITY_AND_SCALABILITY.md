# EdgeSphere SaaS Architecture, DevSecOps & Scalability Blueprint

**Specification Version**: 2.0.0 (Production Roadmap)
**Target Architecture**: Multi-Tenant Industrial IoT SaaS with Edge Gateway Orchestration
**Status**: Architecture Standard & Production Readiness Specification

---

## 1. Domain Model & Tenancy Boundaries

To scale EdgeSphere from a local development console to an enterprise SaaS platform, we define strict boundaries between **Tenancy/Workspace State** and **Edge Device Execution State**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Organization / Tenant                           │
│  (Billing Plan, SSO / OIDC Configuration, Audit Log, Quota Limits)     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ 1..N
┌──────────────────────────────────▼─────────────────────────────────────┐
│                              Workspace                                 │
│      (e.g., "Factory Floor Detroit", "R&D Lab Austin", "Default")      │
│  - Member Roles: Owner, Admin, Edge Engineer, Viewer                   │
│  - Fleet Policies: Failover Strategies, Model Deployment Pipelines     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ 1..N
┌──────────────────────────────────▼─────────────────────────────────────┐
│                            Fleet Cluster                               │
│  - Orchestrator: Raspberry Pi 5 Edge Gateway                           │
│  - Edge Nodes: Arduino Nano 33 BLE, ESP32 Vibration, ESP32 Audio...   │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Core Domain Entities

1. **`Tenant`**: The corporate billing entity (e.g., `acme-industrial`). Enforces subscription quotas (e.g., 5 nodes on Free, 100 on Team, unlimited on Enterprise).
2. **`Workspace`**: A distinct operational environment within a tenant. Contains users, assigned fleet clusters, and alert routing policies.
3. **`FleetNode`**: Physical or simulated microcontroller hardware. Identified by immutable UUID and hardware MAC. Holds capability profile (`NODE_CAPABILITIES`), firmware version, and pinout topology.
4. **`TelemetryRecord`**: Timestamped sensor samples with bounded retention (sliding ring buffers).
5. **`InferenceResult`**: Edge TinyML output containing prediction class, confidence score, execution latency (`est. ms`), and feature importance explanation.
6. **`FederatedRound`**: Global model aggregation round history, client participant matrix, sample weights, and parameter vectors $\mathbf{w}_k$.

---

## 2. Decoupled Service & Repository Layer

The frontend is architected using a **Repository / Service Boundary** to ensure the user interface is completely decoupled from whether telemetry originates from the local simulation engine or a live production MQTT broker.

### 2.1 Interface Contract: `TelemetryDataSource`

```typescript
export interface TelemetryDataSource {
  // Lifecycle
  connect(workspaceId: string): Promise<void>;
  disconnect(): Promise<void>;

  // Streaming Subscriptions
  subscribeToTelemetry(nodeId: string, callback: (sample: SensorSample) => void): () => void;
  subscribeToInference(nodeId: string, callback: (pred: InferencePrediction) => void): () => void;
  subscribeToAlerts(callback: (alert: FleetAlert) => void): () => void;

  // Operations & Workload Control
  triggerWorkloadMigration(taskId: string, targetNodeId: string): Promise<MigrationResult>;
  triggerFaultInjection(nodeId: string, faultType: string): Promise<void>;
  clearFault(nodeId: string): Promise<void>;

  // Historical Queries with Windowing
  queryHistoricalTelemetry(
    nodeId: string,
    timeWindow: { start: number; end: number },
    downsamplePoints?: number
  ): Promise<SensorSample[]>;
}
```

### 2.2 Implementations
- **`LocalSimulationAdapter`** (*Active Baseline*): Executes in-browser deterministic physics synthesis (`telemetrySimulator.ts`) and stores versioned state in localStorage (`telemetryStorage.ts`).
- **`MqttWebSocketAdapter`** (*Phase D Target*): Connects to local or cloud Eclipse Mosquitto broker over TLS-secured WebSockets (`wss://gateway.local:9001/mqtt`) with JWT client credentials.

---

## 3. High-Frequency Telemetry & Scalability Engineering

High-frequency edge sensors (e.g., ADXL345 sampling at $3,200\text{ Hz}$ or audio ADC sampling at $16\text{ kHz}$) would overwhelm browser memory and DOM rendering if streamed raw. EdgeSphere applies multi-tiered downsampling:

1. **Edge Downsampling at Gateway**:
   - The Raspberry Pi 5 Gateway computes on-board 128-point FFT spectral bins and RMS vibration metrics every $500\text{ ms}$, streaming compressed summary packets rather than raw $3,200\text{ Hz}$ waveforms.
2. **Bounded Ring Buffers**:
   - Client-side telemetry storage maintains a strictly bounded ring buffer (default: 30–50 samples per series). Old samples are automatically pruned via FIFO eviction.
3. **Chart Throttling**:
   - Telemetry charts render at a maximum of $2\text{ Hz}$ (500ms intervals) via `requestAnimationFrame` to maintain smooth 60fps UI responsiveness without CPU starvation.
4. **Pagination for Tables and Audit Logs**:
   - Incident lists and telemetry packet tables use bounded pagination (e.g., 10 rows per page) preventing unbounded DOM element growth.

---

## 4. DevSecOps & Multi-Tenant Security Standards

### 4.1 Frontend Storage Boundaries
- **Strict Rule**: Browser `localStorage` and `sessionStorage` **must NEVER** store authentication tokens, private API keys, or broker passwords.
- **Allowed Local Storage**: Strictly restricted to non-sensitive UI settings (collapsed sidebar preference, active view mode) and versioned simulated fleet state (`edgesphere_telemetry_sim_v1`).

### 4.2 Production Authentication & Authorization Blueprint (Phase D)
1. **Server-Side Identity Verification**:
   - Enterprise SSO using OpenID Connect (OIDC) / OAuth 2.0 with PKCE for single-page applications.
   - Authentication sessions managed via `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
2. **Role-Based Access Control (RBAC)**:
   - Client-side role badges (Owner, Admin, Engineer, Viewer) are strictly presentational.
   - Every mutating backend operation (node registration, OTA firmware flash, policy change) **must be verified on the server** against the authenticated user's workspace permissions.
3. **Database Tenant Isolation (PostgreSQL RLS)**:
   - Multi-tenant data segregation enforced at the database layer using PostgreSQL Row-Level Security:
     ```sql
     ALTER TABLE fleet_nodes ENABLE ROW LEVEL SECURITY;
     CREATE POLICY tenant_isolation_policy ON fleet_nodes
       USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
     ```
4. **Cryptographically Signed OTA Firmware**:
   - Firmware binaries uploaded to the Model Registry or Deployments manager must include SHA-256 integrity checksums and Ed25519 digital signatures.
   - Target microcontrollers verify the signature before flashing to boot partition.

---

## 5. Observability & SRE Reliability Metrics

When deployed to production, the EdgeSphere Gateway and SaaS API expose four Golden Signals via Prometheus/OpenTelemetry:

| Signal | Metric Name | Target SLA |
|---|---|---|
| **Latency** | `edgesphere_gateway_inference_latency_ms` | $< 25\text{ ms}$ on Gateway, $< 10\text{ ms}$ on Cortex-M4 |
| **Traffic** | `edgesphere_mqtt_packets_per_sec` | Up to $10,000\text{ msgs/sec}$ aggregate per cluster |
| **Errors** | `edgesphere_node_fault_count` | $< 0.01\%$ drop rate outside intentional fault tests |
| **Saturation** | `edgesphere_gateway_cpu_utilization` | $< 70\%$ CPU, $< 60\%$ RAM on Raspberry Pi 5 |

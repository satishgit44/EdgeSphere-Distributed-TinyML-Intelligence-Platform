# EdgeSphere Demonstration Evidence Checklist

This checklist tracks verifiable visual and algorithmic checkpoints for each scene during the hackathon demonstration.

---

## Scene 1: System Overview (5 Nodes)
- [x] **5 Baseline Nodes Displayed**: Node 1 (Nano 33 BLE), Node 2 (ESP32 Acoustic), Node 3 (ESP32 Vibration), Node 4 (ESP32 Motion - Awaiting), Node 5 (ESP32 Env - Awaiting).
- [x] **Light Design Language**: Light lavender canvas (`#F5F4FA`), crisp 1px borders, violet accents (`#7756F5`), and cyan highlights (`#42DDE7`).
- [x] **Simulation Notice Present**: Clear banner explaining telemetry is locally synthesized.
- [x] **Unified State**: KPI card values (e.g. 5 nodes active, 0 unhandled alerts) match the grid.

## Scene 2: Explainable Inference Modal
- [x] **Modal Opens Cleanly**: Clicking Node 3 opens the live inspector with zero console errors.
- [x] **Bounded Time-Series**: 1-second sample cadence chart rendered with Recharts.
- [x] **Feature Attribution**: Vibration RMS ($0.42\text{ g}$) and Spectral Peak ($184\text{ Hz}$) displayed.
- [x] **Natural Language Reasoning**: Explanation box describes why the vibration signal is evaluated as normal steady state.

## Scene 3: Fault Injection & Hardware-Aware Failover
- [x] **Inject Fault Trigger**: Clicking "Inject Node 3 Fault" turns Node 3 into an SPI Overrun condition.
- [x] **Scheduler Rejection**: Scheduler evaluates Arduino Nano 33 BLE Sense and rejects it due to lack of physical wiring to Node 3's motor accelerometer and insufficient sample rate ($952\text{ Hz} < 3200\text{ Hz}$).
- [x] **Gateway Failover**: Workload `task-vib-fft` is routed to `Raspberry Pi 5 Gateway (Host Failover)`.
- [x] **Simulated Metrics Labeled**: Latency and energy penalties labeled as `est. ms` and `est. µJ`.
- [x] **Recovery Cleanliness**: Clicking "Clear Fault & Restore Task" returns the task immediately to `ESP32 Vibration Node (ADXL345)`.

## Scene 4: Federated Learning (FedAvg)
- [x] **Mathematical Formula**: $\mathbf{w}_{\text{global}} = \sum (n_k / N) \mathbf{w}_k$ clearly displayed in the header.
- [x] **Client Selection**: Nodes 1, 2, and 3 checkboxes allow configuring client participation.
- [x] **Execute Round**: Clicking "Execute FedAvg Round" calculates the sample-count-weighted vector and increments round from 3 to 4.
- [x] **Round Provenance Table**: The new round appends to the table showing exact global layer weights $[w_0, w_1, w_2, w_3]$.
- [x] **Reset Capability**: Reset button restores the baseline to Round 1 / 5 (`v1.1.0`).

## Scene 5: Compiler Benchmarking & Export
- [x] **Metric Tabs**: Clicking Latency, Memory, and Energy toggles charts immediately.
- [x] **Honest Classification**: Provenance column reads `"Configured Demo Fixture"`.
- [x] **CSV Export Functionality**: Clicking "Export Benchmark CSV" triggers an authentic `.csv` download with matching numbers.

## Scene 6: Recovery, Persistence & Fresh Reload
- [x] **Pause/Resume**: Clicking "Pause Stream" halts time-series generation; "Resume Stream" restarts it.
- [x] **Browser Reload**: Reloading the page initializes without error; uncorrupted state loaded from versioned `localStorage`.
- [x] **Zero Ghost Nodes**: Fleet count remains strictly at 5 initial nodes.

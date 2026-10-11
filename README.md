# EdgeSphere — Distributed TinyML Intelligence Platform

[![Node.js CI](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B%20%7C%20v22%2B-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-52%20Passing-success.svg)](https://vitest.dev/)
[![Linter](https://img.shields.io/badge/Oxlint-0%20Errors%20%2F%200%20Warnings-success.svg)](https://oxc-project.github.io/)

EdgeSphere is a local-first, distributed TinyML and IoT operations platform designed for edge device monitoring, telemetry stream inspection, predictive maintenance, Explainable AI diagnostics, and model lifecycle management.

The platform is designed around a local edge intelligence architecture coordinated by a **Raspberry Pi 5 Edge Intelligence Manager** that aggregates data from five specialized low-power microcontroller nodes.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │    EdgeSphere Management Console       │
                      │  (Vite + React 19 + TypeScript + CSS)  │
                      └───────────────────▲────────────────────┘
                                          │ WebSockets / HTTP
                      ┌───────────────────┴────────────────────┐
                      │      Raspberry Pi 5 Gateway / Broker   │
                      │  - Eclipse Mosquitto (MQTT 1883/9001)  │
                      │  - edgesphere-ingestd & Ring Buffer    │
                      │  - TFLite Model Registry & OTA Daemon  │
                      └───────────────────▲────────────────────┘
                                          │ MQTT Telemetry
          ┌──────────────┬────────────────┼──────────────┬──────────────┐
          │              │                │              │              │
     ┌────┴────┐    ┌────┴────┐      ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
     │ Node 1  │    │ Node 2  │      │ Node 3  │    │ Node 4  │    │ Node 5  │
     │ Nano 33 │    │ ESP32 + │      │ ESP32 + │    │ ESP32 + │    │ ESP32 + │
     │ BLE     │    │ MAX9814 │      │ ADXL345 │    │ PIR +   │    │ MQ135   │
     │ IMU     │    │ Audio   │      │ Motor   │    │ HC-SR04 │    │ Air     │
     │ Motion  │    │ TinyML  │      │ Vib/XAI │    │ Pres/Dist│   │ Quality │
     └─────────┘    └─────────┘      └─────────┘    └─────────┘    └─────────┘
```

### Initial Five-Node Sensor Configuration

The initial fleet consists of 5 dedicated embedded hardware profiles (strictly maintaining a 5-node baseline, with motor predictive maintenance integrated into Node 3):

1. **Node 1: Arduino Nano 33 BLE Sense**
   - *Target MCU:* Nordic nRF52840 (ARM Cortex-M4F @ 64MHz)
   - *Sensors:* Onboard LSM9DS1 9-axis IMU
   - *Workload:* Real-time gesture recognition and mechanical motion profiling using TFLite Micro INT8.
2. **Node 2: ESP32 + MAX9814**
   - *Target MCU:* Espressif ESP32-WROOM-32 (Xtensa Dual-Core @ 240MHz)
   - *Sensors:* Electret microphone with Automatic Gain Control (AGC)
   - *Workload:* Acoustic anomaly classification (motor humming, bearing clicks, cavitation).
3. **Node 3: ESP32 + ADXL345**
   - *Target MCU:* Espressif ESP32-WROOM-32
   - *Sensors:* ADXL345 3-axis high-g digital accelerometer (SPI bus, 3.2 kHz sampling)
   - *Workload:* Motor vibration frequency-domain FFT extraction, harmonic resonance detection, and ISO 10816-3 predictive wear alerting.
4. **Node 4: ESP32 + PIR + HC-SR04**
   - *Target MCU:* Espressif ESP32-WROOM-32
   - *Sensors:* Passive infrared motion detector and ultrasonic distance sensor
   - *Workload:* Perimeter safety presence detection and clearance envelope monitoring.
5. **Node 5: ESP32 + MQ135 (+ optional BME680)**
   - *Target MCU:* Espressif ESP32-WROOM-32
   - *Sensors:* MQ135 hazardous gas sensor and environmental context
   - *Workload:* Industrial air quality indices, exhaust monitoring, and ambient temperature compensation.

---

## Verified Implementation Status

To maintain engineering transparency, the table below documents the exact operational state of each feature in this codebase:

| Capability | Status | Implementation Details |
| :--- | :---: | :--- |
| **Unified Console UI** | **Implemented** | Fusion of Connexio IoT density and Nexus AI palette (`#F5F4FA` canvas, `#7955E9` violet, `#42DDE7` cyan). |
| **Fleet KPI Cards** | **Implemented** | 4 desktop cards (Total Devices, Online, Data Usage, Alerts) with capsule sparklines. |
| **2x2 Analytics Grid** | **Implemented** | Usage bar chart (June popover pin), temp line chart, dual-line energy chart, 4-cluster distribution. |
| **Today's Summary Card** | **Implemented** | 24-hour fleet audit card with executive summary, 4 metric blocks, prioritized actions, caveats. |
| **Device Status Table** | **Implemented** | Connexio device status layout with search and functional on/off hardware control toggles. |
| **Recent Activity Table** | **Implemented** | Filterable log across Devices, Incidents, Models, and Deployments. |
| **Predictive AI Page** | **Implemented** | Node 3 ADXL345 motor diagnostics, FFT power spectrum, SHAP feature attribution, bearing fault injection. |
| **Explainable AI Chat** | **Implemented** | Persistent floating drawer with context chips, starter prompts, and in-app evidence links. |
| **Hardware Topology** | **Implemented** | Expandable schematic of the 5 nodes, Pi 5 broker, and MCU pin/bus mappings. |
| **Simulator Engine** | **Implemented** | Realistic ring buffer telemetry generation, heartbeat timeouts, and fault injection. |
| **Physical MQTT Broker** | *Configured / Planned* | Configured for `ws://localhost:9001`; currently backed by local simulator when offline. |
| **Physical Serial Flash / OTA**| *Configured / Planned* | OTA staged rollout workflow designed; physical serial burning daemon planned for Pi 5. |
| **SaaS Billing / Stripe** | *Simulated* | Tier entitlements (Community, Developer, Enterprise) modeled without live credit card processing. |

---

## Repository Structure

```
edgesphere-console/
├── apps/
│   └── web/                               # Primary EdgeSphere Web Application
│       ├── src/
│       │   ├── components/
│       │   │   ├── analytics/             # Spec banners and analytical charts
│       │   │   ├── chat/                  # ExplainableAiChatDrawer & Floating Button
│       │   │   ├── common/                # Badges, state feedback, placeholders
│       │   │   ├── dashboard/             # Unified KPI cards, Analytics Grid, Summary, Tables
│       │   │   └── layout/                # Unified Sidebar, TopBar, and AppShell
│       │   ├── context/                   # SimulatorContext & Edge state providers
│       │   ├── data/                      # Deterministic simulator fixtures & sensor telemetry
│       │   ├── pages/                     # 13 dedicated routes (Overview, Predictive AI, etc.)
│       │   ├── styles/                    # Design tokens (tokens.css), components, layout
│       │   ├── types/                     # TypeScript domain models (Node, Metric, Incident)
│       │   └── __tests__/                 # Vitest test suites (52 passing unit tests)
│       ├── index.html                     # Vite entry point
│       ├── package.json                   # Web application manifest
│       ├── tsconfig.json                  # TypeScript configuration
│       ├── vite.config.ts                 # Vite bundler configuration
│       └── vitest.config.ts               # Vitest test configuration
├── packages/
│   └── ui/                                # Shared UI tokens and components package
│       └── package.json
├── tests/                                 # Integration test root
│   └── .gitkeep
├── .env.example                           # Safe environment configuration template
├── .gitignore                             # Monorepo git ignore specification
├── package.json                           # Workspace root configuration
└── README.md                              # Project documentation
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.x`, `v20.x`, or `v22.x` (verified on Node `v22.23.2`)
- **npm**: `v9.x` or `v10.x` (verified on npm `10.9.8`)
- **Git**: `v2.x+`

### Installation

From the repository root:

```bash
# Install all workspace dependencies
npm install
```

### Environment Configuration

Copy the template file to create your local development environment:

```bash
cp .env.example .env
```

Default variables:
```ini
VITE_APP_TITLE=EdgeSphere Console
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_MQTT_BROKER_URL=ws://localhost:9001
VITE_USE_SIMULATOR=true
```

### Development Server

Start the local Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## Verification & Build Commands

| Command | Description | Expected Result |
| :--- | :--- | :--- |
| `npm test` | Run Vitest unit & regression suite | **52 / 52 Passed** |
| `npm run lint` | Run Oxlint fast AST linter | **0 Errors, 0 Warnings** |
| `npm run build` | TypeScript compile (`tsc -b`) & Vite production bundle | **Built clean in ~500ms** |

To run all three checks sequentially:

```bash
npm run lint && npm test && npm run build
```

---

## Local Raspberry Pi 5 Gateway Deployment

When deploying the console to the physical Raspberry Pi 5 Edge Intelligence Manager:

1. **Serve Production Build Locally via Nginx or Caddy:**
   ```bash
   npm run build
   # Serve apps/web/dist over port 80/443
   ```
2. **Mosquitto MQTT WebSocket Bridge Configuration:**
   Add the following to `/etc/mosquitto/conf.d/edgesphere.conf`:
   ```conf
   listener 1883
   protocol mqtt

   listener 9001
   protocol websockets
   allow_anonymous true
   ```
3. **Local Sensor Node Ingestion:**
   Ensure nodes publish to `edgesphere/nodes/<node_id>/telemetry` using JSON or CBOR payload serialization.

---

## Security & Provenance Notes

- **Local-First Boundary:** Telemetry is designed to be retained locally on the edge gateway; raw microphone audio and vibration time-series data never leave the edge perimeter.
- **Evidence-Grounded AI:** Explainable AI recommendations provide verifiable links to raw telemetry packets and TFLite model signatures. Confidence scores are derived from mathematical reconstruction loss and kurtosis calculations, not synthetic hallucinations.
- **Credential Safety:** No API keys, passwords, private keys, or tokens are checked into this repository.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

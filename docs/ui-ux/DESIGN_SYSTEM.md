# EdgeSphere Design System Specification

**Version**: 2.0.0 (SaaS Edition)
**Status**: Authoritative Standard
**Maintainers**: Design Systems & UX Engineering

---

## 1. Visual Identity & Foundations

EdgeSphere employs a **Light Technical-Editorial** aesthetic designed for industrial edge computing and distributed TinyML. It blends the crisp visual clarity of modern enterprise SaaS (such as Untitled UI and Connexio) with the rigorous data density required by embedded systems engineering.

### 1.1 Core Token Palette

| Token | Value | Role / Usage | WCAG Contrast (on Canvas) |
|---|---|---|---|
| `--es-canvas` / `--surface-page` | `#F5F4FA` | Application background canvas (cool-neutral lavender) | N/A (Background) |
| `--es-surface` / `--surface-card` | `#FFFFFF` | Primary card, modal, and drawer surfaces | 1.08:1 (Subtle border separation) |
| `--es-surface-muted` | `#F8F8FB` | Secondary table headers, code blocks, and muted panels | Baseline |
| `--es-text` / `--color-neutral-900` | `#17171C` | Primary titles, table rows, and key numerical metrics | **15.2:1 (AAA Pass)** |
| `--es-text-secondary` | `#737487` | Labels, metadata, axis titles, and breadcrumbs | **4.9:1 (AA Pass)** |
| `--es-border` | `#E9E9F0` | Structural 1px borders, table dividers, card outlines | Visual delimiter |
| `--es-primary` / `--color-primary-500`| `#7756F5` | Brand action, active nav items, primary buttons | **5.1:1 on White (AA Pass)** |
| `--es-cyan` / `--color-cyan-500` | `#42DDE7` | Technical telemetry highlights, live pulse dots | Live streaming indicator |

### 1.2 Semantic Status Palette

Every status color is paired with a distinct icon and text label to adhere to WCAG 2.2 non-color-only communication:

| Semantic State | Foreground Token | Background Pill Token | Border Token | Meaning / Context |
|---|---|---|---|---|
| **Online / Normal** | `#16A36A` (`--es-success`) | `#E0F8EC` (`--es-success-bg`) | `#B6ECD1` | Connected hardware or healthy simulated node |
| **Warning / Awaiting** | `#B7791F` (`--es-warning`) | `#FFF4D6` (`--es-warning-bg`) | `#FDE4A4` | Awaiting hardware integration or elevated temperature |
| **Critical / Fault** | `#D83A4E` (`--es-danger`) | `#FDE8EC` (`--es-danger-bg`) | `#FAB8C2` | SPI Overrun fault, motor vibration anomaly, CRC failure |
| **Informational** | `#1677F8` (`--es-primary`) | `#EAF3FF` (`--es-info-bg`) | `#CCE1FE` | Workload migration event, FedAvg round execution |

---

## 2. Typography & Scale

EdgeSphere uses a dual-typeface typographic system:
- **Primary UI Sans**: System Sans-Serif (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `Roboto`) for high-legibility menus, headers, and descriptions.
- **Technical Monospace**: `'JetBrains Mono'`, `'SF Mono'`, `Consolas`, `monospace` for hexadecimal IDs, MAC addresses, parameter vectors, frequencies (`Hz`), and telemetry samples.

### 2.1 Typographic Scale

```css
--font-size-2xs:  0.6875rem; /* 11px - Micro metadata & hardware bus tags */
--font-size-xs:   0.75rem;   /* 12px - Table headers & badge labels */
--font-size-sm:   0.8125rem; /* 13px - Secondary body text & card subtitles */
--font-size-base: 0.875rem;  /* 14px - Standard UI body & input text */
--font-size-md:   1.0rem;    /* 16px - Card titles & prominent labels */
--font-size-lg:   1.125rem;  /* 18px - Section headers */
--font-size-xl:   1.375rem;  /* 22px - Modal headers & secondary page titles */
--font-size-2xl:  1.75rem;   /* 28px - Primary page headlines & hero KPIs */
```

---

## 3. Spacing, Radii, and Elevation

### 3.1 4px Spacing Grid
- `--space-1`: `4px` (Tight badge padding, icon gap)
- `--space-2`: `8px` (Button inline padding, input gap)
- `--space-3`: `12px` (Card inner element spacing)
- `--space-4`: `16px` (Standard card padding, compact gutters)
- `--space-6`: `24px` (Standard page section gap, card outer margins)
- `--space-8`: `32px` (Major layout split margins)

### 3.2 Border Radii
- Small (`--radius-sm`): `6px` (Buttons, inputs, dropdown menus)
- Medium (`--radius-md`): `10px` (Inner cards, status blocks, tabs)
- Large (`--radius-lg`): `14px` (Outer dashboard containers, modals)
- Pill (`--radius-pill`): `9999px` (Badges, toggle switches, filter pills)

### 3.3 Subtle Elevation
- `--shadow-xs`: `0 1px 2px rgba(20, 20, 40, 0.03)` (Card surface rest state)
- `--shadow-sm`: `0 2px 4px rgba(20, 20, 40, 0.05)` (Hover states, table rows)
- `--shadow-md`: `0 8px 20px -4px rgba(20, 20, 40, 0.08)` (Dropdown menus, modals)

---

## 4. Reusable Component Standards

### 4.1 Buttons & Action Hierarchy
- **Primary Button**: Solid Violet (`#7756F5`), White text, subtle 1px border. Reserved for one dominant workflow per screen (e.g., *Register Node*, *Execute FedAvg Round*).
- **Secondary / Outline Button**: White surface, `#E9E9F0` border, `#17171C` text. Used for view toggles, filters, exports.
- **Destructive Button**: Crimson outline/fill (`#D83A4E`) with explicit confirmation.
- **Icon Button**: Restrained 32x32px square with 6px radius and clear `aria-label`.

### 4.2 Technical Tables (Untitled UI Pattern)
- Fixed header with uppercase 11px muted labels (`#737487`).
- Hover row state with subtle background tint (`#F8F8FB`).
- Monospace styling for technical identifiers.
- Inline status badge with semantic dot indicator.
- Search input and filter pill row directly above table.
- Bottom footer with item count and pagination controls.

### 4.3 Data Visualizations & Charts
- Clean white card background with explicit titles and metric subtitles.
- Y-axis and X-axis clearly labelled with engineering units.
- Tooltips provide timestamp, data series name, value, and provenance disclosure.
- Responsive container with fallback loading skeletons.

import { useState } from 'react';
import { UnifiedKpiCards } from '@/components/dashboard/UnifiedKpiCards';
import { UnifiedAnalyticsGrid } from '@/components/dashboard/UnifiedAnalyticsGrid';
import { AllDaySummaryCard } from '@/components/dashboard/AllDaySummaryCard';
import { UnifiedDevicesTable } from '@/components/dashboard/UnifiedDevicesTable';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';
import { LiveNotificationsCard } from '@/components/dashboard/LiveNotificationsCard';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { AiInsightsCard } from '@/components/dashboard/AiInsightsCard';
import { TopNodesCard } from '@/components/dashboard/TopNodesCard';
import { HardwareTopologySection } from '@/components/dashboard/HardwareTopologySection';
import { NodeDetailModal } from '@/components/dashboard/NodeDetailModal';
import { ExplainableAiChatDrawer, FloatingAiChatButton } from '@/components/chat/ExplainableAiChatDrawer';

export function OverviewDashboard() {
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <div className="es-overview-unified-page">
      {/* 1. Four Unified KPI Cards in One Row (Connexio + Nexus AI) */}
      <UnifiedKpiCards />

      {/* 2. Main Analytics & Insights Asymmetrical Grid */}
      <div className="es-main-asymmetric-split">
        {/* Left Analytics Section (Connexio 2x2 Charts) */}
        <div className="es-main-analytics-col">
          <UnifiedAnalyticsGrid />
        </div>

        {/* Right Rail (Nexus AI Insights & Live Stream) */}
        <aside className="es-main-rail-col" aria-label="Edge Insights & Operations">
          <LiveNotificationsCard />
          <QuickActionsCard />
          <AiInsightsCard />
          <TopNodesCard />
        </aside>
      </div>

      {/* 3. MANDATORY Today's EdgeSphere Summary (Full-Width Card) */}
      <section className="es-summary-section-wrap" aria-label="Today's EdgeSphere Daily Audit">
        <AllDaySummaryCard />
      </section>

      {/* 4. Connexio Devices Status Table with Toggle Switches */}
      <section className="es-devices-table-section" aria-label="Device Control & Status">
        <UnifiedDevicesTable />
      </section>

      {/* 5. Nexus AI Recent Activity Table with Filter Pills */}
      <section className="es-activity-section" aria-label="Recent Audit Activity">
        <RecentActivityTable />
      </section>

      {/* 6. Hardware Engineering Topology & Simulator Controls (Expandable) */}
      <HardwareTopologySection />

      {/* 7. Node Detail Inspection Modal */}
      <NodeDetailModal />

      {/* 8. Persistent Floating AI Chat Button & Drawer */}
      <FloatingAiChatButton onClick={() => setAiChatOpen(true)} />
      <ExplainableAiChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
}

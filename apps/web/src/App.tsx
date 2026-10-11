import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { OverviewDashboard } from '@/pages/OverviewDashboard';
import { AnalyticsReporting } from '@/pages/AnalyticsReporting';
import { DevicesPage } from '@/pages/DevicesPage';
import { TelemetryPage } from '@/pages/TelemetryPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { ModelsPage } from '@/pages/ModelsPage';
import { DeploymentsPage } from '@/pages/DeploymentsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { BillingPage } from '@/pages/BillingPage';
import { TeamPage } from '@/pages/TeamPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PredictiveAiPage } from '@/pages/PredictiveAiPage';
import { SimulatorProvider } from '@/context/SimulatorContext';
import { NavigationProvider } from '@/context/NavigationContext';
import { useSimulator } from '@/context/SimulatorContext';
import type { NavRoute } from '@/components/layout/Sidebar';

function MainContent() {
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const { setSelectedNode, nodes } = useSimulator();

  const handleNavigate = (route: NavRoute, options?: { nodeId?: string }) => {
    setCurrentRoute(route);
    if (options?.nodeId) {
      const target = nodes.find((n) => n.id === options.nodeId);
      if (target) {
        setSelectedNode(target);
      }
    }
  };

  return (
    <NavigationProvider value={{ currentRoute, navigate: handleNavigate }}>
      <AppShell currentRoute={currentRoute} onNavigate={setCurrentRoute}>
        {currentRoute === 'dashboard' && <OverviewDashboard />}
        {currentRoute === 'devices' && <DevicesPage />}
        {currentRoute === 'telemetry' && <TelemetryPage />}
        {currentRoute === 'analytics' && <AnalyticsReporting />}
        {currentRoute === 'predictive-ai' && <PredictiveAiPage />}
        {currentRoute === 'alerts' && <AlertsPage />}
        {currentRoute === 'models' && <ModelsPage />}
        {currentRoute === 'deployments' && <DeploymentsPage />}
        {currentRoute === 'reports' && <ReportsPage />}
        {currentRoute === 'integrations' && <IntegrationsPage />}
        {currentRoute === 'billing' && <BillingPage />}
        {currentRoute === 'team' && <TeamPage />}
        {currentRoute === 'settings' && <SettingsPage />}
      </AppShell>
    </NavigationProvider>
  );
}

export function App() {
  return (
    <SimulatorProvider>
      <MainContent />
    </SimulatorProvider>
  );
}

export default App;

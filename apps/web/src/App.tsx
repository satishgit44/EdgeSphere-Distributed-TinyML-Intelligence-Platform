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
import type { NavRoute } from '@/components/layout/Sidebar';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');

  return (
    <SimulatorProvider>
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
    </SimulatorProvider>
  );
}

export default App;

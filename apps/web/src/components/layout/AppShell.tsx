import { useState, type ReactNode } from 'react';
import { Sidebar, type NavRoute } from './Sidebar';
import { TopBar } from './TopBar';
import { ExplainableAiChatDrawer, FloatingAiChatButton } from '@/components/chat/ExplainableAiChatDrawer';

interface AppShellProps {
  children: ReactNode;
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
}

export function AppShell({ children, currentRoute, onNavigate }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <div className={`es-nexus-app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="es-nexus-main-area" id="main-content">
        <TopBar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onOpenAiChat={() => setAiChatOpen(true)}
        />
        <main className="es-nexus-content">{children}</main>
      </div>

      {/* Persistent App-Wide Explainable AI Chat */}
      <FloatingAiChatButton onClick={() => setAiChatOpen(true)} />
      <ExplainableAiChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
}

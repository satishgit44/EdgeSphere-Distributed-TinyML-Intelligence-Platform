import { createContext, useContext, type ReactNode } from 'react';
import type { NavRoute } from '@/components/layout/Sidebar';

export interface NavigateOptions {
  nodeId?: string;
}

export interface NavigationContextValue {
  currentRoute: NavRoute;
  navigate: (route: NavRoute, options?: NavigateOptions) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  value,
  children,
}: {
  value: NavigationContextValue;
  children: ReactNode;
}) {
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

/* oxlint-disable react/only-export-components */
export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    return {
      currentRoute: 'dashboard',
      navigate: () => {},
    };
  }
  return ctx;
}

export const EDGE_SPHERE_TOKENS = {
  colors: {
    primary: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },
    cyan: {
      50: '#ECFEFF',
      100: '#CFFAFE',
      200: '#A5F3FC',
      300: '#67E8F9',
      400: '#22D3EE',
      500: '#06B6D4',
      600: '#0891B2',
    },
    semantic: {
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
      offline: '#9CA3AF',
    },
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  radii: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    pill: '9999px',
  },
} as const;

export type EdgeSphereTheme = typeof EDGE_SPHERE_TOKENS;

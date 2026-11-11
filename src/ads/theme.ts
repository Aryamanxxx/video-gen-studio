import { Easing } from 'remotion';

export const AdTheme = {
  colors: {
    bg: '#05070d',
    surface: 'rgba(15, 23, 42, 0.75)',
    surfaceBorder: 'rgba(255, 255, 255, 0.12)',
    primary: '#38bdf8', // Neon electric cyan
    secondary: '#818cf8', // Indigo
    accent: '#facc15', // Vibrant Gold
    danger: '#ef4444',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    gradientBrand: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
    gradientGold: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    gradientDark: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #05070d 80%)',
  },
  springs: {
    snappy: { damping: 12, stiffness: 220, mass: 0.8 },
    smooth: { damping: 18, stiffness: 140, mass: 1 },
    pop: { damping: 10, stiffness: 260, mass: 0.6 },
    bouncy: { damping: 8, stiffness: 180, mass: 0.9 },
  },
  easings: {
    cinematicOut: Easing.bezier(0.16, 1, 0.3, 1),
    anticipate: Easing.bezier(0.38, -0.4, 0.26, 1.4),
    smoothInOut: Easing.bezier(0.65, 0, 0.35, 1),
  },
};

import { CompanyTheme } from '@/types';

/** 4 palet: Nötr, Mavi, Kırmızı, Sarı – şirket Company Settings’ten seçer */
export const COLOR_PALETTES: Record<1 | 2 | 3 | 4, CompanyTheme> = {
  1: {
    primary: '#000000',
    primaryDark: '#f5f5f5',
    accent: '#000000',
    accentLight: '#e5e5e5',
    background: '#ffffff',
    cardBg: '#ffffff',
    text: '#000000',
    textMuted: '#000000',
  },
  2: {
    primary: '#1d4ed8',
    primaryDark: '#eff6ff',
    accent: '#2563eb',
    accentLight: '#dbeafe',
    background: '#ffffff',
    cardBg: '#f8fafc',
    text: '#0f172a',
    textMuted: '#475569',
  },
  3: {
    primary: '#b91c1c',
    primaryDark: '#fef2f2',
    accent: '#dc2626',
    accentLight: '#fee2e2',
    background: '#ffffff',
    cardBg: '#fafafa',
    text: '#1f2937',
    textMuted: '#6b7280',
  },
  4: {
    primary: '#b38600',
    primaryDark: '#fffbeb',
    accent: '#ffcc00',
    accentLight: '#fef9c3',
    background: '#ffffff',
    cardBg: '#fffbeb',
    text: '#1f2937',
    textMuted: '#6b7280',
  },
};

export const DEFAULT_PALETTE_ID = 1 as const;

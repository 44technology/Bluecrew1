import { CompanyTheme } from '@/types';

/** Apple/Uber tarzı: beyaz arka plan, siyah yazı – 3 palet */
export const COLOR_PALETTES: Record<1 | 2 | 3, CompanyTheme> = {
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
    primary: '#000000',
    primaryDark: '#fafafa',
    accent: '#171717',
    accentLight: '#f0f0f0',
    background: '#ffffff',
    cardBg: '#fafafa',
    text: '#000000',
    textMuted: '#000000',
  },
  3: {
    primary: '#171717',
    primaryDark: '#f5f5f5',
    accent: '#262626',
    accentLight: '#e5e5e5',
    background: '#ffffff',
    cardBg: '#ffffff',
    text: '#111827',
    textMuted: '#000000',
  },
};

export const DEFAULT_PALETTE_ID = 1 as const;

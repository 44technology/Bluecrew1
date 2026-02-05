import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, ColorPaletteId, CompanyTheme } from '@/types';
import { COLOR_PALETTES, DEFAULT_PALETTE_ID } from '@/constants/theme';
import { CompanyService } from '@/services/companyService';
import { useAuth } from '@/contexts/AuthContext';

interface ThemeContextType {
  company: Company | null;
  theme: CompanyTheme;
  paletteId: ColorPaletteId;
  setPaletteId: (id: ColorPaletteId) => void;
  refreshCompany: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [paletteId, setPaletteIdState] = useState<ColorPaletteId>(DEFAULT_PALETTE_ID);
  const [isLoading, setIsLoading] = useState(true);

  const loadCompany = async () => {
    const companyId = (user as any)?.company_id;
    if (!companyId) {
      setCompany(null);
      setPaletteIdState(DEFAULT_PALETTE_ID);
      setIsLoading(false);
      return;
    }
    try {
      const c = await CompanyService.getCompany(companyId);
      setCompany(c || null);
      if (c?.color_palette) setPaletteIdState(c.color_palette);
    } catch (e) {
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, [user?.id, (user as any)?.company_id]);

  const setPaletteId = (id: ColorPaletteId) => {
    setPaletteIdState(id);
    if (company?.id) {
      CompanyService.updateCompany(company.id, { color_palette: id }).catch(console.error);
    }
  };

  const theme = COLOR_PALETTES[paletteId] ?? COLOR_PALETTES[DEFAULT_PALETTE_ID];

  return (
    <ThemeContext.Provider
      value={{
        company,
        theme,
        paletteId,
        setPaletteId,
        refreshCompany: loadCompany,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

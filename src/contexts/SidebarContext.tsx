// src/contexts/SidebarContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  /** true em telas menores que 992px (a barra abre por cima do conteúdo) */
  isMobile: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  /** Fecha só no celular (ex.: depois de escolher uma página) */
  closeSidebarIfMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const MEDIA_MOBILE = '(max-width: 991.98px)';
const CHAVE_DESKTOP = 'cosup_sidebar_aberta';

const lerPreferenciaDesktop = () => {
  try {
    return localStorage.getItem(CHAVE_DESKTOP) !== 'false'; // padrão no computador: aberta
  } catch {
    return true;
  }
};

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MEDIA_MOBILE).matches);
  // Celular: sempre começa fechada. Computador: lembra a última escolha.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !window.matchMedia(MEDIA_MOBILE).matches && lerPreferenciaDesktop());

  // Acompanha a mudança de tamanho/rotação da tela
  useEffect(() => {
    const mq = window.matchMedia(MEDIA_MOBILE);
    const aoMudar = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      setIsSidebarOpen(e.matches ? false : lerPreferenciaDesktop());
    };
    mq.addEventListener('change', aoMudar);
    return () => mq.removeEventListener('change', aoMudar);
  }, []);

  // Celular: tecla Esc fecha a barra
  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && setIsSidebarOpen(false);
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [isMobile, isSidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((aberta) => {
      const nova = !aberta;
      if (!window.matchMedia(MEDIA_MOBILE).matches) {
        try {
          localStorage.setItem(CHAVE_DESKTOP, String(nova));
        } catch {
          /* sem localStorage: só não lembra */
        }
      }
      return nova;
    });
  }, []);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const closeSidebarIfMobile = useCallback(() => {
    if (window.matchMedia(MEDIA_MOBILE).matches) setIsSidebarOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isSidebarOpen, isMobile, toggleSidebar, closeSidebar, closeSidebarIfMobile }),
    [isSidebarOpen, isMobile, toggleSidebar, closeSidebar, closeSidebarIfMobile],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

// Hook customizado para facilitar o uso
// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar deve ser usado dentro de um SidebarProvider');
  }
  return context;
};

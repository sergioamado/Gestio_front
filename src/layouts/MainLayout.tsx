// src/layouts/MainLayout.tsx
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useSidebar } from '../contexts/SidebarContext';

interface MainLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

const MainLayout = ({ children, pageTitle }: MainLayoutProps) => {
  const { isSidebarOpen, isMobile, toggleSidebar, closeSidebar, closeSidebarIfMobile } = useSidebar();
  const { pathname } = useLocation();

  // Celular: ao trocar de página, a barra lateral fecha.
  useEffect(() => {
    closeSidebarIfMobile();
  }, [pathname, closeSidebarIfMobile]);

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      <div className="sidebar-wrapper" id="menu-lateral">
        <Sidebar />
      </div>

      {/* Celular: fundo escurecido; tocar fora fecha a barra */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} aria-hidden="true" />
      )}

      <div className="main-content">
        <Header title={pageTitle} onToggleSidebar={toggleSidebar} />
        <div className="page-content">
          <main>{children}</main>
        </div>
      </div>

    </div>
  );
};

export default MainLayout;

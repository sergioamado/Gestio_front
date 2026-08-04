// src/layouts/MainLayout.tsx
import type { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { NotificationRadar } from '../components/notificacoes/NotificationRadar';
import { useSidebar } from '../contexts/SidebarContext'; 

interface MainLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

const MainLayout = ({ children, pageTitle }: MainLayoutProps) => {
  // Consumimos o estado e a função diretamente do contexto global
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      
      <NotificationRadar />

      {/* Div responsável pela barra lateral (controlada via CSS Flexbox) */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      
      {/* Div que abraça a tela e se autoajusta */}
      <div className="main-content">
        <Header title={pageTitle} onToggleSidebar={toggleSidebar} />
        <div style={{ padding: '1.5rem' }}> 
          <main>{children}</main>
        </div>
      </div>

    </div>
  );
};

export default MainLayout;
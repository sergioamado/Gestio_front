// src/layouts/MainLayout.tsx
import { useEffect } from 'react'; // 
import type { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { NotificationRadar } from '../components/notificacoes/NotificationRadar';
import { useSidebar } from '../contexts/SidebarContext'; 
import { useAuth } from '../hooks/useAuth'; // 
import { socket } from '../services/socket'; // 

interface MainLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

const MainLayout = ({ children, pageTitle }: MainLayoutProps) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { user } = useAuth(); // Pegamos o utilizador logado

  // MOTOR DE LIGAÇÃO (Obriga o utilizador a entrar na sala dele)
  useEffect(() => {
    if (user && user.id) {
      if (!socket.connected) {
        socket.connect(); 
      }
      socket.emit('identificar_usuario', user.id);
    }
  }, [user]);
  // ====================================================================

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      
      <NotificationRadar />

      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      
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
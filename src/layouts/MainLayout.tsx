// src/layouts/MainLayout.tsx
import type { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useSidebar } from '../contexts/SidebarContext'; 

interface MainLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

const MainLayout = ({ children, pageTitle }: MainLayoutProps) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

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
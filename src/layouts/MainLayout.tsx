// src/layouts/MainLayout.tsx
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

const MainLayout = ({ children, pageTitle }: MainLayoutProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    // Adiciona uma classe quando a sidebar está aberta
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="main-content">
        <Header title={pageTitle} onToggleSidebar={handleToggleSidebar} />
        <div style={{ padding: '1.5rem' }}> 
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
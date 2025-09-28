// src/layouts/MainLayout.tsx
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

const MainLayout = ({ children, pageTitle }: MainLayoutProps) => {
  return (
    <div className="app-layout">
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="main-content">
        <Header title={pageTitle} />
        <div style={{ padding: '2rem' }}>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
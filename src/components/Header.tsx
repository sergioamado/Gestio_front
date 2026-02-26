// src/components/Header.tsx
import { useAuth } from '../hooks/useAuth';
import { List } from 'react-bootstrap-icons';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

function Header({ title, onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  return (
    <header className="app-header">
        <div className='d-flex justify-content-between align-items-center'>
            <div className="d-flex align-items-center">
              <button className="sidebar-toggle-btn me-3" onClick={onToggleSidebar}>
                <List size={30} />
              </button>
              <h4 className="m-0 text-primary header-title">{title}</h4>
            </div>
            <span className="text-muted d-none d-md-block">Logado como: {user?.nome_completo}</span>
        </div>
    </header>
  );
}

export default Header;
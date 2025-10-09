// src/components/Header.tsx
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const { user } = useAuth();
  return (
    
    <header className="app-header">
        <div className='d-flex justify-content-between align-items-center'>
            <h4 className="m-0">{title}</h4>
            <span className="text-muted">Logado como: {user?.nome_completo}</span>
        </div>
    </header>
  );
}

export default Header;
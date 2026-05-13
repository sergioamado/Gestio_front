// src/components/Header.tsx
import { useAuth } from '../hooks/useAuth';
import { List, PersonCircle } from 'react-bootstrap-icons';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

function Header({ title, onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  
  
  const formatRole = (role?: string) => {
    if (!role) return '';
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'gerente': 'Gerente de Unidade',
      'tecnico': 'Técnico',
      'tecnico_impressora': 'Técnico de Impressoras',
      'tecnico_eletronica': 'Técnico de Eletrônica'
    };
    return roleMap[role] || role;
  };

  return (
    <header className="bg-white border-bottom shadow-sm px-4 py-3 sticky-top" style={{ zIndex: 1000 }}>
        <div className='d-flex justify-content-between align-items-center'>
            
            {/* Título da Página e Botão do Menu */}
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-link text-secondary p-0 me-3 shadow-none border-0" 
                onClick={onToggleSidebar}
                title="Alternar Menu Lateral"
                style={{ transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.classList.replace('text-secondary', 'text-primary')}
                onMouseOut={(e) => e.currentTarget.classList.replace('text-primary', 'text-secondary')}
              >
                <List size={28} />
              </button>
              <h4 className="m-0 fw-bold text-dark">{title}</h4>
            </div>
            
            {/* Perfil do Usuário Logado */}
            <div className="d-none d-md-flex align-items-center">
               <div className="text-end me-3">
                 <span className="d-block fw-bold text-dark lh-1 mb-1" style={{ fontSize: '0.9rem' }}>
                    {user?.nome_completo || 'Usuário do Sistema'}
                 </span>
                 <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {formatRole(user?.role)}
                 </span>
               </div>
               <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center text-primary shadow-sm border">
                 <PersonCircle size={24} />
               </div>
            </div>
            
        </div>
    </header>
  );
}

export default Header;
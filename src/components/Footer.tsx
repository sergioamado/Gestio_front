// src/components/Footer.tsx
import React from 'react';

interface FooterProps {
  theme?: 'light' | 'dark';
}

const Footer: React.FC<FooterProps> = ({ theme = 'light' }) => {
  const currentYear = new Date().getFullYear();
  const isDark = theme === 'dark';

  return (
    <footer 
      className={`w-100 py-4 mt-auto text-center ${isDark ? 'text-white-50' : 'text-secondary'}`}
      style={{ fontSize: '0.85rem', letterSpacing: '0.5px', backgroundColor: 'transparent' }}
    >
      <span className="fw-medium">&copy; {currentYear} COSUP / UFS</span>
      
      <span className="mx-2 opacity-25">|</span>
      
      <span>
        Desenvolvido por{' '}
        <a
          href="https://www.linkedin.com/in/sergio-santana-dos-santos-7a8b052b/"
          target="_blank"
          rel="noopener noreferrer"
          className={`fw-bold text-decoration-none ${isDark ? 'text-light' : 'text-primary'}`}
          style={{ transition: 'opacity 0.2s ease-in-out' }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Sergio Amado Santana
        </a>
      </span>
    </footer>
  );
};

export default Footer;
// src/components/Footer.tsx
import React from 'react';

const footerStyle: React.CSSProperties = {
  padding: '1rem 0',
  textAlign: 'center',
  width: '100%',
  marginTop: 'auto',
};

const lightTextFooterStyle: React.CSSProperties = {
  ...footerStyle,
  color: '#f8f9fa', 
};

const darkTextFooterStyle: React.CSSProperties = {
  ...footerStyle,
  color: '#6c757d', 
  backgroundColor: '#f8f9fa', 
  borderTop: '1px solid #e7e7e7', 
};

const linkLightStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#ffffff',
  fontWeight: 500,
};

const linkDarkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#034EA2',
  fontWeight: 500,
};

const Footer = ({ theme = 'dark' }: { theme?: 'light' | 'dark' }) => {
  const currentYear = new Date().getFullYear();
  const isDark = theme === 'dark';

  return (
    <footer style={isDark ? lightTextFooterStyle : darkTextFooterStyle}>
      © {currentYear} - Desenvolvido por{' '}
      <a
        href="https://www.linkedin.com/in/sergio-santana-dos-santos-7a8b052b/"
        target="_blank"
        rel="noopener noreferrer"
        style={isDark ? linkLightStyle : linkDarkStyle}
      >
        Sergio Amado Santana
      </a>
    </footer>
  );
};

export default Footer;
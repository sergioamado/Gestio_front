import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Bootstrap primeiro e o CSS do sistema depois: assim os estilos do COSUP+
// (fundo, fonte, links) prevalecem sobre os padrões do Bootstrap.
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

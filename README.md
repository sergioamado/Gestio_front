# Gestio / COSUP+ — Front-end

Front-end em React 18 + TypeScript + Vite + React Bootstrap para gestão de chamados, estoque de peças,
impressoras/suprimentos, manutenção eletrônica, patrimônio e produção de serviços.

## Rodando

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL para o endereço do backend
npm run dev            # http://localhost:5173
```

| Script            | O que faz                                    |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento (exposto na rede) |
| `npm run build`   | Typecheck (`tsc`) + build de produção em `dist/` |
| `npm run lint`    | ESLint (falha com qualquer aviso)            |
| `npm run format`  | Prettier em `src/`                           |

## Configuração

- `VITE_API_URL` — URL da API **incluindo** `/api` (ex.: `http://10.110.1.69:3001/api`).
  O socket e as fotos usam a mesma origem, sem o `/api`. Tudo é derivado em `src/config.ts`.

## Estrutura

```
src/
  config.ts          URLs do backend (fonte única)
  services/          chamadas HTTP (axios) e socket
  contexts/          Auth, Toast, Confirm, Sidebar
  routes/            ProtectedRoute (login + papéis)
  utils/permissions  papéis por módulo, usados nas rotas e no menu
  pages/ components/ telas e componentes por módulo
  types/             tipos compartilhados
```

## Papéis

`admin`, `gerente`, `tecnico`, `tecnico_impressora`, `tecnico_eletronica`.
O acesso por módulo está em `src/utils/permissions.ts`. Esse controle é só de interface:
**o backend deve validar o papel em todas as rotas**.

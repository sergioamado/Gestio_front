# COSUP+ · Sistema de Gestão

O COSUP+ (projeto **Gestio**) é o sistema web da Coordenação de Suporte (COSUP) da UFS. Ele reúne o trabalho do suporte técnico em um só lugar:

- **Ordens de Serviço (OS)** com pedido de peças ao almoxarifado, peças de teste e de consumo, e devolução;
- **estoque de peças**, com estoque principal, de teste e de peças com defeito;
- **impressoras**: cadastro, atendimentos técnicos, impressora reserva, e entrada e saída de toners;
- **manutenção eletrônica**, uma fila de bancada com laudo técnico;
- **patrimônio**: inventário de bens, importação do SIPAC, transferências, bens atribuídos a técnicos e auditoria física (levantamento);
- **produção de serviços**: o técnico lança o que fez e o sistema calcula quanto o serviço custaria fora da instituição;
- **relatórios**: Dashboard Executivo de Produção, o **Montar Relatório** (detalhado ou cruzado, em PDF, com modelos salvos) e análises (BI);
- **Relatório Analítico**, o laudo de equipamento inservível: o técnico emite, o gerente assina eletronicamente e o PDF sai no modelo oficial;
- **notificações** em tempo real (cards no sistema) e pelo Telegram (@CosupBot).

O sistema tem dois repositórios:

| Repositório   | Tecnologia                                              | Papel                                    |
| ------------- | ------------------------------------------------------- | ---------------------------------------- |
| `Gestio_front` (este) | React 18, TypeScript, Vite, React Bootstrap     | Interface web (desktop e celular)        |
| `Gestio_back` | Node.js, Express 5, Prisma 6, PostgreSQL, Socket.IO     | API REST, regras de negócio, tempo real, bot do Telegram |

---

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Requisitos](docs/01-requisitos.md) | Requisitos funcionais, não funcionais e inversos |
| [Casos de uso](docs/02-casos-de-uso.md) | Diagrama de casos de uso e a descrição de cada caso |
| [Diagrama de classes](docs/03-diagrama-de-classes.md) | Classes do domínio e seus relacionamentos |
| [Diagrama entidade-relacionamento](docs/04-diagrama-er.md) | Tabelas do banco e chaves |
| [Arquitetura](docs/05-arquitetura.md) | Componentes, camadas, implantação e segurança |
| [Diagramas de fluxo](docs/06-diagramas-de-fluxo.md) | Ciclo da OS, das peças, do Relatório Analítico, do login e mais |
| [Diagramas de sequência](docs/07-diagramas-de-sequencia.md) | Login, OS, assinatura, Telegram, Montar Relatório |
| [Tutorial do sistema](docs/08-tutorial.md) | Passo a passo de todas as telas, por perfil |
| [Implantação em produção](docs/09-implantacao.md) | Passo a passo para instalar no Ubuntu Server em cosupmais.ufs.br |

---

## Perfis de usuário

| Perfil | Quem é | O que faz |
| --- | --- | --- |
| `admin` | Administrador do sistema | Cadastra usuários e unidades e vê tudo de todas as unidades (por isso não tem unidade). Nas OS e nos Relatórios Analíticos **só visualiza**. |
| `gerente` | Coordenador ou gerente de uma unidade | Gere as OS, o estoque e o patrimônio, assina Relatórios Analíticos e gera relatórios **da própria unidade**. |
| `tecnico` | Técnico de suporte | Abre OS, retira e devolve peças, lança produção e emite Relatórios Analíticos. Quem abriu a OS e o técnico responsável podem agir nela. |
| `tecnico_impressora` | Técnico de impressoras | O mesmo do técnico, mais o módulo de impressoras e suprimentos. |
| `tecnico_eletronica` | Técnico de eletrônica | O mesmo do técnico, mais a fila de manutenção eletrônica. |

O acesso por módulo, no front, fica em [src/utils/permissions.ts](src/utils/permissions.ts). Esse controle serve só para montar a interface: **o backend valida o perfil e a unidade em todas as rotas**.

---

## Como rodar

### Pré-requisitos

- Node.js 20 ou mais novo;
- PostgreSQL 14 ou mais novo;
- opcional: um bot do Telegram criado no @BotFather.

### Backend (`Gestio_back`)

```bash
cd Gestio_back
npm install
# crie o .env (veja abaixo)
npx prisma migrate deploy   # aplica as migrações no banco
npx prisma generate
npx tsx seed.ts             # opcional: dados iniciais
npm run dev                 # http://localhost:3001
```

Variáveis do `.env` do backend:

| Variável | Para que serve |
| --- | --- |
| `DATABASE_URL` | Conexão com o PostgreSQL (`postgresql://usuario:senha@host:5432/banco`) |
| `SHADOW_DATABASE_URL` | Banco auxiliar usado pelo `prisma migrate dev` (só em desenvolvimento) |
| `JWT_SECRET` | Segredo que assina os tokens de login. Use um valor longo e aleatório. |
| `TELEGRAM_BOT_TOKEN` | Token do bot. Sem ele, o sistema funciona sem o Telegram. |
| `TELEGRAM_BOT_USERNAME` | Nome do bot sem o @ (ex.: `CosupBot`), usado no link de vínculo |

> Só um servidor pode usar o mesmo bot ao mesmo tempo. Com dois rodando, o Telegram responde com erro 409.

### Frontend (`Gestio_front`)

```bash
cd Gestio_front
npm install
cp .env.example .env   # ajuste VITE_API_URL
npm run dev            # http://localhost:5173
```

- `VITE_API_URL` é a URL da API **incluindo** `/api` (ex.: `http://10.110.1.69:3001/api`). O socket e as fotos usam a mesma origem sem o `/api`. Tudo é derivado em [src/config.ts](src/config.ts).

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento, exposto na rede |
| `npm run build` | Verificação de tipos (`tsc`) e build de produção em `dist/` |
| `npm run lint` | ESLint (falha com qualquer aviso) |
| `npm run format` | Prettier em `src/` |

### Produção

1. Backend: `npm run build`, depois `npx prisma migrate deploy`, depois `npm start`, de preferência com um gerenciador de processos como pm2 ou systemd.
2. Frontend: `npm run build`, e publique a pasta `dist/` num servidor web (Nginx, Apache). Configure o servidor para devolver o `index.html` em qualquer rota, porque o roteamento é feito no navegador.
3. Use HTTPS na frente dos dois.

---

## Estrutura do front

```
src/
  App.tsx            rotas (carregadas sob demanda) e provedores
  config.ts          URLs do backend (fonte única)
  services/          chamadas HTTP (axios) e socket
  contexts/          Auth, Toast, Confirm, Sidebar
  routes/            ProtectedRoute (login + perfis)
  utils/permissions  perfis por módulo, usados nas rotas e no menu
  components/        componentes por módulo (relatórios, PDF, notificações...)
  pages/             telas por módulo
  types/             tipos compartilhados
  assets/            logo e marca-d'água da UFS (PDFs)
```

## Estrutura do back

```
src/
  server.ts          Express, CORS, rotas /api/*, Socket.IO
  socket.ts          Socket.IO com autenticação JWT no handshake
  middlewares/       autenticação e checagem de perfil; upload (multer)
  routes/            uma rota por módulo
  controllers/       regras de cada módulo
  rules/             regras puras da OS e das peças (transições de status)
  relatorios/        fontes de dados e motor do Montar Relatório
  security/          bloqueio progressivo de login
prisma/
  schema.prisma      modelo de dados
  migrations/        histórico de migrações
```

## Principais regras de negócio

- **OS:** o técnico abre a OS. O gerente coloca em atendimento, conclui depois da vistoria ou cancela. O técnico marca "Pronta para vistoria". O admin só visualiza.
- **Peças da OS:** as peças são reservadas no estoque quando a OS é aberta. O gerente informa em cada peça o **nº do pedido SIPAC** e o **almoxarifado**, e a OS só é concluída com os dois preenchidos. Ao cancelar a OS, as peças voltam ao estoque correspondente (principal, de teste ou de defeito).
- **Unidade:** o gerente só vê e age sobre a própria unidade; o admin vê todas (por isso não tem unidade).
- **Patrimônio:** o gerente **transfere** bens da unidade dele para outra (o bem passa a ser do destino e sai da lista da origem) e **atribui** bens aos técnicos da unidade (o bem continua na unidade, mostrando com quem está). Ex.: uma mesa transferida do COSUP para o DCOMP sai da lista do COSUP; o computador PAT 119171 atribuído ao Sergio continua na lista do COSUP com "👤 Sergio".
- **Login:** a cada 3 senhas erradas seguidas o usuário espera 10 s, depois 20 s, 40 s e assim por diante, dobrando até 24 h.
- **Relatório Analítico:** recebe um número sequencial por unidade e ano **na assinatura**. O documento assinado é guardado como "fotografia" e tem um código de verificação. Anular mantém o número reservado.

A lista completa está em [docs/01-requisitos.md](docs/01-requisitos.md).

## Licença e créditos

Sistema interno da COSUP/UFS.

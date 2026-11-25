# Diagramas de sequência

[← Voltar ao README](../README.md)

## 1. Login

```mermaid
sequenceDiagram
  autonumber
  actor U as Usuário
  participant F as Front (LoginPage)
  participant A as API /auth/login
  participant T as loginThrottle
  participant DB as PostgreSQL
  participant S as Socket.IO

  U->>F: usuário + senha
  F->>A: POST /api/auth/login
  A->>T: tempoBloqueado(usuário)
  alt bloqueado
    T-->>A: tempo restante
    A-->>F: 429 "Aguarde X"
    F-->>U: mostra a espera
  else livre
    A->>DB: busca o usuário
    A->>A: confere o hash (argon2 ou bcrypt)
    alt senha errada
      A->>T: registrarFalha()
      A-->>F: 401 Credenciais inválidas
    else senha certa
      A->>T: registrarSucesso()
      A->>A: gera o JWT (id, perfil, unidade)
      A-->>F: 200 token + usuário
      F->>F: guarda no AuthContext
      F->>S: conecta com auth.token
      S->>S: valida o JWT e entra na sala user_id
      F-->>U: Painel Inicial
    end
  end
```

## 2. Abrir uma OS

```mermaid
sequenceDiagram
  autonumber
  actor T as Técnico
  participant F as Front (NovaSolicitacaoPage)
  participant A as API /solicitacoes
  participant DB as PostgreSQL
  participant N as Notificações
  participant S as Socket.IO

  T->>F: preenche a OS, o tipo (consumo/teste) e as peças
  F->>F: valida os campos obrigatórios
  F->>A: POST /api/solicitacoes (JWT)
  A->>A: tecnicoOnlyMiddleware + validação Zod
  A->>DB: BEGIN
  A->>DB: cria a OS (PENDENTE)
  loop cada peça
    A->>DB: desconta do estoque só se houver saldo (operação atômica)
    alt sem saldo
      A->>DB: ROLLBACK
      A-->>F: 400 "Estoque insuficiente para: peça"
    end
    A->>DB: cria a peça da OS (Pendente)
  end
  A->>DB: COMMIT
  A->>N: notificar o técnico "OS gerada"
  N->>S: nova_notificacao → sala user_ID do técnico
  A->>S: atualizar_estoque (todos)
  A-->>F: 201 OS criada
  F-->>T: toast de sucesso
```

## 3. Cancelar uma OS (devolução ao estoque)

```mermaid
sequenceDiagram
  autonumber
  actor G as Gerente
  participant F as Front (GerenciarSolicitacoesPage)
  participant A as API PUT /solicitacoes/:id
  participant R as solicitacaoRules
  participant DB as PostgreSQL
  actor T as Técnico

  G->>F: Cancelar OS (confirma)
  F->>A: PUT status = CANCELADA
  A->>A: confere perfil gerente e unidade da OS
  A->>R: podeMudarStatusOS(gerente, atual, CANCELADA)
  R-->>A: permitido
  A->>DB: BEGIN
  loop cada peça da OS
    A->>R: efeitoCancelamento(tipo_uso, status)
    R-->>A: estoque+ / teste+ / defeito+ / nenhum
    A->>DB: soma no estoque certo e marca a peça Cancelado
  end
  A->>DB: OS = CANCELADA
  A->>DB: COMMIT
  A-->>F: 200
  A--)T: notificação "OS cancelada"
```

## 4. Assinar um Relatório Analítico

```mermaid
sequenceDiagram
  autonumber
  actor G as Gerente da unidade
  participant F as Front (RelatoriosAnaliticosPage)
  participant A as API /relatorios-analiticos
  participant DB as PostgreSQL
  participant P as gerarPdfRelatorioAnalitico
  actor T as Técnico

  G->>F: abre o relatório PENDENTE
  F->>A: GET /cargo-sugerido
  A-->>F: último cargo usado
  G->>F: confirma o cargo e clica Assinar
  F->>A: POST /:id/assinar { cargo }
  A->>A: exigirGerenteDaUnidade()
  A->>DB: BEGIN
  A->>DB: MAX(numero) da unidade no ano
  A->>DB: grava numero+1, assinante, cargo, data,<br/>fotografia (JSON) e código SHA-256
  alt dois gerentes assinam ao mesmo tempo
    DB-->>A: viola o índice único (unidade, ano, número)
    A->>DB: tenta de novo com o próximo número
  end
  A->>DB: COMMIT
  A--)T: notificação "Relatório assinado nº 002/2026"
  A-->>F: 200 relatório assinado
  G->>F: Baixar PDF
  F->>P: gera a partir da fotografia
  P-->>G: PDF oficial com nº, assinatura e código
```

## 5. Montar Relatório e baixar PDF

```mermaid
sequenceDiagram
  autonumber
  actor G as Gestor
  participant F as Front (MontarRelatorio)
  participant A as API /relatorios/personalizado
  participant M as motor.ts
  participant FT as fontes.ts
  participant DB as PostgreSQL
  participant P as gerarPdf (jsPDF, sob demanda)

  F->>A: GET /fontes
  A-->>F: fontes e campos disponíveis
  G->>F: escolhe fonte, tipo, colunas, filtros, período
  G->>F: Ver prévia
  F->>A: POST /gerar { configuração }
  A->>A: gerente → força a própria unidade
  A->>M: gerar(config, contexto)
  M->>FT: busca da fonte (unidade, período)
  FT->>DB: consulta Prisma
  DB-->>FT: registros
  FT-->>M: linhas
  M->>M: filtra, ordena e agrupa (cruzado)<br/>soma só campos agregáveis
  M-->>A: colunas, linhas, totais
  A-->>F: resultado + cabeçalho (quem, unidade, período)
  F-->>G: tabela de prévia
  G->>F: Baixar PDF
  F->>P: import() de jsPDF e autotable
  P->>P: cabeçalho em todas as páginas,<br/>tabela, totais, "Página X de Y"
  P-->>G: download do PDF
  opt Salvar como modelo
    G->>F: nome, descrição, compartilhado
    F->>A: POST /modelos
    A->>DB: grava relatorio_modelos
  end
```

## 6. Vincular Telegram

```mermaid
sequenceDiagram
  autonumber
  actor U as Usuário
  participant F as Front (sininho)
  participant A as API /notificacoes
  participant DB as PostgreSQL
  participant B as Bot (@CosupBot)
  participant TG as Telegram
  participant S as Socket.IO

  U->>F: Telegram → Vincular
  F->>A: GET /telegram/gerar-link
  A->>DB: grava telegram_token (uso único)
  A-->>F: https://t.me/CosupBot?start=TOKEN
  U->>TG: abre o link e toca Iniciar
  TG->>B: /start TOKEN
  B->>DB: busca o usuário pelo token
  alt token válido
    B->>DB: desvincula o chat de outra conta, se houver
    B->>DB: grava telegram_chat_id, apaga o token
    B->>TG: "✅ Conta vinculada"
    B->>S: telegram_vinculado → sala user_id
    S-->>F: atualiza a tela
  else inválido ou usado
    B->>TG: "❌ Link inválido. Gere um novo."
  end
```

## 7. Notificação em tempo real

```mermaid
sequenceDiagram
  autonumber
  participant C as Controller (qualquer módulo)
  participant N as criarNotificacao
  participant DB as PostgreSQL
  participant S as Socket.IO
  participant R as NotificationRadar (front)
  participant B as Bot Telegram
  actor U as Usuário

  C->>N: usuário, título, mensagem, tipo, link
  N->>DB: busca as preferências do usuário
  alt notificações no sistema ligadas
    N->>DB: INSERT notificacoes
    N->>S: emit nova_notificacao → user_ID
    S->>R: evento
    R-->>U: card na tela + contador do sininho
  end
  alt Telegram vinculado e ligado
    N->>B: enviar(chat_id, texto em Markdown)
    alt Telegram recusa a formatação
      B->>B: reenvia sem marcação
    end
    B-->>U: mensagem no Telegram
  end
```

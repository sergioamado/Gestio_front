# Diagramas de fluxo

[← Voltar ao README](../README.md)

## 1. Ciclo de vida da Ordem de Serviço (OS)

```mermaid
stateDiagram-v2
  [*] --> PENDENTE : Técnico abre a OS
  PENDENTE --> EM_ATENDIMENTO : Gerente coloca em atendimento
  EM_ATENDIMENTO --> PRONTA_PARA_VISTORIA : Técnico conclui o serviço
  PRONTA_PARA_VISTORIA --> CONCLUIDA : Gerente faz a vistoria e conclui
  PENDENTE --> CANCELADA : Gerente cancela
  EM_ATENDIMENTO --> CANCELADA : Gerente cancela
  PRONTA_PARA_VISTORIA --> CANCELADA : Gerente cancela
  CONCLUIDA --> [*]
  CANCELADA --> [*] : peças voltam ao estoque

  note right of CANCELADA
    Ao cancelar, cada peça volta
    ao estoque de origem
    (principal, teste ou defeito).
  end note
```

O admin vê todos os estados, mas não executa nenhuma transição. O gerente só executa transições em OS da própria unidade.

## 2. Ciclo de vida da peça da OS

```mermaid
stateDiagram-v2
  direction LR
  [*] --> Pendente_almoxarifado : OS aberta (estoque reservado)
  Pendente_almoxarifado --> Disponivel_para_retirada : Gerente libera
  Disponivel_para_retirada --> Pendente_almoxarifado : Gerente volta

  Disponivel_para_retirada --> Em_posse_do_tecnico : Técnico "Recebi" (consumo)
  Disponivel_para_retirada --> Aguardando_devolucao : Técnico "Recebi" (teste)

  Aguardando_devolucao --> Em_posse_do_tecnico : "Funcionou" → vira consumo
  Aguardando_devolucao --> Devolucao_aceite : Gerente aceita (peça boa → estoque de teste)

  Disponivel_para_retirada --> Devolvida : Técnico devolve com defeito
  Em_posse_do_tecnico --> Devolvida : Técnico devolve com defeito
  Aguardando_devolucao --> Devolvida : Técnico devolve com defeito
  Devolvida --> Devolucao_aceite : Gerente aceita (→ estoque de defeito)

  Pendente_almoxarifado --> Cancelado : OS cancelada
  Disponivel_para_retirada --> Cancelado : OS cancelada
  Em_posse_do_tecnico --> Cancelado : OS cancelada
  Aguardando_devolucao --> Cancelado : OS cancelada
  Devolvida --> Cancelado : OS cancelada

  Em_posse_do_tecnico --> [*]
  Devolucao_aceite --> [*]
  Cancelado --> [*]
```

### Efeito no estoque de cada movimento

| Movimento | Peça de consumo | Peça de teste |
| --- | --- | --- |
| Técnico devolve com defeito (motivo obrigatório) | +1 no estoque de **defeito** | nenhum (aguarda o aceite) |
| Gerente aceita devolução de peça boa | — | +1 no estoque de **teste** |
| Gerente aceita devolução de peça com defeito | nenhum (já contou na devolução) | +1 no estoque de **defeito** |
| OS cancelada com a peça pendente, disponível ou com o técnico | +1 no estoque **principal** | +1 no estoque de **teste** |
| OS cancelada com a peça devolvida | nenhum | +1 no estoque de **defeito** |

## 3. Abertura e atendimento da OS (fluxo de atividades)

```mermaid
flowchart TD
  A([Início]) --> B[Técnico abre Nova Solicitação]
  B --> C[Informa GLPI, patrimônio, setor e justificativa]
  C --> D[Escolhe consumo ou teste e adiciona as peças]
  D --> E{Há saldo no estoque?}
  E -- Não --> D
  E -- Sim --> F[Estoque reservado<br/>OS criada como PENDENTE]
  F --> G[Gerente coloca EM ATENDIMENTO]
  G --> G2[Gerente informa nº do pedido SIPAC<br/>e almoxarifado de cada peça]
  G2 --> H[Gerente libera as peças<br/>Disponível para retirada]
  H --> I[Técnico retira e confirma Recebi]
  I --> J{Peça de teste?}
  J -- Sim --> K{Funcionou?}
  K -- Sim --> L[Converte em consumo]
  K -- Não --> M[Devolve a peça de teste]
  M --> N[Gerente aceita a devolução]
  J -- Não --> O[Usa a peça no equipamento]
  L --> O
  N --> P
  O --> P[Técnico marca PRONTA PARA VISTORIA]
  P --> Q{Gerente aprova<br/>a vistoria?}
  Q -- Sim --> Q2{Todas as peças têm<br/>SIPAC e almoxarifado?}
  Q2 -- Não --> G2
  Q2 -- Sim --> R[OS CONCLUÍDA]
  Q -- Não --> G
  R --> S[Técnico lança a produção]
  S --> Z([Fim])
```

## 4. Relatório Analítico

```mermaid
stateDiagram-v2
  [*] --> PENDENTE : Técnico emite (minuta)
  PENDENTE --> ASSINADO : Gerente da unidade assina\n(recebe nº/ano e código)
  PENDENTE --> DEVOLVIDO : Gerente devolve com motivo
  DEVOLVIDO --> PENDENTE : Técnico corrige e reenvia
  PENDENTE --> [*] : Técnico exclui
  DEVOLVIDO --> [*] : Técnico exclui
  ASSINADO --> ANULADO : Gerente anula com motivo\n(o número fica reservado)
  ASSINADO --> [*]
  ANULADO --> [*]
```

```mermaid
flowchart TD
  A([Equipamento sem conserto]) --> B[Técnico: Novo Relatório Analítico]
  B --> C[Digita equipamentos e patrimônios]
  C --> D[Confere a minuta em PDF]
  D --> E[Envia → PENDENTE<br/>gerentes da unidade notificados]
  E --> F{Gerente da unidade<br/>confere}
  F -- Tem erro --> G[Devolve com motivo]
  G --> H[Técnico corrige] --> E
  F -- Está certo --> I[Confirma o cargo e assina]
  I --> J[Sistema dá o nº sequencial da unidade no ano]
  J --> K[Guarda a fotografia do documento<br/>e gera o código de verificação]
  K --> L[PDF oficial disponível<br/>técnico notificado]
  L --> M{Precisa refazer?}
  M -- Não --> Z([Fim])
  M -- Sim --> N[Gerente anula com motivo]
  N --> O[Gerar novo a partir do anulado]
  O --> E
```

## 5. Login com bloqueio progressivo

```mermaid
flowchart TD
  A([Usuário envia login]) --> B{Usuário está<br/>bloqueado?}
  B -- Sim --> C[Responde: aguarde X segundos]
  C --> Z([Fim])
  B -- Não --> D{Senha correta?}
  D -- Sim --> E[Zera o contador]
  E --> F[Gera o JWT e devolve os dados do usuário]
  F --> Z
  D -- Não --> G[Soma 1 falha]
  G --> H{3 falhas<br/>na rodada?}
  H -- Não --> I[Credenciais inválidas] --> Z
  H -- Sim --> J["Bloqueia por 10 s × 2^(bloqueios anteriores)<br/>no máximo 24 h"]
  J --> K[Zera a rodada e soma 1 bloqueio]
  K --> C
```

Sem nenhuma falha por 24 h, o histórico de bloqueios é esquecido.

## 6. Montar Relatório

```mermaid
flowchart TD
  A([Gestor em Relatórios]) --> B{Usar modelo salvo?}
  B -- Sim --> C[Carrega o modelo]
  B -- Não --> D[Escolhe a fonte de dados]
  D --> E{Tipo}
  E -- Detalhado --> F[Marca as colunas e a ordenação]
  E -- Cruzado --> G[Escolhe linhas, colunas<br/>e valor: contagem, soma, média, mín., máx.]
  F --> H
  G --> H[Filtros, período e título]
  C --> H
  H --> I{Perfil}
  I -- Gerente --> J[Servidor força a unidade do gerente]
  I -- Admin --> K[Todas as unidades ou uma escolhida]
  J --> L
  K --> L[Servidor consulta e calcula os totais]
  L --> M[Ver prévia na tela]
  M --> N{Salvar como modelo?}
  N -- Sim --> O[Nome, descrição e compartilhado?]
  N -- Não --> P
  O --> P[Baixar PDF]
  P --> Q[PDF com cabeçalho em todas as páginas,<br/>totais e Página X de Y]
  Q --> Z([Fim])
```

## 7. Notificações

```mermaid
flowchart TD
  A([Evento no sistema]) --> B[Busca as preferências do usuário]
  B --> C{Notificações no<br/>sistema ligadas?}
  C -- Sim --> D[Grava a notificação no banco]
  D --> E[Envia pelo Socket.IO para a sala user_id]
  E --> F{Usuário on-line?}
  F -- Sim --> G[Aparece o card na tela<br/>e o sininho atualiza]
  F -- Não --> H[Fica no sininho para quando entrar]
  C -- Não --> I
  G --> I
  H --> I{Telegram vinculado<br/>e ligado?}
  I -- Sim --> J[Envia pelo @CosupBot]
  J --> K{Telegram aceitou<br/>a formatação?}
  K -- Não --> L[Reenvia como texto simples] --> Z([Fim])
  K -- Sim --> Z
  I -- Não --> Z
```

## 8. Auditoria física (levantamento)

```mermaid
flowchart TD
  A([Gestor em Auditoria Física]) --> B{Há levantamento aberto?}
  B -- Não --> C[Inicia um levantamento]
  B -- Sim --> D
  C --> D[Escolhe a unidade]
  D --> E[Bipa ou digita o tombamento]
  E --> F{Bem existe?}
  F -- Não --> G[Avisa: não encontrado] --> E
  F -- Sim --> H{Já conferido?}
  H -- Sim --> I[Avisa: já conferido] --> E
  H -- Não --> J{É desta unidade?}
  J -- Sim --> K[Registra OK]
  J -- Não --> L[Registra Inconsistente]
  K --> M{Terminou?}
  L --> M
  M -- Não --> E
  M -- Sim --> N[Finaliza o levantamento]
  N --> Z([Fim])
```

## 9. Manutenção eletrônica

```mermaid
stateDiagram-v2
  direction LR
  [*] --> Pendente : Chamado aberto
  Pendente --> Em_manutencao : Técnico de eletrônica inicia
  Em_manutencao --> Concluido : Finaliza com laudo obrigatório
  Concluido --> [*]
```

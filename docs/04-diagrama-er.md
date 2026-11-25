# Diagrama entidade-relacionamento

[← Voltar ao README](../README.md)

Banco PostgreSQL, gerado pelas migrações do Prisma (`Gestio_back/prisma/migrations`). Os nomes abaixo são os das tabelas no banco. PK = chave primária, FK = chave estrangeira, UK = único.

## Núcleo

```mermaid
erDiagram
  unidades_organizacionais {
    int id PK
    varchar nome UK
    varchar sigla UK
    varchar campus
    timestamptz data_criacao
  }

  usuarios {
    int id PK
    varchar username UK
    varchar hashed_password
    varchar nome_completo
    varchar role
    varchar telefone
    varchar email UK
    varchar telegram_chat_id UK
    varchar telegram_token UK
    bool notificacoes_app
    bool notificacoes_bot
    json preferencias_notificacao
    int unidade_id FK
    timestamptz data_criacao
  }

  solicitacoes {
    int id PK
    int usuario_id FK
    int responsavel_usuario_id FK
    int unidade_id FK
    int numero_glpi
    varchar patrimonio
    varchar setor_equipamento
    varchar status
    varchar tipo_requisicao
    text justificativa
    varchar numero_pedido_externo "legado"
    timestamptz data_solicitacao
    timestamptz documento_emitido_em
  }

  solicitacao_itens {
    int id PK
    int solicitacao_id FK
    int item_id FK
    int quantidade_solicitada
    varchar status_entrega
    varchar tipo_uso
    varchar numero_pedido_sipac
    varchar almoxarifado
    timestamptz data_entrega
  }

  itens {
    int id PK
    varchar codigo_sipac "UK com unidade_id"
    varchar codigo_ref
    varchar pregao
    text descricao
    varchar categoria
    varchar tipo
    varchar unidade_medida
    varchar localizacao
    varchar localizacao_teste
    int quantidade
    int quantidade_estoque
    int quantidade_teste
    int quantidade_defeito
    int quantidade_com_defeito
    decimal preco_unitario
    bool is_permanente
    varchar patrimonio_item
    int unidade_id FK "nulo = estoque central"
  }

  notificacoes {
    int id PK
    int usuario_id FK
    varchar titulo
    text mensagem
    varchar tipo
    varchar link_acao
    bool lida
    timestamptz data_criacao
  }

  unidades_organizacionais ||--o{ usuarios : "tem"
  unidades_organizacionais ||--o{ solicitacoes : "tem"
  unidades_organizacionais |o--o{ itens : "guarda"
  usuarios ||--o{ solicitacoes : "abre (usuario_id)"
  usuarios ||--o{ solicitacoes : "responsável"
  solicitacoes ||--|{ solicitacao_itens : "contém (cascade)"
  itens ||--o{ solicitacao_itens : "é pedido em"
  usuarios ||--o{ notificacoes : "recebe (cascade)"
```

## Impressoras e suprimentos

```mermaid
erDiagram
  Impressora {
    int id PK
    varchar nome
    varchar modelo
    varchar numero_serie UK
    varchar ip UK
    varchar localizacao
    varchar servidor
    bool politicas_aplicadas
    varchar status_verificacao
    bool is_colorida
    bool ativo
    int unidade_id FK
  }

  AtendimentoImpressora {
    int id PK
    timestamptz data
    varchar numero_glpi
    enum status
    bool setor_visitado
    bool necessita_pecas
    text descricao_pecas
    varchar chamado_assistencia
    bool assistencia_realizada
    text parecer_tecnico
    bool assistencia_concluiu
    text parecer_final_assistencia
    bool necessita_backup
    varchar backup_impressora_nome
    varchar backup_numero_serie
    varchar backup_ip
    timestamptz backup_data_disponibilizacao
    timestamptz backup_data_retirada
    date data_visita
    int unidade_id FK
    int impressora_id FK
    int tecnico_id FK
  }

  ImpressaoForaUnidade {
    int id PK
    date data_inicio
    date data_fim
    int usuario_id FK
    int unidade_original_id FK
    int unidade_temporaria_id FK
    int atendimento_id FK
  }

  EstoqueSuprimentos {
    int id PK "registro único (id = 1)"
    int unidade_imagem_total
    int toner_preto_total
    int toner_ciano_total
    int toner_magenta_total
    int toner_amarelo_total
    timestamp data_ultima_atualizacao
  }

  ControleSuprimentos {
    int id PK
    timestamptz data
    varchar numero_glpi
    int unidade_imagem_solicitadas
    int toner_preto_solicitados
    int toner_ciano_solicitados
    int toner_magenta_solicitados
    int toner_amarelo_solicitados
    int tecnico_id FK
    int impressora_id FK
  }

  historico_suprimentos {
    int id PK
    int usuario_id FK
    varchar cor
    varchar tipo_acao
    int quantidade_adicionada
    int quantidade_anterior
    int quantidade_nova
    int unidade_imagem_solicitadas
    varchar justificativa
    timestamp data
  }

  reportes_erro_estoque {
    int id PK
    int usuario_id FK
    varchar mensagem
    varchar status
    timestamp data_criacao
  }

  unidades_organizacionais ||--o{ Impressora : "tem"
  unidades_organizacionais ||--o{ AtendimentoImpressora : "tem"
  Impressora ||--o{ AtendimentoImpressora : "recebe"
  usuarios ||--o{ AtendimentoImpressora : "atende"
  AtendimentoImpressora |o--o{ ImpressaoForaUnidade : "redireciona"
  unidades_organizacionais ||--o{ ImpressaoForaUnidade : "original / temporária"
  usuarios ||--o{ ImpressaoForaUnidade : "registra"
  Impressora ||--o{ ControleSuprimentos : "consome"
  usuarios ||--o{ ControleSuprimentos : "retira"
  usuarios ||--o{ historico_suprimentos : "movimenta"
  usuarios ||--o{ reportes_erro_estoque : "reporta"
```

## Patrimônio e manutenção eletrônica

```mermaid
erDiagram
  BemPatrimonial {
    int id PK
    varchar tombamento UK
    text descricao
    varchar marca
    varchar localizacao_fisica
    varchar foto_url
    varchar status_atual
    int unidade_id FK
    timestamp data_importacao
  }

  MovimentacaoBem {
    int id PK
    int bem_id FK
    varchar tipo
    varchar subtipo
    int origem_unidade_id FK
    int destino_unidade_id FK
    timestamptz data_envio
    timestamptz data_recebimento
  }

  HistoricoPatrimonio {
    int id PK
    int bem_id FK
    int usuario_id FK
    int tecnico_id FK
    int origem_unidade_id FK
    int destino_unidade_id FK
    varchar acao
    text detalhes
    timestamptz data_registro
  }

  AtribuicaoTecnico {
    int id PK
    int bem_id FK
    int tecnico_id FK
    timestamp data_atribuicao
    timestamp data_devolucao
    text observacoes
  }

  LevantamentoPatrimonial {
    int id PK
    timestamp data_inicio
    timestamp data_fim
    varchar status
  }

  ConferenciaLevantamento {
    int id PK
    int levantamento_id FK
    int bem_id FK
    varchar status_conferido
    text justificativa
  }

  manutencao_eletronica {
    int id PK
    varchar glpi
    int tecnico_responsavel_id FK
    int aberto_por_id FK
    varchar equipamento
    varchar patrimonio
    text descricao_problema
    timestamp data_entrada
    enum status
    text laudo_tecnico
  }

  unidades_organizacionais ||--o{ BemPatrimonial : "possui"
  BemPatrimonial ||--o{ MovimentacaoBem : "movimenta"
  unidades_organizacionais ||--o{ MovimentacaoBem : "origem / destino"
  BemPatrimonial ||--o{ HistoricoPatrimonio : "registra (cascade)"
  usuarios ||--o{ HistoricoPatrimonio : "executa / técnico alvo"
  BemPatrimonial ||--o{ AtribuicaoTecnico : "atribuído"
  usuarios ||--o{ AtribuicaoTecnico : "recebe"
  LevantamentoPatrimonial ||--o{ ConferenciaLevantamento : "confere"
  BemPatrimonial ||--o{ ConferenciaLevantamento : "é conferido"
  usuarios ||--o{ manutencao_eletronica : "responsável"
  usuarios |o--o{ manutencao_eletronica : "abriu"
```

## Produção, relatórios e Relatório Analítico

```mermaid
erDiagram
  CatalogoServico {
    int id PK
    varchar nome_servico
    varchar categoria
    decimal valor_estimado
    bool ativo
  }

  ProducaoServico {
    int id PK
    timestamp data_registro
    int tecnico_id FK
    int servico_id FK
    int quantidade
    varchar patrimonio_serie
    int solicitacao_peca_id FK
    int atendimento_impr_id FK
    int manutencao_eletr_id FK
    varchar numero_glpi
    decimal valor_servico_aplicado
    decimal valor_pecas_aplicado
    decimal valor_total_produzido
    text observacoes
  }

  relatorio_modelos {
    int id PK
    varchar nome
    varchar descricao
    json configuracao
    bool compartilhado
    int usuario_id FK
    timestamptz criado_em
    timestamptz atualizado_em
  }

  Dashboard {
    int id PK
    varchar nome
    varchar descricao
    int usuario_id
    bool publico
    json configuracao
    timestamp data_criacao
  }

  DashboardWidget {
    int id PK
    int dashboard_id FK
    varchar titulo
    varchar tipo
    varchar dataset
    json configuracao
    int posicao_x
    int posicao_y
    int largura
    int altura
  }

  relatorios_analiticos {
    int id PK
    int unidade_id FK "UK com ano e numero"
    int tecnico_id FK
    varchar status
    int numero
    int ano
    text motivo_devolucao
    int assinado_por_id FK
    timestamptz assinado_em
    varchar cargo_assinante
    varchar codigo_verificacao UK
    json documento
    int anulado_por_id FK
    timestamptz anulado_em
    text motivo_anulacao
    int origem_id
    timestamptz criado_em
    timestamptz atualizado_em
  }

  relatorios_analiticos_itens {
    int id PK
    int relatorio_id FK
    int ordem
    varchar equipamento
    varchar patrimonio
  }

  CatalogoServico ||--o{ ProducaoServico : "aplicado em"
  usuarios ||--o{ ProducaoServico : "produz"
  solicitacoes |o--o{ ProducaoServico : "vincula"
  AtendimentoImpressora |o--o{ ProducaoServico : "vincula"
  manutencao_eletronica |o--o{ ProducaoServico : "vincula"
  usuarios ||--o{ relatorio_modelos : "salva (cascade)"
  Dashboard ||--o{ DashboardWidget : "tem (cascade)"
  unidades_organizacionais ||--o{ relatorios_analiticos : "emite"
  usuarios ||--o{ relatorios_analiticos : "emite / assina / anula"
  relatorios_analiticos ||--|{ relatorios_analiticos_itens : "lista (cascade)"
```

## Índices e restrições importantes

| Tabela | Restrição | Motivo |
| --- | --- | --- |
| `itens` | único (`codigo_sipac`, `unidade_id`) | A mesma peça não se repete no estoque de uma unidade |
| `relatorios_analiticos` | único (`unidade_id`, `ano`, `numero`) | Numeração sem repetição por unidade e ano, mesmo com duas assinaturas ao mesmo tempo |
| `relatorios_analiticos` | único `codigo_verificacao` | Cada documento assinado tem um código só dele |
| `relatorios_analiticos_itens` | índice `patrimonio` | Levantamento de equipamentos inservíveis por patrimônio |
| `BemPatrimonial` | único `tombamento` | Um tombamento identifica um bem |
| `Impressora` | únicos `numero_serie` e `ip` | Não cadastrar a mesma impressora duas vezes |
| `usuarios` | únicos `username`, `email`, `telegram_chat_id`, `telegram_token` | Login e vínculo com o Telegram sem ambiguidade |

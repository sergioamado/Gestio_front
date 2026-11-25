# Diagrama de classes

[← Voltar ao README](../README.md)

O diagrama mostra as classes do domínio (os modelos do Prisma, em `Gestio_back/prisma/schema.prisma`) com os atributos principais e as operações que o backend oferece para cada uma. Foi dividido por módulo para ficar legível.

## Núcleo: usuários, unidades, OS e estoque

```mermaid
classDiagram
  direction LR

  class Usuario {
    +int id
    +string username
    +string hashed_password
    +string nome_completo
    +Role role
    +string email
    +string telefone
    +string telegram_chat_id
    +bool notificacoes_app
    +bool notificacoes_bot
    +login()
    +alterarSenha()
    +vincularTelegram()
  }

  class Role {
    <<enumeration>>
    admin
    gerente
    tecnico
    tecnico_impressora
    tecnico_eletronica
  }

  class UnidadeOrganizacional {
    +int id
    +string nome
    +string sigla
    +string campus
  }

  class Solicitacao {
    +int id
    +int numero_glpi
    +string patrimonio
    +string setor_equipamento
    +StatusOS status
    +TipoRequisicao tipo_requisicao
    +string justificativa
    +datetime data_solicitacao
    +datetime documento_emitido_em
    +abrir()
    +mudarStatus(novo)
    +cancelar()
  }

  class StatusOS {
    <<enumeration>>
    PENDENTE
    EM_ATENDIMENTO
    PRONTA_PARA_VISTORIA
    CONCLUIDA
    CANCELADA
  }

  class SolicitacaoItem {
    +int id
    +int quantidade_solicitada
    +TipoUso tipo_uso
    +StatusItem status_entrega
    +string numero_pedido_sipac
    +string almoxarifado
    +datetime data_entrega
    +mudarStatus(novo)
    +converterEmConsumo()
  }

  class StatusItem {
    <<enumeration>>
    Pendente
    Entregue
    Recebida_pelo_Tecnico
    Aguardando_Devolucao
    Devolvida
    Devolucao_Aceite
    Cancelado
  }

  class Item {
    +int id
    +string codigo_sipac
    +string descricao
    +string categoria
    +string unidade_medida
    +int quantidade_estoque
    +int quantidade_teste
    +int quantidade_defeito
    +decimal preco_unitario
    +string localizacao
  }

  class Notificacao {
    +int id
    +string titulo
    +string mensagem
    +string tipo
    +string link_acao
    +bool lida
    +marcarComoLida()
  }

  Usuario "*" --> "0..1" UnidadeOrganizacional : pertence
  Usuario --> Role
  Usuario "1" --> "*" Solicitacao : abre
  Usuario "1" --> "*" Solicitacao : responsável
  UnidadeOrganizacional "1" --> "*" Solicitacao
  Solicitacao --> StatusOS
  Solicitacao "1" *-- "1..*" SolicitacaoItem : contém
  SolicitacaoItem "*" --> "1" Item : peça
  SolicitacaoItem --> StatusItem
  UnidadeOrganizacional "0..1" --> "*" Item : estoque
  Usuario "1" *-- "*" Notificacao
```

## Impressoras e suprimentos

```mermaid
classDiagram
  direction LR

  class Impressora {
    +int id
    +string nome
    +string modelo
    +string numero_serie
    +string ip
    +string localizacao
    +bool is_colorida
    +bool politicas_aplicadas
    +bool ativo
  }

  class AtendimentoImpressora {
    +int id
    +string numero_glpi
    +StatusAtendimento status
    +bool setor_visitado
    +bool necessita_pecas
    +string parecer_tecnico
    +bool necessita_backup
    +string backup_numero_serie
    +datetime backup_data_disponibilizacao
    +datetime backup_data_retirada
  }

  class StatusAtendimento {
    <<enumeration>>
    Aguardando_Assistencia
    Em_Atendimento
    Aguardando_Peca
    Aguardando_Peca_Com_Backup
    Aguardando_Peca_Impressao_Redirecionada
    Concluido
    Cancelado
  }

  class ImpressaoForaUnidade {
    +date data_inicio
    +date data_fim
  }

  class EstoqueSuprimentos {
    +int toner_preto_total
    +int toner_ciano_total
    +int toner_magenta_total
    +int toner_amarelo_total
    +int unidade_imagem_total
    +darEntrada()
    +corrigir(justificativa)
  }

  class ControleSuprimentos {
    +string numero_glpi
    +int toner_preto_solicitados
    +int toner_ciano_solicitados
    +int toner_magenta_solicitados
    +int toner_amarelo_solicitados
    +int unidade_imagem_solicitadas
  }

  class HistoricoSuprimento {
    +string cor
    +string tipo_acao
    +int quantidade_adicionada
    +int quantidade_anterior
    +int quantidade_nova
    +string justificativa
  }

  class ReporteErroEstoque {
    +string mensagem
    +string status
  }

  UnidadeOrganizacional "1" --> "*" Impressora
  Impressora "1" --> "*" AtendimentoImpressora
  AtendimentoImpressora --> StatusAtendimento
  Usuario "1" --> "*" AtendimentoImpressora : técnico
  AtendimentoImpressora "0..1" --> "*" ImpressaoForaUnidade : redireciona
  ImpressaoForaUnidade --> UnidadeOrganizacional : original
  ImpressaoForaUnidade --> UnidadeOrganizacional : temporária
  Impressora "1" --> "*" ControleSuprimentos : saída
  Usuario "1" --> "*" ControleSuprimentos
  Usuario "1" --> "*" HistoricoSuprimento
  Usuario "1" --> "*" ReporteErroEstoque
  EstoqueSuprimentos ..> ControleSuprimentos : baixa
```

## Patrimônio e manutenção eletrônica

```mermaid
classDiagram
  direction LR

  class BemPatrimonial {
    +int id
    +string tombamento
    +string descricao
    +string marca
    +string localizacao_fisica
    +string foto_url
    +string status_atual
    +transferir(destino)
    +atribuir(tecnico)
    +devolver()
  }

  class MovimentacaoBem {
    +string tipo
    +string subtipo
    +datetime data_envio
    +datetime data_recebimento
  }

  class HistoricoPatrimonio {
    +string acao
    +string detalhes
    +datetime data_registro
  }

  class AtribuicaoTecnico {
    +datetime data_atribuicao
    +datetime data_devolucao
    +string observacoes
  }

  class LevantamentoPatrimonial {
    +datetime data_inicio
    +datetime data_fim
    +string status
    +iniciar()
    +bipar(tombamento)
    +finalizar()
  }

  class ConferenciaLevantamento {
    +string status_conferido
    +string justificativa
  }

  class ManutencaoEletronica {
    +int id
    +string glpi
    +string equipamento
    +string patrimonio
    +string descricao_problema
    +StatusManutencao status
    +string laudo_tecnico
    +iniciar()
    +finalizar(laudo)
  }

  class StatusManutencao {
    <<enumeration>>
    Pendente
    Em_manutencao
    Concluido
  }

  UnidadeOrganizacional "1" --> "*" BemPatrimonial
  BemPatrimonial "1" --> "*" MovimentacaoBem
  BemPatrimonial "1" *-- "*" HistoricoPatrimonio
  BemPatrimonial "1" --> "*" AtribuicaoTecnico
  AtribuicaoTecnico "*" --> "1" Usuario : técnico
  LevantamentoPatrimonial "1" *-- "*" ConferenciaLevantamento
  ConferenciaLevantamento "*" --> "1" BemPatrimonial
  ManutencaoEletronica --> StatusManutencao
  ManutencaoEletronica "*" --> "1" Usuario : técnico responsável
  ManutencaoEletronica "*" --> "0..1" Usuario : aberto por
```

## Produção, relatórios e Relatório Analítico

```mermaid
classDiagram
  direction LR

  class CatalogoServico {
    +int id
    +string nome_servico
    +string categoria
    +decimal valor_estimado
    +bool ativo
  }

  class ProducaoServico {
    +int id
    +datetime data_registro
    +int quantidade
    +string patrimonio_serie
    +string numero_glpi
    +decimal valor_servico_aplicado
    +decimal valor_pecas_aplicado
    +decimal valor_total_produzido
    +string observacoes
  }

  class RelatorioModelo {
    +int id
    +string nome
    +string descricao
    +json configuracao
    +bool compartilhado
  }

  class Dashboard {
    +string nome
    +bool publico
    +json configuracao
  }

  class DashboardWidget {
    +string titulo
    +string tipo
    +string dataset
    +json configuracao
    +int posicao_x
    +int posicao_y
  }

  class RelatorioAnalitico {
    +int id
    +StatusRA status
    +int numero
    +int ano
    +string motivo_devolucao
    +datetime assinado_em
    +string cargo_assinante
    +string codigo_verificacao
    +json documento
    +string motivo_anulacao
    +int origem_id
    +emitir()
    +assinar(cargo)
    +devolver(motivo)
    +anular(motivo)
    +duplicar()
  }

  class StatusRA {
    <<enumeration>>
    PENDENTE
    DEVOLVIDO
    ASSINADO
    ANULADO
  }

  class RelatorioAnaliticoItem {
    +int ordem
    +string equipamento
    +string patrimonio
  }

  class MotorRelatorio {
    <<serviço>>
    +listarFontes()
    +gerar(fonte, tipo, colunas, filtros, periodo, unidade)
  }

  CatalogoServico "1" --> "*" ProducaoServico
  Usuario "1" --> "*" ProducaoServico : técnico
  ProducaoServico "*" --> "0..1" Solicitacao
  ProducaoServico "*" --> "0..1" AtendimentoImpressora
  ProducaoServico "*" --> "0..1" ManutencaoEletronica
  Usuario "1" *-- "*" RelatorioModelo
  RelatorioModelo ..> MotorRelatorio : configura
  Dashboard "1" *-- "*" DashboardWidget
  RelatorioAnalitico --> StatusRA
  RelatorioAnalitico "1" *-- "1..*" RelatorioAnaliticoItem
  RelatorioAnalitico "*" --> "1" UnidadeOrganizacional
  RelatorioAnalitico "*" --> "1" Usuario : técnico emissor
  RelatorioAnalitico "*" --> "0..1" Usuario : assinante
  RelatorioAnalitico "*" --> "0..1" Usuario : anulado por
  RelatorioAnalitico "0..1" <-- "*" RelatorioAnalitico : origem
```

## Observações

- Os status da OS e da peça são texto no banco; os valores válidos e as transições estão em `Gestio_back/src/rules/solicitacaoRules.ts`.
- Os métodos listados correspondem às rotas da API (ver [Arquitetura](05-arquitetura.md#rotas-da-api)). No código, eles estão nos controllers, e não nos modelos, porque o Prisma gera só a camada de dados.
- `MotorRelatorio` não é tabela: é o serviço em `src/relatorios/motor.ts`, que lê as fontes de `src/relatorios/fontes.ts`.

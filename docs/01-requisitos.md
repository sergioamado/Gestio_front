# Requisitos do COSUP+

[← Voltar ao README](../README.md)

Legenda de prioridade: **E** = essencial, **I** = importante, **D** = desejável.

---

## 1. Requisitos funcionais (RF)

### 1.1 Acesso e usuários

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF01 | O sistema deve permitir login com usuário e senha. | Todos | E |
| RF02 | O sistema deve bloquear o login por um tempo crescente após 3 senhas erradas seguidas: 10 s, 20 s, 40 s e assim por diante, até 24 h. | Todos | E |
| RF03 | A tela de login deve ter um ícone para mostrar ou ocultar a senha. | Todos | D |
| RF04 | O usuário deve poder alterar a própria senha. | Todos | E |
| RF05 | O admin deve poder cadastrar, editar e excluir usuários e redefinir a senha deles. | Admin | E |
| RF06 | O admin deve poder cadastrar, editar e excluir unidades organizacionais (nome, sigla, campus). | Admin | E |
| RF07 | Cada usuário deve ter um perfil (admin, gerente, técnico, técnico de impressoras, técnico de eletrônica) e pode estar vinculado a uma unidade. | Admin | E |
| RF08 | O menu lateral deve mostrar só os módulos que o perfil do usuário pode acessar. | Todos | E |

### 1.2 Ordens de Serviço (OS) e peças

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF09 | O técnico deve poder abrir uma OS com nº do GLPI, patrimônio, setor do equipamento, responsável, justificativa, tipo (consumo ou teste) e as peças necessárias. | Técnicos | E |
| RF10 | Ao abrir a OS, o sistema deve reservar as peças, descontando do estoque principal (consumo) ou de teste, e recusar se não houver saldo. | Sistema | E |
| RF10a | O gerente deve informar, em cada peça, o **nº do pedido SIPAC** (pode se repetir entre peças) e o **almoxarifado** de onde ela sai. A OS só pode ser concluída quando todas as peças não canceladas tiverem os dois. | Gerente | E |
| RF11 | O gerente deve poder mudar o status da OS: Pendente → Em atendimento; Pronta para vistoria → Concluída; qualquer status aberto → Cancelada. | Gerente | E |
| RF12 | O técnico deve poder mudar a OS de Em atendimento para Pronta para vistoria. | Técnicos | E |
| RF13 | O gerente deve poder marcar cada peça como Pendente almoxarifado ou Disponível para retirada, e aceitar a devolução. | Gerente | E |
| RF14a | Os dois técnicos da OS, quem abriu e o técnico responsável pela máquina, podem agir nela e recebem as notificações dela. | Técnicos | E |
| RF14 | O técnico deve poder confirmar que recebeu a peça e devolvê-la com defeito, informando o motivo. | Técnicos | E |
| RF15 | Uma peça de teste que funcionou deve poder ser convertida em peça de consumo (definitiva). | Técnicos | I |
| RF16 | Ao cancelar uma OS, as peças devem voltar ao estoque correspondente: principal, de teste ou de defeito. | Sistema | E |
| RF17 | O sistema deve colocar a OS em Pendente, Concluída ou Aguardando devolução automaticamente quando a regra pedir. | Sistema | E |
| RF18 | O sistema deve emitir o documento da OS para impressão. | Gerente, técnicos | I |
| RF19 | O admin deve poder ver todas as OS, sem poder alterar nenhuma. | Admin | E |

### 1.3 Estoque de peças

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF20 | O gerente e o admin devem poder cadastrar, editar e excluir peças (código SIPAC, descrição, categoria, unidade de medida, localização, preço). | Gerente, admin | E |
| RF21 | Cada peça deve ter quantidades separadas para estoque principal, estoque de teste e peças com defeito. | Sistema | E |
| RF22 | Todos os perfis devem poder consultar o catálogo de peças. | Todos | E |

### 1.4 Impressoras e suprimentos

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF23 | O sistema deve permitir cadastrar impressoras (nome, modelo, nº de série, IP, localização, servidor, colorida ou não, políticas aplicadas). | Módulo impressoras | E |
| RF24 | O sistema deve registrar atendimentos técnicos de impressora: visita, necessidade de peças, chamado da assistência, parecer, impressora reserva e impressão redirecionada para outra unidade. | Módulo impressoras | E |
| RF25 | O sistema deve registrar a entrada de toners e unidades de imagem no estoque e permitir a correção com justificativa. | Módulo impressoras | E |
| RF26 | O sistema deve registrar a saída de suprimentos por impressora e dar baixa no estoque. | Módulo impressoras | E |
| RF27 | O técnico deve poder reportar uma divergência do estoque aos gestores. | Técnico de impressoras | I |

### 1.5 Manutenção eletrônica

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF28 | O sistema deve permitir abrir um chamado de manutenção eletrônica (equipamento, patrimônio, GLPI, problema). | Módulo eletrônica | E |
| RF29 | O técnico de eletrônica deve poder iniciar a manutenção e finalizá-la com laudo técnico obrigatório. | Técnico de eletrônica, gerente, admin | E |
| RF30 | Quem abriu o chamado deve ser notificado quando o status mudar. | Sistema | I |

### 1.6 Patrimônio

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF31 | O sistema deve listar os bens patrimoniais com busca, filtro por unidade e por situação, e paginação. | Gerente, admin | E |
| RF32 | O sistema deve importar bens do SIPAC a partir de planilha (CSV ou XLSX) ou PDF, para a unidade do gerente (o admin escolhe). Um bem que estava em outra unidade passa para a unidade da importação, com registro no histórico e aviso ao gerente de origem. | Gerente, admin | E |
| RF33 | O sistema deve permitir transferir bens da unidade do gerente para outra, com destino e observação. O bem passa a ser da unidade de destino, sai da lista da origem, fica no histórico e os gerentes do destino são avisados. | Gerente, admin | E |
| RF34 | O sistema deve permitir atribuir um bem a um técnico da mesma unidade e registrar a devolução. O bem continua na unidade, e a lista mostra com quem ele está. | Gerente, admin | I |
| RF35 | O sistema deve guardar o histórico de cada bem (quem fez, o quê, quando, de onde e para onde). | Sistema | E |
| RF36 | O sistema deve permitir anexar uma foto ao bem. | Gerente, admin | D |
| RF37 | O sistema deve permitir uma auditoria física (levantamento): iniciar, bipar os tombamentos, marcar inconsistências e finalizar. O gerente acompanha a própria unidade; o admin, que não tem unidade, acompanha todas ou escolhe uma. | Gerente, admin | I |

### 1.7 Produção de serviços

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF38 | O gerente e o admin devem manter o catálogo de serviços, com o valor estimado de mercado de cada um. | Gerente, admin | E |
| RF39 | O técnico deve poder lançar a produção (serviço, quantidade, patrimônio ou série, GLPI) e vinculá-la a uma OS, atendimento de impressora ou manutenção eletrônica. | Técnicos | E |
| RF40 | O sistema deve guardar o valor do serviço e das peças **no momento do lançamento**, para que mudanças no catálogo não alterem o histórico. | Sistema | E |
| RF41 | O técnico vê só a própria produção; o gerente e o admin veem a de todos. | Sistema | E |

### 1.8 Relatórios e análises

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF42 | O sistema deve mostrar o Dashboard Executivo de Produção com indicadores e gráficos por período. | Gerente, admin | E |
| RF43 | O gestor deve poder **montar o próprio relatório**: escolher a fonte de dados, o tipo (detalhado com colunas escolhidas, ou cruzado com linhas × colunas e totais), os filtros e o período. | Gerente, admin | E |
| RF44 | O relatório montado deve ser baixado em **PDF**, com cabeçalho em todas as páginas (sistema, título, data e hora, quem gerou, unidade, período, filtros), totais e "Página X de Y". | Gerente, admin | E |
| RF45 | O gestor deve poder salvar a montagem como modelo, privado ou compartilhado com outros gestores. | Gerente, admin | I |
| RF46 | O gerente só vê dados da própria unidade nos relatórios; o admin escolhe uma unidade ou todas. | Sistema | E |
| RF47 | O sistema deve oferecer uma tela de análises (BI) com consultas e painéis salvos. | Gerente, admin | D |

### 1.9 Relatório Analítico (equipamento inservível)

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF48 | O técnico deve poder emitir um Relatório Analítico com os equipamentos e patrimônios digitados à mão. | Técnicos | E |
| RF49 | O gerente da unidade deve poder assinar eletronicamente (com o cargo) ou devolver com um motivo. | Gerente | E |
| RF50 | O técnico deve poder corrigir um relatório devolvido e reenviar. | Técnicos | E |
| RF51 | Na assinatura, o sistema deve dar um número sequencial por unidade e ano (ex.: 002/2026), guardar a "fotografia" do documento e gerar um código de verificação. | Sistema | E |
| RF52 | O PDF deve seguir o modelo oficial da UFS (logo, marca-d'água, texto justificado, tabela). A minuta sai com a marca "MINUTA" e o anulado com "ANULADO". | Sistema | E |
| RF53 | O gerente deve poder anular um relatório assinado, com motivo; o número continua reservado. | Gerente | E |
| RF54 | O gerente deve poder gerar um novo relatório a partir de outro (duplicar). | Gerente | I |
| RF55 | Qualquer usuário logado deve poder conferir a autenticidade de um relatório pelo código de verificação. | Todos | I |
| RF56 | Os equipamentos inservíveis devem estar disponíveis como fonte no Montar Relatório, para levantamentos. | Gerente, admin | I |

### 1.10 Notificações

| ID | Requisito | Perfil | Prioridade |
| --- | --- | --- | --- |
| RF57 | O sistema deve mostrar notificações em tempo real como cards na tela e manter a lista no sininho. | Todos | E |
| RF58 | O usuário deve poder marcar uma notificação, ou todas, como lida. | Todos | E |
| RF59 | O usuário deve poder vincular a conta ao Telegram pelo link do @CosupBot e receber as notificações por lá. | Todos | I |
| RF60 | O usuário deve poder ligar e desligar as notificações do sistema e do Telegram. | Todos | I |

---

## 2. Requisitos não funcionais (RNF)

| ID | Categoria | Requisito |
| --- | --- | --- |
| RNF01 | Segurança | As senhas devem ser guardadas com hash (argon2/bcrypt), nunca em texto puro. |
| RNF02 | Segurança | O acesso à API deve usar token JWT; toda rota, exceto o login, exige token válido. |
| RNF03 | Segurança | O backend deve validar o perfil **e a unidade** do usuário em cada operação, sem confiar no front. |
| RNF04 | Segurança | A conexão em tempo real (Socket.IO) deve ser autenticada pelo JWT, e a sala do usuário deve vir do token. |
| RNF05 | Segurança | Os dados de entrada devem ser validados no backend (Zod). |
| RNF06 | Segurança | Os uploads devem ter tipo e tamanho limitados. |
| RNF07 | Integridade | Operações que mexem em mais de uma tabela (estoque + status, assinatura + numeração) devem rodar em transação. |
| RNF08 | Integridade | O número do Relatório Analítico deve ser único por unidade e ano, garantido por índice único no banco. |
| RNF09 | Rastreabilidade | As ações sobre bens, suprimentos e relatórios assinados devem guardar quem fez e quando. |
| RNF10 | Usabilidade | A interface deve funcionar no celular: menu lateral recolhível e tabelas viram cards em telas pequenas. |
| RNF11 | Usabilidade | Os textos devem estar em português do Brasil. |
| RNF12 | Usabilidade | As ações destrutivas (excluir, cancelar, anular) devem pedir confirmação. |
| RNF13 | Desempenho | As páginas devem ser carregadas sob demanda (lazy loading), e as bibliotecas pesadas (PDF, gráficos) só quando usadas. |
| RNF14 | Desempenho | As listas grandes (patrimônio) devem ser paginadas no servidor. |
| RNF15 | Disponibilidade | O sistema deve continuar funcionando se o Telegram estiver fora do ar ou não configurado. |
| RNF16 | Portabilidade | O front deve rodar nos navegadores atuais (Chrome, Firefox, Edge, Safari). |
| RNF17 | Manutenibilidade | O código deve ser TypeScript, com ESLint e Prettier, e as regras de negócio da OS devem ficar isoladas em funções puras (`src/rules`). |
| RNF18 | Manutenibilidade | As mudanças no banco devem ser feitas por migrações do Prisma, versionadas no repositório. |
| RNF19 | Configuração | Endereços e segredos devem vir de variáveis de ambiente (`.env`), nunca do código. |
| RNF20 | Documentos | Os PDFs devem ser gerados no navegador (jsPDF), sem depender de serviço externo. |
| RNF21 | Tempo real | Toda tela aberta deve se atualizar sozinha, em até cerca de 1 segundo, quando outro usuário alterar os dados que ela mostra, sem recarregar a página, sem piscar e sem apagar o que o usuário está digitando. |

---

## 3. Requisitos inversos (o que o sistema **não** deve fazer)

| ID | Requisito inverso |
| --- | --- |
| RI01 | O sistema não deve permitir que o admin altere OS, peças da OS ou Relatórios Analíticos; ele só visualiza. |
| RI02 | O sistema não deve permitir que um gerente veja ou altere OS, estoque, patrimônio ou relatórios de outra unidade. No patrimônio, ele só transfere bens **da unidade dele** para outra. |
| RI02a | O sistema não deve mudar a situação de um bem ao atribuí-lo a um técnico (ele continua "Ativo" na unidade), nem transferir um bem que está com um técnico sem antes registrar a devolução. |
| RI03 | O sistema não deve permitir que o gerente ou o admin abram OS; só técnicos abrem. |
| RI04 | O sistema não deve permitir que o técnico conclua ou cancele uma OS. |
| RI05 | O sistema não deve permitir pular etapas do status da OS ou da peça (ex.: de Pendente direto para Concluída). |
| RI06 | O sistema não deve concluir uma OS com peça sem nº do pedido SIPAC ou sem almoxarifado, e o técnico não pode alterar esses campos. |
| RI07 | O sistema não deve deixar o estoque ficar negativo nem "perder" peças quando uma OS é cancelada. |
| RI08 | O sistema não deve permitir editar um Relatório Analítico assinado; para corrigir, anula-se e gera-se um novo. |
| RI09 | O sistema não deve reutilizar o número de um Relatório Analítico anulado. |
| RI10 | O sistema não deve dar número ao Relatório Analítico antes da assinatura. |
| RI11 | O sistema não deve permitir que o técnico assine o próprio relatório. |
| RI12 | O sistema não deve mostrar, nos relatórios do gerente, dados de outras unidades, mesmo que o filtro seja manipulado no navegador. |
| RI13 | O sistema não deve informar, no login, se o erro foi no usuário ou na senha. |
| RI14 | O sistema não deve guardar nem exibir senhas em texto puro, nem enviar segredos para o front. |
| RI15 | O sistema não deve enviar notificação a um usuário que desligou aquele canal. |
| RI16 | O sistema não deve mudar o valor de produções antigas quando o catálogo de serviços for alterado. |
| RI17 | O sistema não deve somar campos de identificação (nº da OS, GLPI, patrimônio) na linha de totais dos relatórios. |
| RI18 | O sistema não deve parar de funcionar quando o bot do Telegram falhar. |

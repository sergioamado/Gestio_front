# Tutorial do COSUP+

[← Voltar ao README](../README.md)

Este guia explica, tela por tela, como usar o sistema. Cada seção diz **quem** pode usar a tela. Se um item do menu não aparece para você, é porque o seu perfil não tem acesso a ele.

## Sumário

1. [Primeiro acesso](#1-primeiro-acesso)
2. [Conhecendo a tela](#2-conhecendo-a-tela)
3. [Notificações e Telegram](#3-notificações-e-telegram)
4. [Chamados & Peças](#4-chamados--peças)
5. [Produção & Serviços](#5-produção--serviços)
6. [Relatório Analítico](#6-relatório-analítico)
7. [Gestão de Impressoras](#7-gestão-de-impressoras)
8. [Eletrônica](#8-eletrônica)
9. [Patrimônio](#9-patrimônio)
10. [Administração](#10-administração)
11. [Dúvidas frequentes](#11-dúvidas-frequentes)

---

## 1. Primeiro acesso

1. Abra o endereço do COSUP+ no navegador. Funciona no computador e no celular.
2. Digite o **usuário** e a **senha** que o administrador cadastrou. O ícone de olho mostra a senha enquanto você digita.
3. Clique em **Entrar**.
4. No primeiro acesso, troque a senha: no menu lateral, clique em **mais opções → Alterar Senha**, informe a senha atual e a nova (mínimo de 6 caracteres).

> **Errou a senha 3 vezes?** O sistema pede para esperar 10 segundos. Se errar de novo, a espera dobra: 20 s, 40 s e assim por diante, até 24 horas. A tela mostra quanto tempo falta. Se esquecer a senha, peça ao administrador para redefini-la.

## 2. Conhecendo a tela

- **Menu lateral (à esquerda):** os módulos, agrupados em Chamados & Peças, Produção & Serviços, Gestão de Impressoras, Eletrônica, Patrimônio e Administração.
  - No computador, o botão ☰ recolhe e abre o menu, e o sistema lembra a sua escolha.
  - No celular, o menu abre por cima da tela e fecha sozinho quando você escolhe uma opção.
  - Em **mais opções** ficam **Alterar Senha** e **Sair do Sistema**.
- **Cabeçalho (no alto):** o nome da tela, o seu nome e perfil, o 🔔 **sininho** das notificações e o atalho de configuração do Telegram e dos alertas.
- **Painel Inicial:** os números principais do seu perfil (OS abertas, peças pendentes, estoque baixo, produção) e as últimas OS.
- **No celular:** as tabelas viram **cards**, um por registro, com os botões de ação embaixo.
- **Atualização automática:** todas as telas se atualizam sozinhas quando outra pessoa muda algo (status de OS, estoque, relatórios etc.). Não é preciso apertar F5. Se uma janela estiver aberta sobre um registro que outra pessoa alterou (ex.: outro gerente assinou o relatório), ela fecha e avisa.

## 3. Notificações e Telegram

**Quem:** todos.

### Notificações no sistema

- Quando algo acontece com você (uma OS mudou, um relatório foi assinado, uma peça foi liberada), aparece um **card** no canto da tela.
- O 🔔 mostra quantas notificações não lidas você tem. Clique para ver a lista, abrir cada uma ou **marcar todas como lidas**.

### Vincular o Telegram (@CosupBot)

1. Clique no ícone **Configurar Telegram e Alertas** no cabeçalho (ou no 🔔 → **Configurações**).
2. Em **No Celular (Telegram Bot)**, clique em **Abrir @CosupBot**.
3. No Telegram, toque em **Iniciar**.
4. O bot responde que a conta foi vinculada, e a tela do sistema atualiza sozinha.

Se preferir, toque em **Iniciar** no bot sem o link: ele responde com o seu ID. Cole esse número em **Seu Telegram Chat ID** e salve.

Na mesma janela, você escolhe:
- os **canais**: sininho no sistema e/ou Telegram;
- os **assuntos**: atualizações de OS, alertas críticos, estoque baixo, avisos do sistema.

> O link de vínculo só pode ser usado uma vez. Se o bot disser "Link inválido", feche e abra a janela para gerar outro. Para desvincular, apague o **Telegram Chat ID** e salve.

---

## 4. Chamados & Peças

### 4.1 Nova Solicitação: abrir uma OS

**Quem:** técnicos. Gerente e admin não abrem OS.

1. No menu, clique em **Nova Solicitação**.
2. Preencha:
   - **Nº GLPI** do chamado;
   - **Nº Patrimônio (UFS)** do equipamento;
   - **Setor do Equipamento**;
   - **Responsável pela máquina** (ou marque "Atribuir esta OS para mim mesmo");
   - **Tipo de Requisição**: **Consumo** (a peça fica no equipamento) ou **Teste** (a peça é emprestada para testar e depois devolvida);
   - **Justificativa / Diagnóstico Técnico**.
3. No catálogo ao lado, procure as peças e adicione-as ao **carrinho** com a quantidade.
4. Confira o carrinho e envie a solicitação.

O sistema **reserva as peças no estoque** na hora. Você recebe uma notificação confirmando a OS. Se faltar saldo, ele avisa qual peça faltou e nada é gravado. A OS nasce como **Pendente**.

### 4.2 Gerenciar OS

**Quem:** todos veem; cada perfil age de um jeito.

1. No menu, clique em **Gerenciar OS**.
2. Use a busca e os filtros (status, período, GLPI) e clique na OS para ver os detalhes.

**O que o gerente faz** (só nas OS da própria unidade):

| Ação | Como |
| --- | --- |
| Iniciar o atendimento | Em **Gerir Status da OS**, mude de Pendente para **Em atendimento**. |
| Informar o pedido SIPAC | Em cada peça, preencha o **Nº Pedido SIPAC** (formato Num/Ano; pode ser o mesmo em várias peças) e o **Almoxarifado**. |
| Liberar a peça | Mude a peça para **Disponível para retirada** (Entregue). Se errou, volte para Pendente almoxarifado. |
| Aceitar devolução | Quando o técnico devolver, clique em **✅ Aceitar Devolução**. A peça volta ao estoque certo. |
| Concluir | Com a OS em **Pronta para vistoria**, confira o equipamento e mude para **Concluída**. Só funciona se todas as peças tiverem pedido SIPAC e almoxarifado. |
| Cancelar | Mude para **Cancelada** e confirme. Todas as peças voltam ao estoque. |
| Imprimir | Use o botão de imprimir para emitir o documento da OS. |

**O que o técnico faz:**

| Ação | Como |
| --- | --- |
| Retirar a peça | Quando a peça estiver Disponível, pegue no almoxarifado e clique em **Recebi** (Confirmar Recebimento Físico). |
| Peça de teste funcionou | Clique em **Funcionou (Pedir Definitiva)** e confirme em **Sim, Solicitar Definitiva**. A peça passa a ser de consumo. |
| Devolver peça de teste | Clique em **Devolver Peça de Teste**. |
| Peça com defeito | Clique em **↩️ Devolver Peça com Defeito** e escreva o defeito, que é obrigatório. |
| Terminar o serviço | Clique em **Pronta para Vistoria** e confirme em **Sim, Marcar como Pronta**. |

**O admin** vê todas as OS de todas as unidades, mas os botões ficam desabilitados ("Modo de Consulta").

> **Resumo do caminho de uma OS:** Pendente → Em atendimento → Pronta para vistoria → Concluída. Pode ser Cancelada em qualquer ponto antes de concluir.

### 4.3 Catálogo de Peças

**Quem:** todos consultam; gerente e admin editam.

1. No menu, clique em **Catálogo de Peças**.
2. Busque pelo código SIPAC ou pela descrição.
3. Cada peça mostra três saldos: **estoque** (uso definitivo), **teste** (empréstimo) e **defeito** (aguardando descarte).
4. Gerente e admin: use **+ Cadastrar Novo Item** para cadastrar, ou o lápis e a lixeira para editar e excluir.

---

## 5. Produção & Serviços

### 5.1 Minha Produção

**Quem:** todos. O técnico vê só a própria produção; gerente e admin veem a de todos.

1. No menu, clique em **Minha Produção**.
2. Clique em **Lançar Produção / Serviços**.
3. Escolha os **serviços** do catálogo e as quantidades.
4. Se o serviço foi de uma OS, de um atendimento de impressora ou de uma manutenção eletrônica, vincule-o. Informe também o GLPI e o patrimônio ou nº de série.
5. Salve. O sistema calcula o valor (o serviço mais as peças da OS) e **congela** esse valor: se o catálogo mudar depois, o seu lançamento não muda.

### 5.2 Relatórios (Dashboard e Montar Relatório)

**Quem:** gerente e admin. Menu **Administração → Relatórios**.

**Dashboard Executivo de Produção** (parte de cima):
1. Escolha o período. O admin também escolhe a unidade.
2. Veja os indicadores, o ranking de técnicos, os serviços mais feitos e os gráficos.

**Montar Relatório** (role a página até o fim):
1. Em **Fonte de dados**, escolha o assunto: Produção de Serviços, Ordens de Serviço, Peças das OS, Estoque, Impressoras, Atendimentos, Suprimentos, Patrimônio, Equipamentos Inservíveis, Usuários, Unidades e outros.
2. Em **Tipo**:
   - **Detalhado**: uma linha por registro. Marque as colunas (ou **Marcar todas**) e a ordenação.
   - **Cruzado (agrupado)**: escolha **Linhas (agrupar por)**, **Colunas (cruzar com)** e o valor (quantidade de registros, soma, média, mínimo ou máximo). Exemplo: técnicos nas linhas × meses nas colunas, somando o valor produzido.
3. Em **Filtros**, adicione condições (ex.: status = Concluída) e escolha a **Data inicial** e a **Data final**.
4. Dê um **Título do relatório**.
5. Clique em **Ver prévia** para conferir a tabela na tela.
6. Clique em **Baixar PDF**. O PDF traz, em todas as páginas: COSUP+ · Sistema de Gestão, título, data e hora de emissão, quem gerou (nome e perfil), unidade, período e filtros, além da linha de **Total** e de "Página X de Y".

**Modelos salvos:**
- Clique em **Salvar como modelo**, dê um nome e, se quiser, marque como **compartilhado** com os outros gestores.
- Da próxima vez, escolha em **📂 Carregar modelo salvo…**. Altere e use **Atualizar modelo** ou **Salvar como novo**.

> O gerente sempre recebe só os dados da própria unidade ("Os dados são sempre da sua unidade"). O admin pode escolher **Todas as unidades** ou uma específica.

### 5.3 Análises

**Quem:** gerente e admin. Menu **Administração → Análises**.

Painéis de BI com gráficos configuráveis por conjunto de dados. Use para explorar os números. Para documentos oficiais, prefira o Montar Relatório.

---

## 6. Relatório Analítico

É o laudo de **equipamento sem conserto (inservível)**, no modelo oficial da UFS. Menu **Produção & Serviços → Relatório Analítico**.

### 6.1 Técnico: emitir

1. Clique em **Novo Relatório Analítico**.
2. Digite a lista de **equipamentos** e **patrimônios**, um por linha. Use **+** para adicionar linhas.
3. Clique no PDF para conferir a **minuta**, que sai com a marca-d'água "MINUTA".
4. Envie. O relatório fica **Pendente**, e o gerente da sua unidade é avisado.

**Se o gerente devolver:** você recebe uma notificação com o motivo. Abra o relatório (situação **Devolvido**), corrija e reenvie. Enquanto não for assinado, você também pode excluí-lo.

### 6.2 Gerente: assinar ou devolver

1. Abra o relatório **Pendente** da sua unidade.
2. Confira os equipamentos.
3. Para aprovar: clique em **Assinar**, confira o **cargo** (o sistema sugere o último que você usou) e confirme.
   - O sistema dá o número, sequencial por unidade e por ano (ex.: **002/2026**).
   - O documento fica "congelado", e o PDF sempre sai igual.
   - O PDF ganha a assinatura eletrônica e um **código de verificação**.
4. Para pedir correção: clique em **Devolver** e escreva o motivo.

### 6.3 Gerente: anular ou gerar novo

- **Anular:** em um relatório assinado, clique em **Anular** e informe o motivo. O PDF passa a sair com a marca "ANULADO", e o número não é reutilizado.
- **Gerar novo:** clique em **Gerar novo** para criar um relatório com os mesmos equipamentos. Ele vai para assinatura como um novo documento.

### 6.4 Verificar autenticidade

**Quem:** todos.

1. Clique em **🛡️ Verificar autenticidade**.
2. Digite o código impresso no PDF.
3. O sistema mostra o número, a unidade, a data, quem assinou, a situação (válido ou anulado) e os equipamentos.

> O **admin** vê e baixa todos os relatórios, mas não assina, não devolve e não anula. Para saber quantos equipamentos foram dados como inservíveis, use **Montar Relatório → Equipamentos Inservíveis**.

---

## 7. Gestão de Impressoras

**Quem:** técnico de impressoras, gerente e admin.

### 7.1 Impressoras

1. Menu **Impressoras**.
2. Use os filtros (unidade, modelo, colorida, ativa).
3. **Nova Impressora**: informe nome, modelo, nº de série, IP, localização, servidor, se é colorida e se as políticas foram aplicadas.

### 7.2 Atend. Técnico

1. Menu **Atend. Técnico** → **+ Novo Atendimento**.
2. Informe o GLPI, a impressora e a data da visita, e marque se precisa de peças.
3. Ao longo do atendimento, atualize:
   - **Status:** Aguardando assistência → Em atendimento → Aguardando peça → Concluído (ou Cancelado);
   - **Chamado da assistência** e **parecer técnico**;
   - **Impressora reserva:** dados da impressora reserva, data em que foi deixada e data em que foi retirada;
   - **Impressão redirecionada:** de qual unidade para qual unidade e por quanto tempo.

### 7.3 Entrada de Toners

1. Menu **Entrada de Toners**.
2. Veja o saldo de cada cor (preto, ciano, magenta, amarelo) e das unidades de imagem.
3. Para registrar uma compra ou chegada, informe as quantidades e salve.
4. Se o saldo estiver errado, use **✏️ Corrigir Quantidade de Suprimentos**: informe a quantidade certa e a justificativa. Tudo fica no histórico.
5. O técnico que perceber uma divergência pode usar **⚠️ Reportar Erro no Estoque**, e os gestores são avisados. O botão **🕒 Histórico de Entradas / Ajustes** mostra tudo o que foi feito.

### 7.4 Saída Suprimentos

1. Menu **Saída Suprimentos** → **+ Nova Requisição**.
2. Escolha a impressora, informe o GLPI e as quantidades por cor.
3. Salve. O estoque é baixado. Se faltar saldo, o sistema recusa.

---

## 8. Eletrônica

### Fila de Manutenção

**Quem:** técnicos, técnico de eletrônica, gerente e admin.

1. Menu **Fila de Manutenção** → **+ Novo Registro**.
2. Informe o equipamento, o patrimônio, o GLPI, a descrição do problema e o **técnico responsável**.
3. O técnico de eletrônica clica em **Iniciar** (Em manutenção) e, ao terminar, em **Finalizar**, escrevendo o **Parecer Técnico Final**, que é obrigatório.
4. Quem abriu o chamado e os gerentes recebem a notificação.

Use as abas **Ativas** (Pendente e Em manutenção) e **Concluído** para acompanhar.

---

## 9. Patrimônio

**Quem:** gerente e admin.

### 9.1 Inventário de Bens

1. Menu **Inventário de Bens**.
2. Busque pelo tombamento ou pela descrição e filtre por unidade e situação.
3. Em cada bem você pode:
   - **editar** a descrição, a marca, a localização e a situação;
   - **anexar foto**;
   - ver o **histórico** (quem fez o quê e quando);
   - **atribuir a um técnico**, **devolver** ou **transferir direto para outro técnico**.
4. **Transferir para outra unidade:** selecione um ou mais bens, escolha a unidade de destino e escreva a observação.

> O gerente vê e transfere bens de outras unidades. Isso é uma regra do negócio.

### 9.2 Importar SIPAC

1. Menu **Importar SIPAC**.
2. Escolha a **unidade**.
3. Envie o arquivo exportado do SIPAC: planilha **CSV** ou **XLSX**, ou o **PDF**. O limite é de 20 MB.
4. O sistema cria os bens que ainda não existem e mostra quantos encontrou.

### 9.3 Auditoria Física (levantamento)

1. Menu **Auditoria Física** → **🚀 Iniciar Novo Levantamento Anual**.
2. Escolha a unidade que está sendo conferida.
3. Com o **leitor de código de barras**, ou digitando, informe cada tombamento encontrado.
   - **OK:** o bem é desta unidade.
   - **Inconsistente:** o bem está aqui, mas o sistema diz que é de outra unidade.
   - O sistema avisa se o tombamento não existe ou se já foi conferido.
4. Acompanhe o **Progresso da Unidade**.
5. Ao terminar, clique em **Finalizar**.

---

## 10. Administração

### 10.1 Catálogo de Serviços

**Quem:** gerente e admin.

Clique em **Novo Serviço** e cadastre os serviços que os técnicos lançam, com nome, categoria e **valor estimado** (quanto custaria fora da instituição). Serviços que não são mais usados podem ser **desativados**, sem perder o histórico.

### 10.2 Usuários

**Quem:** admin.

1. Menu **Usuários** → **+ Novo Usuário**.
2. Informe o nome completo, o usuário (login), o e-mail, o telefone, o **perfil** e a **unidade**. Gerentes e técnicos precisam ter unidade.
3. Para quem esqueceu a senha, use **Redefinir Senha de um Usuário**.

### 10.3 Unidades

**Quem:** admin.

Cadastre as unidades organizacionais com nome, **sigla** (usada na numeração dos relatórios) e campus.

---

## 11. Dúvidas frequentes

**Não vejo um item do menu.**
O seu perfil não tem acesso a ele. Veja a tabela de perfis no [README](../README.md#perfis-de-usuário).

**Não consigo abrir uma OS sendo gerente.**
É a regra: só técnicos abrem OS. O gerente gere.

**Os botões da OS estão desabilitados.**
Você é admin (só visualiza), ou a OS é de outra unidade.

**O sistema não deixa concluir a OS.**
Falta o nº do pedido SIPAC ou o almoxarifado em alguma peça. A mensagem lista quais.

**Cancelei uma OS. O que acontece com as peças?**
Voltam sozinhas para o estoque de onde saíram: principal, de teste ou de defeito.

**Assinei um Relatório Analítico com erro.**
Anule-o (o número fica reservado) e use **Gerar novo**.

**Não recebo nada no Telegram.**
Confira se a conta está vinculada e se o canal Telegram está ligado nas preferências. Se o problema continuar, avise o administrador: o servidor precisa estar com o bot configurado, e só um servidor pode usar o bot.

**No celular a tabela ficou diferente.**
É de propósito: em telas pequenas, cada linha vira um card.

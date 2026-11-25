// src/components/relatorioAnalitico/gerarPdfRelatorioAnalitico.ts
// Gera o PDF do Relatório Analítico reproduzindo o modelo oficial (Word) da COSUP:
// mesmas posições, fontes (Times), logo, marca d'água e tabela. Medidas em pontos (pt).
//   - ASSINADO: gerado a partir da "fotografia" guardada na assinatura → sempre idêntico.
//   - PENDENTE/DEVOLVIDO: minuta, com tarja "MINUTA" e sem número.
//   - ANULADO: o documento assinado com tarja "ANULADO" e o motivo.
import { jsPDF, GState } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUfs from '../../assets/relatorio-analitico/ufs-logo.png';
import marcaDagua from '../../assets/relatorio-analitico/ufs-marca-dagua.jpg';
import type { DocumentoRelatorioAnalitico, RelatorioAnalitico } from '../../types/relatorioAnalitico';

// Texto do modelo (usado nas minutas; o documento assinado traz o próprio texto guardado).
export const MODELO_V1: DocumentoRelatorioAnalitico['modelo'] = {
  versao: 1,
  cabecalho: ['UNIVERSIDADE FEDERAL DE SERGIPE', 'SUPERINTENDENCIA DE TECNOLOGIA DA INFORMAÇÃO'],
  local: 'Cidade Universitária “Prof. José Aloisio de Campos”',
  titulo: 'RELATÓRIO ANALÍTICO',
  paragrafos: [
    'De acordo com o regulamento interno da Universidade Federal de Sergipe (UFS) e considerando que a Coordenação de Suporte é o departamento responsável pela manutenção, suporte e recuperação dos equipamentos de informática pertencentes ao patrimônio da instituição, gostaria de apresentar uma análise técnica dos bens móveis listados abaixo.',
    'Após avaliar as condições de uso e considerar o atraso tecnológico e a vida útil dos equipamentos de informática relacionados, concluímos que eles não são mais viáveis para uso. Estão obsoletos e, portanto, não é economicamente vantajoso realizar reparos, uma vez que apresentam defeitos que tornam a manutenção antieconômica.',
    'Portanto, recomendamos a coleta e subsequente alienação desses equipamentos, com base no exposto.',
  ],
};

// Medidas extraídas do modelo (A4 = 595,32 x 841,92 pt)
const MARGEM_ESQ = 90;
const MARGEM_DIR_X = 505.4; // fim do texto justificado
const LARGURA_TEXTO = MARGEM_DIR_X - MARGEM_ESQ;
const TABELA_DIR_X = 523; // a tabela vai um pouco além do texto, como no modelo
const RECUO_1A_LINHA = 36;
const ENTRELINHA = 12.72;
const ESPACO_PARAGRAFO = 25.02; // da última linha de um parágrafo à 1ª do seguinte
const FUSO = 'America/Maceio'; // horário de Sergipe

const carregarImagem = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const dataPorExtenso = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: FUSO });
const dataHora = (iso: string) => {
  const d = new Date(iso);
  return {
    data: d.toLocaleDateString('pt-BR', { timeZone: FUSO }),
    hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: FUSO }),
  };
};

/** Parágrafo justificado com recuo na 1ª linha (o jsPDF não faz recuo + justificado sozinho). */
const paragrafoJustificado = (doc: jsPDF, texto: string, y: number, recuo: number) => {
  const palavras = texto.split(/\s+/).filter(Boolean);
  const linhas: string[][] = [];
  let atual: string[] = [];
  let limite = LARGURA_TEXTO - recuo;
  for (const p of palavras) {
    const teste = [...atual, p].join(' ');
    if (atual.length && doc.getTextWidth(teste) > limite) {
      linhas.push(atual);
      atual = [p];
      limite = LARGURA_TEXTO;
    } else {
      atual.push(p);
    }
  }
  if (atual.length) linhas.push(atual);

  linhas.forEach((linha, i) => {
    const x0 = MARGEM_ESQ + (i === 0 ? recuo : 0);
    const larguraLinha = LARGURA_TEXTO - (i === 0 ? recuo : 0);
    const ultima = i === linhas.length - 1;
    if (ultima || linha.length === 1) {
      doc.text(linha.join(' '), x0, y);
    } else {
      const larguraPalavras = linha.reduce((s, p) => s + doc.getTextWidth(p), 0);
      const espaco = (larguraLinha - larguraPalavras) / (linha.length - 1);
      let x = x0;
      for (const p of linha) {
        doc.text(p, x, y);
        x += doc.getTextWidth(p) + espaco;
      }
    }
    y += ENTRELINHA;
  });
  return y - ENTRELINHA; // baseline da última linha
};

/** Tarja diagonal semitransparente (MINUTA / ANULADO). */
const tarja = (doc: jsPDF, texto: string, cor: [number, number, number]) => {
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.13 }));
  doc.setTextColor(...cor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(96);
  doc.text(texto, 297.66, 520, { align: 'center', angle: 35 });
  doc.restoreGraphicsState();
  doc.setTextColor(0, 0, 0);
};

export async function gerarPdfRelatorioAnalitico(r: RelatorioAnalitico) {
  const assinado = r.status === 'ASSINADO' || r.status === 'ANULADO';
  const d: DocumentoRelatorioAnalitico | null = assinado ? r.documento : null;
  const modelo = d?.modelo ?? MODELO_V1;
  const unidadeNome = (d?.unidade.nome ?? r.unidade.nome).toUpperCase();
  const sigla = d?.unidade.sigla ?? r.unidade.sigla;
  const itens = d?.itens ?? r.itens.map(({ equipamento, patrimonio }) => ({ equipamento, patrimonio }));
  const dataDoc = d?.data_documento ?? new Date().toISOString();
  const identificacao = d ? `nº ${d.numero_formatado}${sigla ? ` – ${sigla}` : ''}` : '(minuta, ainda sem número)';

  const [logo, fundo] = await Promise.all([carregarImagem(logoUfs), carregarImagem(marcaDagua)]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const centro = largura / 2;

  const desenharFundo = () => doc.addImage(fundo, 'JPEG', 102.25, 250.2, 414.7, 341.45);
  doc.setProperties({
    title: `Relatório Analítico ${d ? d.numero_formatado : '(minuta)'}`,
    subject: 'Relatório Analítico – equipamentos sem viabilidade de reparo',
    creator: 'COSUP+ · Sistema de Gestão',
  });

  // ---- Página 1: marca d'água, logo, cabeçalho ----
  desenharFundo();
  doc.addImage(logo, 'PNG', 250.4, 72, 93.75, 78.65);
  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  const cabecalho = [...modelo.cabecalho, unidadeNome];
  cabecalho.forEach((linha, i) => doc.text(linha, centro, 176 + i * 13.8, { align: 'center' }));

  doc.setFont('times', 'normal');
  doc.text(`${modelo.local}, ${dataPorExtenso(dataDoc)}.`, centro, 230.7, { align: 'center' });

  // Título (com o número do documento quando assinado), sublinhado
  doc.setFont('times', 'bold');
  const titulo = d ? `${modelo.titulo} Nº ${d.numero_formatado}` : modelo.titulo;
  doc.text(titulo, centro, 258.7, { align: 'center' });
  const lt = doc.getTextWidth(titulo);
  doc.setLineWidth(0.6);
  doc.line(centro - lt / 2, 260.4, centro + lt / 2, 260.4);

  // ---- Corpo ----
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  let y = 298.6;
  modelo.paragrafos.forEach((p, i) => {
    const fim = paragrafoJustificado(doc, p, y, i === 0 ? RECUO_1A_LINHA : 0);
    y = fim + ESPACO_PARAGRAFO;
  });

  // ---- Tabela de equipamentos ----
  autoTable(doc, {
    startY: y - ESPACO_PARAGRAFO + 30.3,
    margin: { left: MARGEM_ESQ, right: largura - TABELA_DIR_X, top: 90, bottom: 70 },
    head: [['EQUIPAMENTO', 'PATRIMÔNIO']],
    body: itens.map((i) => [i.equipamento.toUpperCase(), i.patrimonio]),
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 11,
      textColor: 0,
      halign: 'center',
      valign: 'middle',
      lineColor: 0,
      lineWidth: 0.5,
      cellPadding: { top: 2, bottom: 1.4, left: 4, right: 4 },
      fillColor: false,
    },
    headStyles: { fontStyle: 'bold', fillColor: false, textColor: 0 },
    columnStyles: { 0: { cellWidth: (TABELA_DIR_X - MARGEM_ESQ) / 2 }, 1: { cellWidth: (TABELA_DIR_X - MARGEM_ESQ) / 2 } },
    showHead: 'everyPage',
    // Páginas seguintes (muitos equipamentos): marca d'água atrás e identificação no topo
    willDrawPage: (data) => {
      if (data.pageNumber > 1) {
        desenharFundo();
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(`${modelo.titulo} ${identificacao} (continuação)`, centro, 60, { align: 'center' });
        doc.setFont('times', 'normal');
      }
    },
  });

  // ---- Assinatura ----
  let ySig = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY ?? y) + 55;
  const alturaBloco = 125;
  if (ySig + alturaBloco > altura - 50) {
    doc.addPage();
    desenharFundo();
    ySig = 120;
  }

  doc.setFontSize(11);
  if (d) {
    doc.setFont('times', 'bold');
    doc.text(d.assinante.nome.toUpperCase(), centro, ySig, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(d.assinante.cargo, centro, ySig + 13.5, { align: 'center' });
  } else {
    doc.setLineWidth(0.5);
    doc.line(centro - 120, ySig - 4, centro + 120, ySig - 4);
    doc.setFont('times', 'italic');
    doc.text('Coordenador(a) – aguardando assinatura eletrônica', centro, ySig + 9, { align: 'center' });
  }

  // Caixa da assinatura eletrônica
  const caixaY = ySig + 28;
  const linhasCaixa: string[] = d
    ? (() => {
        const { data, hora } = dataHora(d.assinado_em);
        return [
          `Documento assinado eletronicamente por ${d.assinante.nome}, ${d.assinante.cargo}, em ${data}, às ${hora}, no sistema COSUP+.`,
          `Relatório Analítico ${identificacao}  ·  Código de verificação: ${d.codigo_verificacao}`,
          'A autenticidade deste documento pode ser conferida no COSUP+, em Relatório Analítico › Verificar autenticidade.',
        ];
      })()
    : [
        'MINUTA – este documento ainda não foi assinado e não tem validade.',
        `Emitida por ${r.tecnico.nome_completo}. O número e o código de verificação são atribuídos na assinatura do coordenador.`,
      ];
  if (r.status === 'ANULADO') {
    const { data, hora } = dataHora(r.anulado_em!);
    linhasCaixa.push(`DOCUMENTO ANULADO em ${data}, às ${hora}, por ${r.anulado_por?.nome_completo ?? '—'}. Motivo: ${r.motivo_anulacao}`);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const quebradas = linhasCaixa.flatMap((l) => doc.splitTextToSize(l, LARGURA_TEXTO - 16) as string[]);
  const alturaCaixa = 12 + quebradas.length * 10;
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.5);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(MARGEM_ESQ, caixaY, LARGURA_TEXTO, alturaCaixa, 3, 3, 'FD');
  doc.setTextColor(60, 60, 60);
  quebradas.forEach((l, i) => doc.text(l, MARGEM_ESQ + 8, caixaY + 13 + i * 10));
  doc.setTextColor(0, 0, 0);

  // ---- Tarjas e rodapé em todas as páginas ----
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    if (!d) tarja(doc, 'MINUTA', [120, 120, 120]);
    if (r.status === 'ANULADO') tarja(doc, 'ANULADO', [200, 0, 0]);
    if (total > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text(`Relatório Analítico ${identificacao} · Página ${p} de ${total}`, centro, altura - 28, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }
  }

  const nome = d
    ? `Relatorio_Analitico_${d.numero_formatado.replace('/', '-')}${sigla ? `_${sigla}` : ''}${r.status === 'ANULADO' ? '_ANULADO' : ''}.pdf`
    : `Minuta_Relatorio_Analitico_${r.id}.pdf`;
  doc.save(nome);
}

// src/components/relatorios/gerarPdf.ts
// Gera o PDF do relatório personalizado: tabela em linhas e colunas, com cabeçalho
// (sistema, título, data/hora de emissão, quem gerou, unidade, período e filtros)
// repetido em todas as páginas e rodapé "Página X de Y".
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUfs from '../../assets/ufs_horizontal_positiva.svg';
import type { ResultadoRelatorio } from '../../types/relatorioPersonalizado';
import { alinhamentoDireita, formatarValor, PAPEIS, textoTotal } from './formatarValor';

const NOME_SISTEMA = 'COSUP+ · Sistema de Gestão';
const AZUL: [number, number, number] = [13, 110, 253];

/** Converte o logo SVG em PNG (o jsPDF não desenha SVG). Se falhar, o PDF sai sem logo. */
const carregarLogo = (): Promise<{ data: string; w: number; h: number } | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const escala = 3;
        const canvas = document.createElement('canvas');
        canvas.width = (img.naturalWidth || 300) * escala;
        canvas.height = (img.naturalHeight || 100) * escala;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ data: canvas.toDataURL('image/png'), w: canvas.width, h: canvas.height });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = logoUfs;
  });

const nomeArquivo = (titulo: string) =>
  `${titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')}_${new Date().toISOString().slice(0, 10)}.pdf`;

export async function gerarPdfRelatorio(r: ResultadoRelatorio) {
  const paisagem = r.colunas.length > 6;
  const doc = new jsPDF({ orientation: paisagem ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 12;
  const logo = await carregarLogo();

  const emitidoEm = new Date(r.meta.gerado_em).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const papel = PAPEIS[r.meta.gerado_por.papel] ?? r.meta.gerado_por.papel;

  const linhasInfo = [
    `Emitido em: ${emitidoEm}`,
    `Gerado por: ${r.meta.gerado_por.nome} (${papel})`,
    `Unidade: ${r.meta.unidade}${r.meta.periodo ? `   ·   Período: ${r.meta.periodo}` : ''}`,
    `Fonte: ${r.meta.fonte}   ·   Tipo: ${r.meta.tipo === 'cruzado' ? 'Cruzado (agrupado)' : 'Detalhado'}   ·   Registros: ${r.total_registros.toLocaleString('pt-BR')}`,
    ...(r.meta.filtros.length ? [`Filtros: ${r.meta.filtros.join('; ')}`] : []),
  ];

  // Altura do cabeçalho (depende de quantas linhas de informação os filtros ocupam)
  doc.setFontSize(8.5);
  const infoQuebrada = linhasInfo.flatMap((l) => doc.splitTextToSize(l, largura - margem * 2) as string[]);
  const alturaCabecalho = 26 + infoQuebrada.length * 4;

  const desenharCabecalho = () => {
    let x = margem;
    if (logo) {
      const h = 11;
      const w = (logo.w / logo.h) * h;
      doc.addImage(logo.data, 'PNG', margem, 8, w, h);
      x = margem + w + 4;
    }
    doc.setTextColor(...AZUL);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(NOME_SISTEMA, x, 11.5);
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(14);
    doc.text(r.meta.titulo, x, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    doc.text(infoQuebrada, margem, 26);

    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.5);
    doc.line(margem, alturaCabecalho - 2, largura - margem, alturaCabecalho - 2);
  };

  const cabecalhoTabela = r.colunas.map((c) => c.label);
  const corpo = r.linhas.map((l) => r.colunas.map((c) => formatarValor(l[c.key], c.tipo)));
  const rodape = r.totais
    ? [
        r.colunas.map((c, i) => {
          const tem = !!r.totais && c.key in r.totais;
          return textoTotal(i, tem, tem ? formatarValor(r.totais![c.key], c.tipo) : '');
        }),
      ]
    : undefined;

  const estiloColunas: Record<number, { halign: 'right' }> = {};
  r.colunas.forEach((c, i) => {
    if (alinhamentoDireita(c.tipo)) estiloColunas[i] = { halign: 'right' };
  });

  autoTable(doc, {
    head: [cabecalhoTabela],
    body: corpo.length ? corpo : [[{ content: 'Nenhum registro encontrado com os filtros escolhidos.', colSpan: r.colunas.length || 1 }]],
    foot: corpo.length ? rodape : undefined,
    startY: alturaCabecalho + 2,
    margin: { top: alturaCabecalho + 2, left: margem, right: margem, bottom: 14 },
    theme: 'grid',
    styles: { fontSize: r.colunas.length > 10 ? 6.5 : 8, cellPadding: 1.6, overflow: 'linebreak', lineColor: [222, 226, 230] },
    headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [233, 236, 239], textColor: [33, 37, 41], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: estiloColunas,
    showHead: 'everyPage',
    showFoot: 'lastPage',
    didDrawPage: desenharCabecalho,
    // Cabeçalho e total das colunas numéricas alinhados à direita, como os valores.
    didParseCell: (data) => {
      if ((data.section === 'head' || data.section === 'foot') && estiloColunas[data.column.index]) {
        data.cell.styles.halign = 'right';
      }
    },
  });

  // Rodapé com numeração (precisa do total de páginas, então é desenhado no fim)
  const totalPaginas = doc.getNumberOfPages();
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text(`${NOME_SISTEMA} · Emitido em ${emitidoEm} por ${r.meta.gerado_por.nome}`, margem, altura - 6);
    doc.text(`Página ${p} de ${totalPaginas}`, largura - margem, altura - 6, { align: 'right' });
  }

  doc.save(nomeArquivo(r.meta.titulo));
}

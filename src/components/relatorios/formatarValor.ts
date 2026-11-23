// src/components/relatorios/formatarValor.ts
import type { TipoCampo, Valor } from '../../types/relatorioPersonalizado';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

/** Formata um valor do relatório para exibição (tela e PDF). */
export const formatarValor = (v: Valor | undefined, tipo: TipoCampo): string => {
  if (v === null || v === undefined || v === '') return '—';
  if (v === '(vazio)') return '(vazio)';
  switch (tipo) {
    case 'moeda':
      return moeda.format(Number(v));
    case 'numero':
      return numero.format(Number(v));
    case 'booleano':
      return v === true || v === 'true' ? 'Sim' : 'Não';
    case 'mes': {
      const [a, m] = String(v).split('-');
      return m ? `${m}/${a}` : String(v);
    }
    case 'data': {
      const d = new Date(String(v));
      if (Number.isNaN(d.getTime())) return String(v);
      const soData = /^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z)?$/.test(String(v));
      return soData
        ? d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
        : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    default:
      return String(v);
  }
};

/** Texto da célula de total: a 1ª coluna sempre leva o rótulo "TOTAL". */
export const textoTotal = (indice: number, temTotal: boolean, valorFormatado: string) =>
  indice === 0 ? (temTotal ? `TOTAL: ${valorFormatado}` : 'TOTAL') : temTotal ? valorFormatado : '';

export const alinhamentoDireita = (tipo: TipoCampo) => tipo === 'moeda' || tipo === 'numero';

export const PAPEIS: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente de Unidade',
  tecnico: 'Técnico',
  tecnico_impressora: 'Técnico de Impressoras',
  tecnico_eletronica: 'Técnico de Eletrônica',
};

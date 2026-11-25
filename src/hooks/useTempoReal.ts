// src/hooks/useTempoReal.ts
// Atualização automática das telas.
//
// O backend avisa, depois de qualquer alteração, quais áreas mudaram:
//   evento `dados_atualizados` { canais: ['os', 'estoque', ...] }
// (mapa das rotas em Gestio_back/src/realtime/avisarMudancas.ts).
//
// Uso numa tela:
//   useTempoReal(['os', 'estoque'], () => carregar(true));
//
// - Avisos seguidos são agrupados (uma recarga só, ~400 ms depois do último).
// - Ao reconectar depois de uma queda, recarrega: avisos perdidos no meio não deixam a tela velha.
// - A função mais recente é sempre a usada, então a tela pode passar uma função nova a cada render.
import { useEffect, useRef } from 'react';
import { socket } from '../services/socket';

export const EVENTO_DADOS_ATUALIZADOS = 'dados_atualizados';

export type CanalTempoReal =
  | 'os'
  | 'estoque'
  | 'impressoras'
  | 'atendimentos'
  | 'suprimentos'
  | 'manutencao'
  | 'patrimonio'
  | 'levantamento'
  | 'servicos'
  | 'producao'
  | 'relatorios_analiticos'
  | 'relatorio_modelos'
  | 'analises'
  | 'usuarios'
  | 'unidades';

/** Todos os canais: para painéis que resumem o sistema inteiro. */
export const TODOS_OS_CANAIS: CanalTempoReal[] = [
  'os', 'estoque', 'impressoras', 'atendimentos', 'suprimentos', 'manutencao', 'patrimonio',
  'levantamento', 'servicos', 'producao', 'relatorios_analiticos', 'usuarios', 'unidades',
];

const ESPERA_MS = 400;

export function useTempoReal(canais: readonly CanalTempoReal[], aoMudar: () => void, ativo = true) {
  const callback = useRef(aoMudar);
  callback.current = aoMudar;

  // Os canais viram texto para o efeito não reinscrever a cada render (arrays novos).
  const chave = [...canais].sort().join(',');

  useEffect(() => {
    if (!ativo || !chave) return;
    const meus = new Set(chave.split(','));
    let timer: ReturnType<typeof setTimeout> | undefined;
    let caiu = false;

    const agendar = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => callback.current(), ESPERA_MS);
    };

    const onDados = (payload?: { canais?: string[] }) => {
      if (payload?.canais?.some((c) => meus.has(c))) agendar();
    };
    const onDisconnect = () => { caiu = true; };
    const onConnect = () => {
      if (caiu) { caiu = false; agendar(); }
    };

    socket.on(EVENTO_DADOS_ATUALIZADOS, onDados);
    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);
    return () => {
      if (timer) clearTimeout(timer);
      socket.off(EVENTO_DADOS_ATUALIZADOS, onDados);
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
    };
  }, [chave, ativo]);
}

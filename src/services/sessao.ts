// src/services/sessao.ts
// Sessão de login POR ABA.
//
// Antes, o token ficava só no localStorage, que é compartilhado por todas as abas do navegador.
// Com o técnico numa aba e o gerente em outra, o último login sobrescrevia o token da outra aba:
// a aba do "técnico" passava a agir (e a receber notificações) como gerente.
//
// Agora:
//  - cada aba guarda o próprio login no sessionStorage (não é compartilhado entre abas);
//  - o localStorage guarda só o ÚLTIMO login, para uma aba nova já abrir logada (como antes);
//  - sair numa aba não derruba outra aba logada com outro usuário.
const TOKEN = 'authToken';
const USUARIO = 'authUser';
// Marca "esta aba saiu / teve a sessão encerrada": ela não herda o login de outra aba.
// (Sem isto, ao expirar, a aba voltava logada como o último usuário que entrou em OUTRA aba.)
const ENCERRADA = 'sessaoEncerrada';

const seguro = <T>(fn: () => T, padrao: T): T => {
  try {
    return fn();
  } catch {
    return padrao; // navegação privada / armazenamento bloqueado
  }
};

// Aba recém-aberta, ainda sem sessão própria: herda o último login deste navegador.
seguro(() => {
  if (!sessionStorage.getItem(TOKEN) && !sessionStorage.getItem(ENCERRADA) && localStorage.getItem(TOKEN)) {
    sessionStorage.setItem(TOKEN, localStorage.getItem(TOKEN)!);
    const u = localStorage.getItem(USUARIO);
    if (u) sessionStorage.setItem(USUARIO, u);
  }
}, undefined);

export const getToken = (): string | null => seguro(() => sessionStorage.getItem(TOKEN), null);

export const getUsuarioSalvo = <T>(): T | null =>
  seguro(() => {
    const u = sessionStorage.getItem(USUARIO);
    return u ? (JSON.parse(u) as T) : null;
  }, null);

export const salvarSessao = (token: string, usuario: unknown) => {
  const u = JSON.stringify(usuario);
  seguro(() => {
    sessionStorage.removeItem(ENCERRADA);
    sessionStorage.setItem(TOKEN, token);
    sessionStorage.setItem(USUARIO, u);
    localStorage.setItem(TOKEN, token);
    localStorage.setItem(USUARIO, u);
  }, undefined);
};

/** Atualiza os dados do usuário guardados (ex.: preferências), sem trocar o token. */
export const atualizarUsuarioSalvo = (usuario: unknown) => {
  const u = JSON.stringify(usuario);
  seguro(() => {
    sessionStorage.setItem(USUARIO, u);
    if (localStorage.getItem(TOKEN) === sessionStorage.getItem(TOKEN)) localStorage.setItem(USUARIO, u);
  }, undefined);
};

export const limparSessao = () => {
  seguro(() => {
    const meu = sessionStorage.getItem(TOKEN);
    sessionStorage.removeItem(TOKEN);
    sessionStorage.removeItem(USUARIO);
    sessionStorage.setItem(ENCERRADA, '1');
    // Só apaga o "último login" se ele for desta aba; outro usuário logado em outra aba continua.
    if (localStorage.getItem(TOKEN) === meu) {
      localStorage.removeItem(TOKEN);
      localStorage.removeItem(USUARIO);
    }
  }, undefined);
};

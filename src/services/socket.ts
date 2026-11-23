import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../config';

export const socket: Socket = io(SERVER_URL, {
  autoConnect: false,
  // O backend autentica o socket pelo JWT; a função é chamada a cada (re)conexão,
  // então sempre usa o token atual.
  auth: (cb) => cb({ token: localStorage.getItem('authToken') }),
});

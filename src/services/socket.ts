import {io, Socket} from 'socket.io-client';

const apiUrl= import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const socketUrl = apiUrl.replace('/api', '');

export const socket: Socket = io(socketUrl, {
    autoConnect:false,
});

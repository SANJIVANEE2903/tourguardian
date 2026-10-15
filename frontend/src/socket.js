import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

let socket = null;

/**
 * Creates (or reuses) a single Socket.IO connection authenticated with
 * the current JWT. Call connectSocket() once after login / on app load
 * if a token exists; call disconnectSocket() on logout.
 */
export function connectSocket() {
  const token = localStorage.getItem('tg_token');
  if (!token) return null;

  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling']
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

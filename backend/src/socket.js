const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

/**
 * Initializes Socket.IO on top of the existing HTTP server.
 * Call this once from server.js, passing the http.Server instance.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST']
    }
  });

  // Auth every socket connection with the same JWT used for REST calls.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, email, role, name }
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role, name } = socket.user;

    // Every user gets a personal room so we can push them targeted events.
    socket.join(`user:${id}`);

    // Admins join a shared room so they can see all live SOS + location events.
    if (role === 'admin') {
      socket.join('admins');
    }

    console.log(`🔌 Socket connected: ${name} (${role}) [${socket.id}]`);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${name} [${socket.id}]`);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
}

/**
 * Get the active io instance from anywhere (controllers, etc).
 * Throws if called before initSocket() has run.
 */
function getIO() {
  if (!io) throw new Error('Socket.IO not initialized yet');
  return io;
}

module.exports = { initSocket, getIO };

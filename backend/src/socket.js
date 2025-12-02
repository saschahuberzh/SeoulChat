const { Server } = require('socket.io');
const { verifySocketToken } = require('./middleware/auth');
const prisma = require('./config/database');

/**
 * FRONTEND TEAM DOCUMENTATION
 * 
 * Socket.io Events:
 * 
 * 1. Connection
 *    - Connect with cookies containing 'accessToken'.
 *    - Server automatically joins the user to a room named by their userId.
 *    - User status is updated to 'online'.
 * 
 * 2. Client -> Server Events
 *    - 'joinChat': (chatId) => Joins the socket room for a specific chat.
 *      Usage: Call this when the user opens a chat window.
 *    - 'leaveChat': (chatId) => Leaves the socket room for a specific chat.
 *      Usage: Call this when the user closes/navigates away from a chat.
 * 
 * 3. Server -> Client Events
 *    - 'newMessage': (messageObject) => Received when a new message is sent to a room the user is in.
 *      Payload: Full message object (id, content, sender, createdAt, etc.)
 */

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
  });

  io.use(verifySocketToken);

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${userId}`);

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'online', lastSeen: new Date() }
      });
    } catch (err) {
      console.error('Error updating user status:', err);
    }

    socket.join(userId);

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${userId} left chat ${chatId}`);
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { status: 'away', lastSeen: new Date() }
        });
      } catch (err) {
        console.error('Error updating user status on disconnect:', err);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };

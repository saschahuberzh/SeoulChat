const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const { verifySocketToken } = require('./middleware/auth');
const prisma = require('./config/database');

/**
 * FRONTEND TEAM DOCUMENTATION
 * 
 * Socket.io Connection & Events:
 * 
 * 1. Connection Setup
 *    - URL: ws://localhost:3001 (or your backend URL)
 *    - Must include credentials (cookies) for authentication
 *    - Example (JavaScript):
 *      ```
 *      import { io } from 'socket.io-client';
 *      const socket = io('http://localhost:3001', {
 *        withCredentials: true
 *      });
 *      ```
 * 
 * 2. Automatic Behavior on Connect
 *    - User status is automatically set to 'online'
 *    - User is auto-joined to:
 *      a) Their personal room (userId) - for private notifications
 *      b) ALL chat rooms they are members of - for receiving messages
 *    - You will receive messages from all your chats, even ones not currently open
 * 
 * 3. Client -> Server Events (Optional)
 *    - 'joinChat': (chatId) => Manually join a chat room
 *      - Not required since auto-joined on connect
 *      - Use if user joins a new chat while connected
 *      Example: socket.emit('joinChat', 'chat-uuid-here');
 *    
 *    - 'leaveChat': (chatId) => Leave a specific chat room
 *      - Optional, use if you want to stop receiving messages from a chat
 *      Example: socket.emit('leaveChat', 'chat-uuid-here');
 * 
 * 4. Server -> Client Events (Listen for these)
 *    - 'newMessage': (messageObject) => New message in any of your chats
 *      Payload structure:
 *      {
 *        id: string,
 *        content: string,
 *        senderID: string,
 *        groupID: string,
 *        createdAt: Date,
 *        sender: {
 *          id: string,
 *          username: string,
 *          avatarUrl: string | null
 *        }
 *      }
 *      Example: socket.on('newMessage', (message) => { console.log(message); });
 * 
 * 5. Disconnect Behavior
 *    - User status automatically set to 'away'
 *    - lastSeen timestamp updated
 * 
 * 6. Usage Pattern
 *    - Connect once when user logs in
 *    - Listen for 'newMessage' globally
 *    - Use message.groupID to determine which chat the message belongs to
 *    - Show notifications for messages in inactive chats
 *    - Update UI for messages in the currently active chat
 */

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "https://admin.socket.io"],
      credentials: true
    }
  });

  instrument(io, {
    auth: false,
    mode: "development",
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

      const userChats = await prisma.userGroup.findMany({
        where: { userID: userId },
        select: { groupID: true }
      });

      userChats.forEach(chat => {
        socket.join(chat.groupID);
        console.log(`User ${userId} auto-joined chat ${chat.groupID}`);
      });
    } catch (err) {
      console.error('Error updating user status:', err);
    }

    socket.join(userId);

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${userId} manually joined chat ${chatId}`);
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

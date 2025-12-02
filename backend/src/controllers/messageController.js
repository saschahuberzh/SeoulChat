const prisma = require('../config/database');

const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const membership = await prisma.userGroup.findUnique({
      where: {
        userID_groupID: {
          userID: userId,
          groupID: chatId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderID: userId,
        groupID: chatId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    // Emit Socket.io event to notify other users in the room
    if (req.io) {
      req.io.to(chatId).emit('newMessage', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    // Verify user is a member of the group
    const membership = await prisma.userGroup.findUnique({
      where: {
        userID_groupID: {
          userID: userId,
          groupID: chatId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    const messages = await prisma.message.findMany({
      where: {
        groupID: chatId
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

module.exports = {
  sendMessage,
  getMessages
};

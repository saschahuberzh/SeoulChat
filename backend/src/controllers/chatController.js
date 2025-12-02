const prisma = require('../config/database');


const createPrivateChat = async (req, res) => {
  const { username } = req.body;
  const userId = req.user.id; 

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Find the partner user by username
    const partner = await prisma.user.findUnique({
      where: { username }
    });

    if (!partner) {
      return res.status(404).json({ error: 'User not found' });
    }

    const partnerId = partner.id;

    if (userId === partnerId) {
      return res.status(400).json({ error: 'Cannot create chat with yourself' });
    }

    const existingChat = await prisma.group.findFirst({
      where: {
        isPrivateChat: true,
        AND: [
          { users: { some: { userID: userId } } },
          { users: { some: { userID: partnerId } } }
        ]
      },
      include: {
        users: {
          include: {
            user: { select: { id: true, username: true, email: true, avatarUrl: true, status: true } }
          }
        }
      }
    });

    if (existingChat) {
      const formattedChat = {
        ...existingChat,
        users: existingChat.users.map(ug => ug.user)
      };
      return res.status(200).json(formattedChat);
    }

    const newChat = await prisma.group.create({
      data: {
        name: 'Private Chat',
        isPrivateChat: true,
        users: {
          create: [
            { userID: userId },
            { userID: partnerId }
          ]
        }
      },
      include: {
        users: {
          include: {
            user: { select: { id: true, username: true, email: true, avatarUrl: true, status: true } }
          }
        }
      }
    });

    const formattedChat = {
      ...newChat,
      users: newChat.users.map(ug => ug.user)
    };

    res.status(201).json(formattedChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

const getUserChats = async (req, res) => {
  const userId = req.user.id;
  try {
    const chats = await prisma.group.findMany({
      where: {
        users: {
          some: {
            userID: userId
          }
        }
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                status: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    const formattedChats = chats.map(chat => ({
      ...chat,
      users: chat.users.map(ug => ug.user)
    }));

    res.json(formattedChats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

const deleteChat = async (req, res) => {
  const { chatId } = req.params;
  
  try {
    await prisma.group.delete({
      where: { id: chatId }
    });
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

const leaveChat = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    const chat = await prisma.group.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await prisma.userGroup.delete({
      where: {
        userID_groupID: {
          userID: userId,
          groupID: chatId
        }
      }
    });

    const remainingUsers = await prisma.userGroup.count({
      where: { groupID: chatId }
    });

    if (remainingUsers === 0) {
      await prisma.group.delete({
        where: { id: chatId }
      });
      return res.status(200).json({ message: 'Left chat and chat deleted as it became empty' });
    }

    res.status(200).json({ message: 'Successfully left the chat' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to leave chat' });
  }
};

const searchUsers = async (req, res) => {
  const { username } = req.query;
  const currentUserId = req.user.id;

  if (!username) {
    return res.status(400).json({ error: 'Username query parameter is required' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: 'insensitive'
        },
        id: {
          not: currentUserId
        }
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        status: true
      },
      take: 20
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

module.exports = {
  createPrivateChat,
  getUserChats,
  deleteChat,
  leaveChat,
  searchUsers
};

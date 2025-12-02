const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');
const authRoutes = require('./auth');
const chatRoutes = require('./chatRoutes');
const messageRoutes = require('./messageRoutes');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/chats/:chatId/messages', messageRoutes);

module.exports = router;

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');
const authRoutes = require('./auth');
const chatRoutes = require('./chatRoutes');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);

module.exports = router;

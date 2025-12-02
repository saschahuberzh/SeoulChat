const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams allows access to chatId from parent router
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management
 */

/**
 * @swagger
 * /chats/{chatId}/messages:
 *   post:
 *     summary: Send a message to a chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       403:
 *         description: Not a member of this chat
 */
router.post('/', verifyToken, messageController.sendMessage);

/**
 * @swagger
 * /chats/{chatId}/messages:
 *   get:
 *     summary: Get messages for a chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The chat ID
 *     responses:
 *       200:
 *         description: List of messages
 *       403:
 *         description: Not a member of this chat
 */
router.get('/', verifyToken, messageController.getMessages);

module.exports = router;

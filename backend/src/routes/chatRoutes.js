const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth'); 

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat management
 */

/**
 * @swagger
 * /chats/private:
 *   post:
 *     summary: Create or retrieve a private chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Existing chat returned
 *       201:
 *         description: New chat created
 *       400:
 *         description: Missing username
 *       404:
 *         description: User not found
 */
router.post('/private', verifyToken, chatController.createPrivateChat);

/**
 * @swagger
 * /chats/users/search:
 *   get:
 *     summary: Search for users to chat with
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username to search for (partial match)
 *     responses:
 *       200:
 *         description: List of users found
 *       400:
 *         description: Missing username parameter
 */
router.get('/users/search', verifyToken, chatController.searchUsers);

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Get all chats for the current user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 */
router.get('/', verifyToken, chatController.getUserChats);

/**
 * @swagger
 * /chats/{chatId}:
 *   delete:
 *     summary: Delete a chat explicitly
 *     tags: [Chats]
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
 *         description: Chat deleted
 */
router.delete('/:chatId', verifyToken, chatController.deleteChat);

/**
 * @swagger
 * /chats/{chatId}/leave:
 *   delete:
 *     summary: Leave a chat
 *     tags: [Chats]
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
 *         description: Successfully left chat
 *       404:
 *         description: Chat not found
 */
router.delete('/:chatId/leave', verifyToken, chatController.leaveChat);

module.exports = router;

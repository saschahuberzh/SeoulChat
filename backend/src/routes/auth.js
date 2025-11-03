const express = require('express');
const router = express.Router();
const { register, login, me, logout, logoutAll } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *               displayName: 
 *                 type: string
 *                 example: John Doe
 *                 nullable: true
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                    
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Registration failed
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=...; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized (token missing, invalid, or expired)
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user profile
 */
router.get('/me', verifyToken, me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Authentication
 *     description: Clears authentication cookies and invalidates the refresh token on the server.
 *     responses:
 *       200:
 *         description: Logout successful. Cookies are cleared.
 *       500:
 *         description: Logout failed on the server, but cookies might still be cleared.
 */
router.post('/logout', logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout user from all devices
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     description: Invalidates all refresh tokens for the current user on the server and clears authentication cookies for the current session.
 *     responses:
 *       200:
 *         description: Successfully logged out from all devices.
 *       401:
 *         description: Unauthorized (token missing, invalid, or expired)
 *       500:
 *         description: Server error during logout process.
 */
router.post('/logout-all', verifyToken, logoutAll);

module.exports = router;

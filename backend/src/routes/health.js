const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check the health of the service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: The service is up and running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Backend is running
 */
router.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

module.exports = router;

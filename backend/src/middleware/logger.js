const morgan = require('morgan');
const prisma = require('../config/database');
const jwt = require('jsonwebtoken');

morgan.token('response-time-ms', (req, res) => {
  return res.getHeader('X-Response-Time') || 0;
});

morgan.token('user-id', (req) => {
  const token = req.cookies?.accessToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
      return decoded.userId;
    } catch (error) {
      return 'null';
    }
  }
  return 'null';
});

const dbStream = {
  write: async (message) => {
    try {
      const parts = message.trim().split(' ');
      const ipAddress = parts[0];
      const userId = parts[1] !== 'null' ? parseInt(parts[1], 10) : null;
      const method = parts[2];
      const url = parts[3];
      const status = parseInt(parts[4], 10);
      const responseTimeStr = parts[5];
      const responseTime = parseInt(responseTimeStr, 10);
      const userAgent = parts.slice(8).join(' ').trim();

      await prisma.log.create({
        data: {
          method,
          url,
          status,
          responseTime,
          userAgent: userAgent || null,
          ipAddress,
          userID: userId,
        },
      });
    } catch (error) {
      console.error('Error logging to database:', error);
    }
  },
};

const logger = morgan(':remote-addr :user-id :method :url :status :response-time[digits] ms - :user-agent', {
  stream: dbStream,
});

module.exports = logger;

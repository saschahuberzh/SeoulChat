const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

const handleTokenRefresh = async (refreshTokenFromCookie, res) => {
  try {
    const decodedRefresh = jwt.verify(
      refreshTokenFromCookie,
      process.env.JWT_REFRESH_SECRET
    );

    const existingToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenFromCookie },
      include: { user: true },
    });

    if (!existingToken || existingToken.user.id !== decodedRefresh.userId) {
      console.error('Invalid or mismatched refresh token.');
      return null;
    }

    const { user } = existingToken;

    await prisma.refreshToken.delete({
      where: { id: existingToken.id },
    });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
      },
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return user.id;
  } catch (refreshError) {
    console.error('Token refresh failed:', refreshError.message);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return null;
  }
};

const verifyToken = async (req, res, next) => {
  const { accessToken, refreshToken: refreshTokenFromCookie } = req.cookies;

  if (!accessToken) {
    if (refreshTokenFromCookie) {
      const newUserId = await handleTokenRefresh(refreshTokenFromCookie, res);
      if (newUserId) {
        req.userId = newUserId;
        return next();
      }
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const refreshWindow = 5 * 60; // 5 minutes

    if (decoded.exp - nowInSeconds < refreshWindow && refreshTokenFromCookie) {
      await handleTokenRefresh(refreshTokenFromCookie, res);
    }

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' && refreshTokenFromCookie) {
      const newUserId = await handleTokenRefresh(refreshTokenFromCookie, res);
      if (newUserId) {
        req.userId = newUserId;
        return next();
      }
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = { verifyToken, generateTokens };

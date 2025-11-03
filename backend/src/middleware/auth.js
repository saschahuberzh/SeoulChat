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
    const user = await prisma.user.findUnique({
      where: { id: decodedRefresh.userId },
    });

    if (!user || user.refreshToken !== refreshTokenFromCookie) {
      return null;
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user.id;
  } catch (refreshError) {
    console.error('Token refresh failed:', refreshError.message);
    return null;
  }
};

const verifyToken = async (req, res, next) => {
  const { accessToken, refreshToken: refreshTokenFromCookie } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const refreshWindow = 5 * 60; 

    if (decoded.exp - nowInSeconds < refreshWindow && refreshTokenFromCookie) {
      handleTokenRefresh(refreshTokenFromCookie, res);
    }

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' && refreshTokenFromCookie) {
      const newUserId = await handleTokenRefresh(refreshTokenFromCookie, res);
      if (newUserId) {
        req.userId = newUserId;
        return next();
      }
      return res.status(401).json({ error: 'Token refresh failed' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyToken };

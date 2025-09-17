const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // For development, allow anonymous access
    if (!authHeader || authHeader === 'Bearer anonymous') {
      req.user = { id: 'anonymous', isPremium: false };
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Authentication not configured' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    logger.error('Authentication error', { error: error.message });
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

const requirePremium = (req, res, next) => {
  if (!req.user?.isPremium) {
    return res.status(403).json({ 
      error: 'Premium subscription required',
      message: 'This feature requires a premium subscription'
    });
  }
  next();
};

const generateToken = (userId, isPremium = false) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    { 
      id: userId, 
      isPremium,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    },
    JWT_SECRET
  );
};

module.exports = {
  authenticateUser,
  requirePremium,
  generateToken
};
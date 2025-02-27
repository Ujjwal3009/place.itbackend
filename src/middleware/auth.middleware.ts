import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { CustomRequest } from '../types';
import { logger } from '../utils/logger';

export const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn('No token provided or invalid token format');
      return res.status(401).json({ message: 'Authorization denied' });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      req.context = { userId: decoded.userId };
      logger.info('Token verified successfully', { userId: decoded.userId });
      next();
    } catch (error) {
      logger.error('Token verification failed', { error });
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    logger.error('Auth middleware error', { error });
    return res.status(500).json({ message: 'Server Error' });
  }
};
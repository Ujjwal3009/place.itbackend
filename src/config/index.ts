import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '9000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/api',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  logLevel: process.env.LOG_LEVEL || 'info'
} as const; 
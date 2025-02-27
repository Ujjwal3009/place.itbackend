import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { logger } from './utils/logger';
import { routes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { User } from './models/user.model';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(config.mongoUri)
  .then(async () => {
    logger.info('Connected to MongoDB');
    try {
      await User.collection.dropIndex('username_1');
      logger.info('Dropped username index');
    } catch (error) {
      logger.info('No username index to drop');
    }
  })
  .catch((err) => logger.error('MongoDB connection error:', err));

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log('Registered routes:', app._router.stack.filter((r: any) => r.route).map((r: any) => r.route.path));
});

export default app; 
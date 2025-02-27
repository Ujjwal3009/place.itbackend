import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';
import { authRouter } from './auth.routes';
import { placeRouter } from './place.routes';

export const routes = Router();

routes.get('/health', healthCheck); 

routes.use('/auth', authRouter);
routes.use('/places', placeRouter);
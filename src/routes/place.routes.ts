import { Router } from 'express';
import { PlaceController } from '../controllers/place.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const placeRouter = Router();

// Public routes
placeRouter.get('/', PlaceController.getAllPlaces);
placeRouter.get('/all', PlaceController.getAllPlacesWithoutPagination);
placeRouter.get('/discover', PlaceController.discoverPlaces);
placeRouter.get('/:id', PlaceController.getPlaceById);

// Protected routes can be added here 
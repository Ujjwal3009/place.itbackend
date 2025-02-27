import { Request, Response } from 'express';
import { Place } from '../models/place.model';
import { logger } from '../utils/logger';

interface DiscoverPlace {
  id: string;
  title: string;
  thumbnail: string;
  categories: string[];
  author: {
    username: string;
    profilePhoto: string;
  };
}

export class PlaceController {
  // Get all public places
  static async getAllPlaces(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category, search } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);

      logger.info('Fetching places', { page, limit, category, search });

      // Build query
      const query: any = { isPublic: true };
      
      // Add category filter if provided
      if (category) {
        query.category = category;
      }

      // Add search filter if provided
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } },
          { 'location.country': { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count for pagination
      const total = await Place.countDocuments(query);

      // Fetch places with pagination
      const places = await Place.find(query)
        .populate('userId', 'username fullName profilePhoto')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      logger.info('Places fetched successfully', { 
        count: places.length,
        total,
        page: pageNumber
      });

      return res.json({
        places,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalPlaces: total,
        hasMore: pageNumber * limitNumber < total
      });

    } catch (error) {
      const serverError = error as Error;
      logger.error('Error fetching places', {
        message: serverError.message,
        stack: serverError.stack
      });
      return res.status(500).json({
        message: 'Error fetching places',
        details: process.env.NODE_ENV === 'development' ? serverError.message : undefined
      });
    }
  }

  // Get place by ID
  static async getPlaceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      logger.info('Fetching place by ID', { id });

      const place = await Place.findById(id)
        .populate('userId', 'username fullName profilePhoto');

      if (!place) {
        logger.warn('Place not found', { id });
        return res.status(404).json({ message: 'Place not found' });
      }

      if (!place.isPublic) {
        logger.warn('Attempted to access private place', { id });
        return res.status(403).json({ message: 'This place is private' });
      }

      logger.info('Place fetched successfully', { id });
      return res.json({ place });

    } catch (error) {
      const serverError = error as Error;
      logger.error('Error fetching place', {
        message: serverError.message,
        stack: serverError.stack
      });
      return res.status(500).json({
        message: 'Error fetching place',
        details: process.env.NODE_ENV === 'development' ? serverError.message : undefined
      });
    }
  }

  // Get all places without pagination
  static async getAllPlacesWithoutPagination(req: Request, res: Response) {
    try {
      logger.info('Fetching all places without pagination');

      const places = await Place.find({ isPublic: true })
        .populate('userId', 'username fullName profilePhoto')
        .sort({ createdAt: -1 });

      logger.info('All places fetched successfully', { 
        count: places.length
      });

      return res.json({
        places,
        total: places.length
      });

    } catch (error) {
      const serverError = error as Error;
      logger.error('Error fetching all places', {
        message: serverError.message,
        stack: serverError.stack
      });
      return res.status(500).json({
        message: 'Error fetching places',
        details: process.env.NODE_ENV === 'development' ? serverError.message : undefined
      });
    }
  }

  // Discover places
  static async discoverPlaces(req: Request, res: Response) {
    try {
      const { search } = req.query;
      logger.info('Fetching places for discover', { search });

      // Build query
      const query: any = { 
        isPublic: true,
        'photos.0': { $exists: true } // Ensure at least one photo exists
      };

      // Add search filter if provided
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } },
          { 'location.country': { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      const places = await Place.find(query)
        .populate('userId', 'username profilePhoto')
        .sort({ createdAt: -1 });

      // Transform to required format
      const discoverPlaces: DiscoverPlace[] = places.map(place => ({
        id: place._id.toString(),
        title: place.title,
        thumbnail: place.photos[0]?.url || '', // Get first photo as thumbnail
        categories: place.category,
        author: {
          username: (place.userId as any).username,
          profilePhoto: (place.userId as any).profilePhoto
        }
      }));

      logger.info('Discover places fetched successfully', { 
        count: discoverPlaces.length,
        hasSearch: !!search
      });

      return res.json({
        places: discoverPlaces,
        total: discoverPlaces.length
      });

    } catch (error) {
      const serverError = error as Error;
      logger.error('Error fetching discover places', {
        message: serverError.message,
        stack: serverError.stack
      });
      return res.status(500).json({
        message: 'Error fetching discover places',
        details: process.env.NODE_ENV === 'development' ? serverError.message : undefined
      });
    }
  }
} 
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/user.model';
import { config } from '../config';
import { CustomRequest } from '../types';
import { logger } from '../utils/logger';

// Add these interfaces at the top of the file
interface MongoError extends Error {
  code?: number;
  stack?: string;
}

export class AuthController {
  // Helper function to generate username from email
  private static async generateUniqueUsername(email: string): Promise<string> {
    // Get the part before @ and remove special characters
    let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    
    let username = baseUsername;
    let counter = 1;
    
    // Keep checking until we find a unique username
    while (true) {
      const existingUser = await User.findOne({ username });
      if (!existingUser) {
        return username;
      }
      // If username exists, append number and try again
      username = `${baseUsername}${counter}`;
      counter++;
    }
  }

  // Register new user
  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Registration validation failed', { errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      
      if (!email || !password) {
        logger.warn('Registration failed - Missing required fields');
        return res.status(400).json({ 
          message: 'Email and password are required'
        });
      }

      logger.info('Attempting to register new user', { email });

      try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
          logger.warn('Registration failed - Email already exists', { email });
          return res.status(400).json({ 
            message: 'Email already registered'
          });
        }

        // Generate username from email
        const username = await AuthController.generateUniqueUsername(email);
        logger.info('Generated username for new user', { email, username });

        // Create new user with required fields
        const user = new User({
          email,
          password,
          username,
          fullName: username,
          profilePhoto: '',
          bio: '',
          location: {
            country: '',
            city: ''
          },
          preferences: {
            placeTypes: [],
            travelStyle: [],
            activities: [],
            accommodation: []
          },
          social: {}, // Add empty social object
          settings: {
            emailNotifications: true,
            language: 'en',
            currency: 'USD',
            privacy: {
              defaultPhotoPrivacy: true,
              profileVisibility: 'public',
              showLocation: true,
              showVisitedPlaces: true
            }
          },
          stats: {
            totalPlaces: 0,
            totalPhotos: 0,
            totalPublicPlaces: 0,
            totalPrivatePlaces: 0,
            joinedDate: new Date(),
            lastActive: new Date()
          }
        });

        await user.save();
        logger.info('New user registered successfully', { 
          userId: user._id, 
          email, 
          username 
        });

        // Generate JWT
        const token = jwt.sign(
          { userId: user._id },
          config.jwtSecret,
          { expiresIn: '7d' }
        );

        return res.status(201).json({
          message: 'Registration successful',
          token,
          user: user.toJSON()
        });

      } catch (error) {
        const mongoError = error as MongoError;
        logger.error('Error saving new user', { 
          error: mongoError.message,
          email,
          stack: mongoError.stack,
          code: mongoError.code
        });
        
        // Handle specific MongoDB errors
        if (mongoError.code === 11000) {
          return res.status(400).json({ 
            message: 'Username already exists'
          });
        }
        
        throw error; // Re-throw other errors
      }

    } catch (error) {
      const serverError = error as Error;
      logger.error('Server error during registration', { 
        message: serverError.message,
        stack: serverError.stack
      });
      
      return res.status(500).json({ 
        message: 'Server error during registration',
        details: process.env.NODE_ENV === 'development' ? serverError.message : undefined
      });
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Login validation failed', { errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      logger.info('Login attempt', { email });

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn('Login failed - User not found', { email });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn('Login failed - Invalid password', { email });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      logger.info('User logged in successfully', { userId: user._id, email });
      res.json({
        message: 'Login successful',
        token,
        user: user.toJSON()
      });

    } catch (error) {
      logger.error('Server error during login', { error });
      res.status(500).json({ message: 'Server error during login' });
    }
  }

  // Get user profile
  static async getProfile(req: CustomRequest, res: Response) {
    try {
      const userId = req.context?.userId;
      logger.info('Fetching user profile', { userId });

      const user = await User.findById(userId)
        .select('-password');

      if (!user) {
        logger.warn('Profile fetch failed - User not found', { userId });
        return res.status(404).json({ message: 'User not found' });
      }

      logger.info('Profile fetched successfully', { userId });
      return res.json({ user });

    } catch (error) {
      const serverError = error as Error;
      logger.error('Server error fetching profile', { 
        message: serverError.message,
        stack: serverError.stack 
      });
      return res.status(500).json({ 
        message: 'Server error fetching profile',
        details: process.env.NODE_ENV === 'development' ? serverError.message : undefined
      });
    }
  }

  // Update user profile
  static async updateProfile(req: CustomRequest, res: Response) {
    try {
      const userId = req.context?.userId;
      const updates = req.body;

      // Fields that cannot be updated
      delete updates.password;
      delete updates.email;
      delete updates.isVerified;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user
      });

    } catch (error) {
      res.status(500).json({ message: 'Server error updating profile' });
    }
  }

  // Change password
  static async changePassword(req: CustomRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.context?.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });

    } catch (error) {
      res.status(500).json({ message: 'Server error changing password' });
    }
  }

  // Get all users
  static async getAllUsers(req: Request, res: Response) {
    try {
      logger.info('Fetching all users');
      
      const users = await User.find({})
        .select('-password -__v')
        .sort({ createdAt: -1 });

      logger.info('Users fetched successfully', { count: users.length });
      res.json({
        users,
        count: users.length
      });

    } catch (error) {
      logger.error('Server error fetching users', { error });
      res.status(500).json({ message: 'Server error fetching users' });
    }
  }

  // Verify token validity
  static async verifyToken(req: CustomRequest, res: Response) {
    try {
      logger.info('Token verification attempt', { userId: req.context?.userId });
      
      // If we reach here, it means the token is valid (authMiddleware already verified it)
      res.json({ 
        valid: true, 
        userId: req.context?.userId 
      });

    } catch (error) {
      logger.error('Token verification failed', { error });
      res.status(401).json({ 
        valid: false, 
        message: 'Invalid token' 
      });
    }
  }

  // Get current user data
  static async getCurrentUser(req: CustomRequest, res: Response) {
    try {
      const userId = req.context?.userId;
      logger.info('Fetching current user data', { userId });

      const user = await User.findById(userId)
        .select('-password -__v');

      if (!user) {
        logger.warn('Current user not found', { userId });
        return res.status(404).json({ message: 'User not found' });
      }

      logger.info('Current user data fetched successfully', { userId });
      return res.json({ user });

    } catch (error) {
      const serverError = error as Error;
      logger.error('Error fetching current user', { 
        message: serverError.message,
        stack: serverError.stack 
      });
      return res.status(500).json({ 
        message: 'Error fetching user data',
        details: process.env.NODE_ENV === 'development' ? serverError.message : undefined
      });
    }
  }

  // Handle user logout
  static async logout(req: CustomRequest, res: Response) {
    try {
      const userId = req.context?.userId;
      logger.info('User logout attempt', { userId });

      // Note: Since we're using JWT, we don't need to do anything server-side
      // The client should remove the token from their storage
      
      logger.info('User logged out successfully', { userId });
      res.json({ 
        message: 'Logged out successfully'
      });

    } catch (error) {
      logger.error('Error during logout', { error });
      res.status(500).json({ message: 'Error during logout' });
    }
  }
}
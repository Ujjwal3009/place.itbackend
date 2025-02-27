import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware'
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} from '../middleware/validation.middleware';

export const authRouter = Router();

// Public routes
authRouter.post('/register', registerValidation, AuthController.register);
authRouter.post('/login', loginValidation, AuthController.login);
authRouter.get('/users', AuthController.getAllUsers);

// Protected routes
authRouter.get('/profile', authMiddleware, AuthController.getProfile);
authRouter.put('/profile', authMiddleware, updateProfileValidation, AuthController.updateProfile);
authRouter.post('/change-password', authMiddleware, changePasswordValidation, AuthController.changePassword);
authRouter.get('/verify', authMiddleware, AuthController.verifyToken);
authRouter.get('/me', authMiddleware, AuthController.getCurrentUser);
authRouter.post('/logout', authMiddleware, AuthController.logout);
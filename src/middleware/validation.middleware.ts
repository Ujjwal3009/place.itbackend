import { body } from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required')
];

export const updateProfileValidation = [
  body('bio')
    .optional()
    .isLength({ max: 250 })
    .withMessage('Bio cannot exceed 250 characters'),
  body('socialLinks.*.instagram')
    .optional()
    .isURL()
    .withMessage('Invalid Instagram URL'),
  body('socialLinks.*.twitter')
    .optional()
    .isURL()
    .withMessage('Invalid Twitter URL'),
  body('socialLinks.*.facebook')
    .optional()
    .isURL()
    .withMessage('Invalid Facebook URL')
];

export const changePasswordValidation = [
  body('currentPassword')
    .exists()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];
import { CustomError, CustomRequest, CustomResponse, CustomNextFunction } from '../types';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: CustomError,
  req: CustomRequest,
  res: CustomResponse,
  next: CustomNextFunction
): void => {
  logger.error(err.stack);

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
}; 
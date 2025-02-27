import { CustomRequest, CustomResponse } from '../types';

export const healthCheck = (req: CustomRequest, res: CustomResponse): void => {
  res.status(200).json({ status: 'OK' });
}; 
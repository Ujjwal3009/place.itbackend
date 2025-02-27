import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  status?: number;
}

export interface CustomRequest extends Request {
  context?: {
    userId?: string;
  };
}

export interface CustomResponse extends Response {}

export type CustomNextFunction = NextFunction; 
import { Request, Response, NextFunction } from 'express';
import ApiError from './utils/errors/api-errors';

export interface HTTPError extends Error {
  status?: number;
}

export function apiErrorValidator(
  error: HTTPError,
  _: Partial<Request>,
  res: Response,
  __: NextFunction
): void {
  const errorCode = error.status || 500;
  res
    .status(errorCode)
    .send(ApiError.format({ code: errorCode, message: error.message }));
}

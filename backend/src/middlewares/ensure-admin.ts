import { Request, Response, NextFunction } from 'express'
import { AppError } from '@/utils/AppError'

export function ensureAdmin(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  if (request.user.role !== 'admin') {
    throw new AppError('Access denied. Admin only.', 403)
  }

  next()
}

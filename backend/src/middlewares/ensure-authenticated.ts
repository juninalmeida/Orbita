import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { authConfig } from '@/configs/auth'
import { AppError } from '@/utils/AppError'

interface TokenPayload {
  role: 'admin' | 'member'
  sub: string
}

function ensureAuthenticated(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  try {
    const token = request.cookies.token

    if (!token) {
      throw new AppError('Token not found', 401)
    }

    const { role, sub } = verify(token, authConfig.jwt.secret) as TokenPayload

    request.user = { id: sub, role }

    return next()
  } catch {
    throw new AppError('Invalid token', 401)
  }
}

export { ensureAuthenticated }

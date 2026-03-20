import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { authConfig } from '@/configs/auth'
import { AppError } from '@/utils/AppError'
import { prisma } from '@/database/prisma'

interface TokenPayload {
  role: 'admin' | 'member'
  sub: string
}

async function ensureAuthenticated(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const token = request.cookies.token

  if (!token) {
    throw new AppError('Token not found', 401)
  }

  try {
    const { sub } = verify(token, authConfig.jwt.secret) as TokenPayload

    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, role: true, active: true },
    })

    if (!user || !user.active) {
      throw new AppError('Invalid token', 401)
    }

    request.user = { id: user.id, role: user.role }

    return next()
  } catch {
    throw new AppError('Invalid token', 401)
  }
}

export { ensureAuthenticated }

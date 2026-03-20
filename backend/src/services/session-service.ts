import { compare } from 'bcrypt'
import { sign, SignOptions } from 'jsonwebtoken'
import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'
import { authConfig } from '@/configs/auth'
import { env } from '@/env'

const isProduction = env.NODE_ENV === 'production'

export const cookieConfig = {
  httpOnly: true,
  sameSite: isProduction ? ('none' as const) : ('strict' as const),
  secure: isProduction,
  maxAge: 1000 * 60 * 60 * 24 * 7,
}

class SessionService {
  async authenticate(email: string, password: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } })

    const passwordMatches = user
      ? await compare(password, user.password)
      : false

    if (!user || !passwordMatches) {
      throw new AppError('Invalid credentials', 401)
    }

    if (!user.active) {
      throw new AppError('Account has been deactivated', 403)
    }

    const signOptions: SignOptions = {
      subject: user.id,
      expiresIn: authConfig.jwt.expiresIn as SignOptions['expiresIn'],
    }

    return sign({ role: user.role }, authConfig.jwt.secret, signOptions)
  }

  async getProfile(userId: string) {
    const { password: _, ...user } = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    })

    return user
  }
}

export const sessionService = new SessionService()

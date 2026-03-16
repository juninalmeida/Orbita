import { Request, Response } from 'express'
import { z } from 'zod'
import { compare } from 'bcrypt'
import { sign, SignOptions } from 'jsonwebtoken'
import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'
import { authConfig } from '@/configs/auth'

class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })

    const { email, password } = bodySchema.parse(request.body)

    const user = await prisma.user.findFirst({ where: { email } })

    const passwordMatches = user
      ? await compare(password, user.password)
      : false

    if (!user || !passwordMatches) {
      throw new AppError('Invalid credentials', 401)
    }

    const signOptions: SignOptions = {
      subject: user.id,
      expiresIn: authConfig.jwt.expiresIn as SignOptions['expiresIn'],
    }

    const token = sign({ role: user.role }, authConfig.jwt.secret, signOptions)

    response.cookie('token', token, {
      httpOnly: true, // JavaScript do browser não consegue ler esse cookie. Proteção contra XSS
      sameSite: 'strict', //  o cookie só é enviado em requisições do mesmo site. Proteção contra CSRF
      maxAge: 1000 * 60 * 60 * 24 * 7, // tempo de vida em milissegundos
    })

    return response.json({ message: 'Logged in successfully' })
  }

  async remove(_request: Request, response: Response) {
    response.clearCookie('token')
    return response.json({ message: 'Logged out successfully' })
  }
}

export { SessionsController }

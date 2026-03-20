import { Request, Response } from 'express'
import { z } from 'zod'
import { sessionService, cookieConfig } from '@/services/session-service'

class SessionsController {
  async create(request: Request, response: Response) {
    const { email, password } = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(request.body)

    const token = await sessionService.authenticate(email, password)

    response.cookie('token', token, cookieConfig)

    return response.json({ message: 'Logged in successfully' })
  }

  async show(request: Request, response: Response) {
    const user = await sessionService.getProfile(request.user.id)

    return response.json(user)
  }

  async remove(_request: Request, response: Response) {
    const { maxAge: _, ...clearOptions } = cookieConfig
    response.clearCookie('token', clearOptions)

    return response.json({ message: 'Logged out successfully' })
  }
}

export { SessionsController }

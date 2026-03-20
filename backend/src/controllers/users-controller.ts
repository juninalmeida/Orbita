import { Request, Response } from 'express'
import { z } from 'zod'
import { userService } from '@/services/user-service'

class UsersController {
  async create(request: Request, response: Response) {
    const data = z
      .object({
        name: z.string().trim().min(2).max(100),
        email: z.string().email().max(150),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and a number',
          ),
      })
      .parse(request.body)

    const user = await userService.create(data)

    return response.status(201).json(user)
  }
}

export { UsersController }

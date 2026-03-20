import { Request, Response } from 'express'
import { userService } from '@/services/user-service'

class UsersPublicController {
  async list(_request: Request, response: Response) {
    const users = await userService.listActive()

    return response.json(users)
  }
}

export const usersPublicController = new UsersPublicController()

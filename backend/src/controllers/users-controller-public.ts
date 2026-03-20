import { Request, Response } from 'express'
import { prisma } from '@/database/prisma'

class UsersPublicController {
  async list(_request: Request, response: Response) {
    const users = await prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    })
    return response.json(users)
  }
}

export const usersPublicController = new UsersPublicController()

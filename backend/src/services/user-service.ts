import { hash } from 'bcrypt'
import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class UserService {
  async create(data: { name: string; email: string; password: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      throw new AppError('Email already in use', 409)
    }

    const hashedPassword = await hash(data.password, 12)

    const { password: _, ...user } = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashedPassword },
    })

    return user
  }

  async listActive() {
    return prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true, role: true, avatar: true },
      orderBy: { name: 'asc' },
    })
  }
}

export const userService = new UserService()

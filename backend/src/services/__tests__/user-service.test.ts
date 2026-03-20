jest.mock('@/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
}))

import { userService } from '@/services/user-service'
import { prisma } from '@/database/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('UserService', () => {
  describe('create', () => {
    it('should create a user and return without password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1', name: 'Test', email: 'test@test.com', password: 'hashed-password',
        role: 'member', active: true, avatar: null, bio: null,
        createdAt: new Date(), updatedAt: new Date(),
      })

      const user = await userService.create({
        name: 'Test', email: 'test@test.com', password: 'Password1',
      })

      expect(user).not.toHaveProperty('password')
      expect(user).toHaveProperty('email', 'test@test.com')
    })

    it('should throw 409 for duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing', name: 'Existing', email: 'test@test.com', password: 'hash',
        role: 'member', active: true, avatar: null, bio: null,
        createdAt: new Date(), updatedAt: new Date(),
      })

      await expect(userService.create({
        name: 'Test', email: 'test@test.com', password: 'Password1',
      })).rejects.toEqual(expect.objectContaining({ message: 'Email already in use', statusCode: 409 }))
    })
  })

  describe('listActive', () => {
    it('should return active users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      const users = await userService.listActive()

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { active: true } }),
      )
      expect(users).toEqual([])
    })
  })
})

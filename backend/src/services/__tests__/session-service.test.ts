// Mock dependencies before importing the service
jest.mock('@/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  },
}))

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
}))

jest.mock('@/env', () => ({
  env: {
    JWT_SECRET: 'a'.repeat(32),
    JWT_EXPIRES_IN: '7d',
    NODE_ENV: 'test',
  },
}))

jest.mock('@/configs/auth', () => ({
  authConfig: {
    jwt: { secret: 'a'.repeat(32), expiresIn: '7d' },
  },
}))

import { sessionService } from '@/services/session-service'
import { prisma } from '@/database/prisma'
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockCompare = compare as jest.MockedFunction<typeof compare>

describe('SessionService', () => {
  describe('authenticate', () => {
    it('should return a JWT token for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed',
        role: 'member',
        active: true,
        name: 'Test',
        avatar: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      mockCompare.mockResolvedValue(true as never)

      const token = await sessionService.authenticate('test@test.com', 'password123')

      expect(token).toBe('mock-jwt-token')
      expect(sign).toHaveBeenCalledWith(
        { role: 'member' },
        expect.any(String),
        expect.objectContaining({ subject: 'user-1' }),
      )
    })

    it('should throw 401 for non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(sessionService.authenticate('nobody@test.com', 'pass'))
        .rejects.toEqual(expect.objectContaining({ message: 'Invalid credentials', statusCode: 401 }))
    })

    it('should throw 401 for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', password: 'hashed',
        role: 'member', active: true, name: 'Test', avatar: null, bio: null,
        createdAt: new Date(), updatedAt: new Date(),
      })
      mockCompare.mockResolvedValue(false as never)

      await expect(sessionService.authenticate('test@test.com', 'wrong'))
        .rejects.toEqual(expect.objectContaining({ message: 'Invalid credentials', statusCode: 401 }))
    })

    it('should throw 403 for deactivated user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', password: 'hashed',
        role: 'member', active: false, name: 'Test', avatar: null, bio: null,
        createdAt: new Date(), updatedAt: new Date(),
      })
      mockCompare.mockResolvedValue(true as never)

      await expect(sessionService.authenticate('test@test.com', 'password123'))
        .rejects.toEqual(expect.objectContaining({ message: 'Account has been deactivated', statusCode: 403 }))
    })
  })

  describe('getProfile', () => {
    it('should return user without password', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-1', name: 'Test', email: 'test@test.com', password: 'hashed',
        role: 'member', active: true, avatar: null, bio: null,
        createdAt: new Date(), updatedAt: new Date(),
      })

      const profile = await sessionService.getProfile('user-1')

      expect(profile).not.toHaveProperty('password')
      expect(profile).toHaveProperty('id', 'user-1')
    })
  })
})

jest.mock('@/database/prisma', () => ({
  prisma: {
    team: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    teamMember: { findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}))

import { teamService } from '@/services/team-service'
import { prisma } from '@/database/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('TeamService', () => {
  describe('create', () => {
    it('should create a team with the creator as member', async () => {
      mockPrisma.team.create.mockResolvedValue({
        id: 'team-1', name: 'Alpha', description: null, createdAt: new Date(), updatedAt: new Date(),
      })

      await teamService.create('user-1', { name: 'Alpha' })

      expect(mockPrisma.team.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Alpha',
          members: { create: { userId: 'user-1' } },
        }),
      })
    })
  })

  describe('ensureMembership', () => {
    it('should not throw if user is a member', async () => {
      mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'tm-1', teamId: 'team-1', userId: 'user-1', joinedAt: new Date() })

      await expect(teamService.ensureMembership('team-1', 'user-1')).resolves.not.toThrow()
    })

    it('should throw 403 if user is not a member', async () => {
      mockPrisma.teamMember.findFirst.mockResolvedValue(null)

      await expect(teamService.ensureMembership('team-1', 'user-1'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
    })
  })

  describe('addMember', () => {
    it('should add a user to a team', async () => {
      // Requester is a member
      mockPrisma.teamMember.findFirst
        .mockResolvedValueOnce({ id: 'tm-1', teamId: 'team-1', userId: 'requester', joinedAt: new Date() }) // ensureMembership
        .mockResolvedValueOnce(null) // alreadyMember check
      mockPrisma.team.findUnique.mockResolvedValue({ id: 'team-1', name: 'Alpha', description: null, createdAt: new Date(), updatedAt: new Date() })
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2', name: 'New', email: 'new@test.com', password: 'h', role: 'member', active: true, avatar: null, bio: null, createdAt: new Date(), updatedAt: new Date() })
      mockPrisma.teamMember.create.mockResolvedValue({ id: 'tm-2', teamId: 'team-1', userId: 'user-2', joinedAt: new Date() })

      await teamService.addMember('team-1', 'user-2', 'requester')

      expect(mockPrisma.teamMember.create).toHaveBeenCalled()
    })

    it('should throw 409 if user is already a member', async () => {
      mockPrisma.teamMember.findFirst
        .mockResolvedValueOnce({ id: 'tm-1', teamId: 'team-1', userId: 'requester', joinedAt: new Date() }) // ensureMembership
        .mockResolvedValueOnce({ id: 'tm-2', teamId: 'team-1', userId: 'user-2', joinedAt: new Date() }) // alreadyMember
      mockPrisma.team.findUnique.mockResolvedValue({ id: 'team-1', name: 'Alpha', description: null, createdAt: new Date(), updatedAt: new Date() })
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2', name: 'Dup', email: 'dup@test.com', password: 'h', role: 'member', active: true, avatar: null, bio: null, createdAt: new Date(), updatedAt: new Date() })

      await expect(teamService.addMember('team-1', 'user-2', 'requester'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 409 }))
    })

    it('should throw 403 if requester is not a member', async () => {
      mockPrisma.teamMember.findFirst.mockResolvedValue(null) // ensureMembership fails

      await expect(teamService.addMember('team-1', 'user-2', 'outsider'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
    })
  })

  describe('removeMember', () => {
    it('should throw 404 if member not found', async () => {
      mockPrisma.teamMember.findFirst
        .mockResolvedValueOnce({ id: 'tm-1', teamId: 'team-1', userId: 'requester', joinedAt: new Date() }) // ensureMembership
        .mockResolvedValueOnce(null) // member lookup

      await expect(teamService.removeMember('team-1', 'ghost', 'requester'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 404 }))
    })
  })
})

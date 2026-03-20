jest.mock('@/database/prisma', () => ({
  prisma: {
    task: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    taskAssignment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

import { assignmentService } from '@/services/assignment-service'
import { prisma } from '@/database/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('AssignmentService', () => {
  describe('requestHelp', () => {
    it('should create a pending helper assignment', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task-1', assignments: [{ userId: 'owner-1', role: 'owner' }],
      } as never)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'helper-1' } as never)
      mockPrisma.taskAssignment.findUnique.mockResolvedValue(null)
      mockPrisma.taskAssignment.create.mockResolvedValue({ id: 'a-1', status: 'pending' } as never)

      await assignmentService.requestHelp('task-1', 'helper-1', 'owner-1', 'member')

      expect(mockPrisma.taskAssignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'helper', status: 'pending' }),
        include: expect.any(Object),
      })
    })

    it('should throw 403 if requester is not owner or admin', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task-1', assignments: [{ userId: 'owner-1', role: 'owner' }],
      } as never)

      await expect(assignmentService.requestHelp('task-1', 'helper-1', 'random-user', 'member'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
    })

    it('should throw 409 if user already has assignment', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task-1', assignments: [{ userId: 'owner-1', role: 'owner' }],
      } as never)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'helper-1' } as never)
      mockPrisma.taskAssignment.findUnique.mockResolvedValue({ id: 'existing' } as never)

      await expect(assignmentService.requestHelp('task-1', 'helper-1', 'owner-1', 'member'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 409 }))
    })
  })

  describe('respond', () => {
    it('should accept an assignment', async () => {
      mockPrisma.taskAssignment.findUnique.mockResolvedValue({
        id: 'a-1', userId: 'user-1', status: 'pending',
      } as never)
      mockPrisma.taskAssignment.update.mockResolvedValue({ id: 'a-1', status: 'assigned' } as never)

      const result = await assignmentService.respond('a-1', 'user-1', 'assigned')

      expect(result).toEqual(expect.objectContaining({ status: 'assigned' }))
    })

    it('should delete assignment when rejected', async () => {
      mockPrisma.taskAssignment.findUnique.mockResolvedValue({
        id: 'a-1', userId: 'user-1', status: 'pending',
      } as never)
      mockPrisma.taskAssignment.delete.mockResolvedValue({} as never)

      const result = await assignmentService.respond('a-1', 'user-1', 'rejected')

      expect(result).toBeNull()
      expect(mockPrisma.taskAssignment.delete).toHaveBeenCalled()
    })

    it('should throw 403 if responding to another users assignment', async () => {
      mockPrisma.taskAssignment.findUnique.mockResolvedValue({
        id: 'a-1', userId: 'user-1', status: 'pending',
      } as never)

      await expect(assignmentService.respond('a-1', 'wrong-user', 'assigned'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
    })

    it('should throw 400 if assignment already resolved', async () => {
      mockPrisma.taskAssignment.findUnique.mockResolvedValue({
        id: 'a-1', userId: 'user-1', status: 'assigned',
      } as never)

      await expect(assignmentService.respond('a-1', 'user-1', 'assigned'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 400 }))
    })
  })

  describe('removeHelper', () => {
    it('should throw 400 when trying to remove the owner', async () => {
      mockPrisma.taskAssignment.findUnique.mockResolvedValue({
        id: 'a-1', role: 'owner', userId: 'owner-1',
      } as never)

      await expect(assignmentService.removeHelper('task-1', 'owner-1', 'admin-1', 'admin'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 400, message: 'Cannot remove the task owner' }))
    })
  })
})

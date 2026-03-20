jest.mock('@/database/prisma', () => ({
  prisma: {
    task: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    taskAssignment: { create: jest.fn(), findFirst: jest.fn() },
    taskHistory: { create: jest.fn(), findMany: jest.fn() },
    teamMember: { findFirst: jest.fn() },
  },
}))

import { taskService } from '@/services/task-service'
import { prisma } from '@/database/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('TaskService', () => {
  describe('create', () => {
    it('should create a task and assign creator as owner', async () => {
      mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'tm-1', teamId: 'team-1', userId: 'user-1', joinedAt: new Date() })
      mockPrisma.task.create.mockResolvedValue({ id: 'task-1', title: 'Test', teamId: 'team-1', priority: 'medium', status: 'pending', description: null, archived: false, archivedAt: null, deleted: false, deletedAt: null, createdAt: new Date(), updatedAt: new Date() })
      mockPrisma.taskAssignment.create.mockResolvedValue({} as never)
      mockPrisma.task.findUnique.mockResolvedValue({ id: 'task-1', title: 'Test' } as never)

      await taskService.create('team-1', 'user-1', 'member', { title: 'Test', priority: 'medium' })

      expect(mockPrisma.taskAssignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'owner', status: 'assigned' }),
      })
    })

    it('should throw 403 if non-admin is not a team member', async () => {
      mockPrisma.teamMember.findFirst.mockResolvedValue(null)

      await expect(taskService.create('team-1', 'user-1', 'member', { title: 'Test', priority: 'medium' }))
        .rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
    })

    it('should allow admin to create task in any team', async () => {
      mockPrisma.task.create.mockResolvedValue({ id: 'task-1', title: 'Test', teamId: 'team-1', priority: 'high', status: 'pending', description: null, archived: false, archivedAt: null, deleted: false, deletedAt: null, createdAt: new Date(), updatedAt: new Date() })
      mockPrisma.taskAssignment.create.mockResolvedValue({} as never)
      mockPrisma.task.findUnique.mockResolvedValue({ id: 'task-1' } as never)

      await taskService.create('team-1', 'admin-1', 'admin', { title: 'Test', priority: 'high' })

      // Should NOT check team membership for admin
      expect(mockPrisma.teamMember.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('updateStatus', () => {
    const baseTask = {
      id: 'task-1', title: 'Test', teamId: 'team-1', priority: 'medium' as const,
      status: 'pending' as const, description: null, archived: false, archivedAt: null,
      deleted: false, deletedAt: null, createdAt: new Date(), updatedAt: new Date(),
    }

    it('should update status and create history', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(baseTask)
      mockPrisma.task.update.mockResolvedValue({ ...baseTask, status: 'in_progress' })
      mockPrisma.taskHistory.create.mockResolvedValue({} as never)

      await taskService.updateStatus('task-1', 'user-1', 'admin', { status: 'in_progress' })

      expect(mockPrisma.taskHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ oldStatus: 'pending', newStatus: 'in_progress' }),
      })
    })

    it('should throw 400 if status is the same', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(baseTask)

      await expect(taskService.updateStatus('task-1', 'user-1', 'admin', { status: 'pending' }))
        .rejects.toEqual(expect.objectContaining({ statusCode: 400, message: 'Task already has this status' }))
    })

    it('should throw 400 if member provides no justification', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(baseTask)
      mockPrisma.taskAssignment.findFirst.mockResolvedValue({ id: 'a-1' } as never)

      await expect(taskService.updateStatus('task-1', 'user-1', 'member', { status: 'in_progress' }))
        .rejects.toEqual(expect.objectContaining({ statusCode: 400, message: 'Justification is required' }))
    })

    it('should throw 404 if task does not exist', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null)

      await expect(taskService.updateStatus('ghost', 'user-1', 'admin', { status: 'completed' }))
        .rejects.toEqual(expect.objectContaining({ statusCode: 404 }))
    })
  })

  describe('getById', () => {
    it('should throw 404 for non-existent task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null)

      await expect(taskService.getById('ghost', 'user-1', 'member'))
        .rejects.toEqual(expect.objectContaining({ statusCode: 404 }))
    })
  })
})

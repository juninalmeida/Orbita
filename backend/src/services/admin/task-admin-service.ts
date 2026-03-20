import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class TaskAdminService {
  async update(
    taskId: string,
    adminId: string,
    data: {
      title?: string
      description?: string
      status?: 'pending' | 'in_progress' | 'completed'
      priority?: 'high' | 'medium' | 'low'
      justification?: string
    },
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new AppError('Task not found', 404)

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
      },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    if (data.status !== undefined && data.status !== task.status) {
      await prisma.taskHistory.create({
        data: {
          taskId,
          changedBy: adminId,
          oldStatus: task.status,
          newStatus: data.status,
          justification: data.justification ?? null,
        },
      })
    }

    return updatedTask
  }

  async softDelete(taskId: string, adminId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new AppError('Task not found', 404)

    await prisma.taskRequest.updateMany({
      where: { taskId, status: 'pending' },
      data: { status: 'rejected', resolvedBy: adminId, resolvedAt: new Date() },
    })

    await prisma.task.update({
      where: { id: taskId },
      data: { deleted: true, deletedAt: new Date() },
    })
  }

  async getDeleted(teamId?: string) {
    return prisma.task.findMany({
      where: {
        deleted: true,
        ...(teamId && { teamId }),
      },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        team: { select: { id: true, name: true } },
        history: {
          include: { changer: { select: { id: true, name: true } } },
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { deletedAt: 'desc' },
    })
  }

  async toggleArchive(taskId: string, archived: boolean, adminId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new AppError('Task not found', 404)

    if (archived) {
      await prisma.taskRequest.updateMany({
        where: { taskId, status: 'pending' },
        data: { status: 'rejected', resolvedBy: adminId, resolvedAt: new Date() },
      })
    }

    return prisma.task.update({
      where: { id: taskId },
      data: { archived, archivedAt: archived ? new Date() : null },
    })
  }

  async getArchived(teamId?: string) {
    return prisma.task.findMany({
      where: {
        archived: true,
        deleted: false,
        ...(teamId && { teamId }),
      },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        team: { select: { id: true, name: true } },
      },
      orderBy: { archivedAt: 'desc' },
    })
  }

  async directAssign(taskId: string, userId: string, adminId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new AppError('Task not found', 404)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError('User not found', 404)

    const existing = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    })

    if (existing) {
      if (existing.status === 'assigned') {
        throw new AppError('User is already assigned to this task', 409)
      }
      await prisma.taskAssignment.update({
        where: { id: existing.id },
        data: { status: 'assigned', role: existing.role },
      })
    } else {
      await prisma.taskAssignment.create({
        data: {
          taskId,
          userId,
          role: 'helper',
          status: 'assigned',
          requestedById: adminId,
        },
      })
    }

    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })
  }
}

export const taskAdminService = new TaskAdminService()

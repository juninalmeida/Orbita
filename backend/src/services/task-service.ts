import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

export async function canAccessTask(
  userId: string,
  taskId: string,
  teamId: string | null,
): Promise<boolean> {
  const hasAssignment = await prisma.taskAssignment.findFirst({
    where: { taskId, userId, status: 'assigned' },
  })
  if (hasAssignment) return true

  if (!teamId) return false

  const isMember = await prisma.teamMember.findFirst({
    where: { teamId, userId },
  })
  return !!isMember
}

class TaskService {
  async create(
    teamId: string,
    userId: string,
    role: string,
    data: { title: string; description?: string; priority: 'high' | 'medium' | 'low' },
  ) {
    if (role !== 'admin') {
      const isMember = await prisma.teamMember.findFirst({
        where: { teamId, userId },
      })
      if (!isMember) throw new AppError('You are not a member of this team', 403)
    }

    const task = await prisma.task.create({
      data: { title: data.title, description: data.description, priority: data.priority, teamId },
    })

    await prisma.taskAssignment.create({
      data: { taskId: task.id, userId, role: 'owner', status: 'assigned' },
    })

    return prisma.task.findUnique({
      where: { id: task.id },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    })
  }

  async listByTeam(teamId: string, userId: string, role: string) {
    if (role !== 'admin') {
      const isMember = await prisma.teamMember.findFirst({
        where: { teamId, userId },
      })
      if (!isMember) throw new AppError('You are not a member of this team', 403)
    }

    return prisma.task.findMany({
      where: { teamId, archived: false, deleted: false },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getById(taskId: string, userId: string, role: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
            requestedBy: { select: { id: true, name: true, avatar: true } },
          },
        },
        team: { select: { id: true, name: true } },
      },
    })

    if (!task) throw new AppError('Task not found', 404)

    if (role !== 'admin') {
      const hasAccess = await canAccessTask(userId, taskId, task.teamId)
      if (!hasAccess) throw new AppError('You do not have access to this task', 403)
    }

    return task
  }

  async updateStatus(
    taskId: string,
    userId: string,
    role: string,
    data: { status: 'pending' | 'in_progress' | 'completed'; justification?: string },
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new AppError('Task not found', 404)

    if (role !== 'admin') {
      const hasAccess = await canAccessTask(userId, taskId, task.teamId)
      if (!hasAccess) throw new AppError('You do not have access to this task', 403)
    }

    if (task.status === data.status) {
      throw new AppError('Task already has this status', 400)
    }

    if (role === 'member' && !data.justification) {
      throw new AppError('Justification is required', 400)
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { status: data.status },
    })

    await prisma.taskHistory.create({
      data: {
        taskId,
        changedBy: userId,
        oldStatus: task.status,
        newStatus: data.status,
        justification: data.justification || null,
      },
    })
  }

  async getHistory(taskId: string, userId: string, role: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new AppError('Task not found', 404)

    if (role !== 'admin') {
      const hasAccess = await canAccessTask(userId, taskId, task.teamId)
      if (!hasAccess) throw new AppError('You do not have access to this task', 403)
    }

    return prisma.taskHistory.findMany({
      where: { taskId },
      include: {
        changer: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { changedAt: 'desc' },
    })
  }
}

export const taskService = new TaskService()

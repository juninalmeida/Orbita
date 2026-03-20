import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class TaskRequestService {
  async getAvailable(userId: string, teamId?: string) {
    const where: Record<string, unknown> = {
      deleted: false,
      archived: false,
      status: { not: 'completed' },
      NOT: {
        assignments: {
          some: { userId, status: 'assigned' },
        },
      },
    }

    if (teamId) where.teamId = teamId

    return prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        team: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createRequest(
    taskId: string,
    userId: string,
    data: { type: 'view'; message?: string },
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new AppError('Task not found', 404)

    const existing = await prisma.taskRequest.findUnique({
      where: {
        taskId_userId_type: { taskId, userId, type: data.type },
      },
    })
    if (existing) throw new AppError('You already have a request for this task', 409)

    return prisma.taskRequest.create({
      data: { taskId, userId, type: data.type, message: data.message },
    })
  }

  async getCompleted(teamId?: string) {
    const where: Record<string, unknown> = {
      status: 'completed',
      archived: false,
    }

    if (teamId) where.teamId = teamId

    return prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        priority: true,
        updatedAt: true,
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        team: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getAllTeams() {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        _count: {
          select: { tasks: { where: { status: 'completed', archived: false } } },
        },
      },
      orderBy: { name: 'asc' },
    })

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      members: team.members.map((m) => m.user),
      completedTasksCount: team._count.tasks,
    }))
  }

  async getTeamCompleted(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    })
    if (!team) throw new AppError('Team not found', 404)

    const completedTasks = await prisma.task.findMany({
      where: { teamId, status: 'completed', archived: false },
      select: {
        id: true,
        title: true,
        priority: true,
        updatedAt: true,
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return {
      ...team,
      members: team.members.map((m) => m.user),
      completedTasks,
    }
  }

  async getMyRequests(userId: string) {
    return prisma.taskRequest.findMany({
      where: { userId },
      include: {
        task: {
          select: { id: true, title: true, status: true, priority: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const taskRequestService = new TaskRequestService()

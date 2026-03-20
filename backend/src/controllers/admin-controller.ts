import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class AdminController {
  async overview(_request: Request, response: Response) {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        tasks: {
          where: { archived: false, deleted: false },
        },
      },
    })

    const totalTeams = teams.length

    const totalMembers = teams.reduce((acc, team) => {
      const memberCount = team.members.filter(
        (m) => m.user.role === 'member',
      ).length
      return acc + memberCount
    }, 0)

    let totalTasks = 0
    let completedTasks = 0

    const teamsData = teams.map((team) => {
      const tasks = team.tasks

      totalTasks += tasks.length
      completedTasks += tasks.filter((t) => t.status === 'completed').length

      const tasksByStatus = {
        pending: tasks.filter((t) => t.status === 'pending').length,
        in_progress: tasks.filter((t) => t.status === 'in_progress').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
      }

      const tasksByPriority = {
        high: tasks.filter((t) => t.priority === 'high').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        low: tasks.filter((t) => t.priority === 'low').length,
      }

      const progress =
        tasks.length > 0
          ? Math.round((tasksByStatus.completed / tasks.length) * 100)
          : 0

      return {
        id: team.id,
        name: team.name,
        members: team.members.map((m) => m.user),
        tasksByStatus,
        tasksByPriority,
        totalTasks: tasks.length,
        progress,
      }
    })

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const activeTasks = totalTasks - completedTasks

    return response.json({
      metrics: {
        totalTeams,
        totalMembers,
        activeTasks,
        completionRate,
      },
      teams: teamsData,
    })
  }

  async analytics(_request: Request, response: Response) {
    const now = new Date()

    // Tasks created per week — last 8 weeks
    const eightWeeksAgo = new Date(now)
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 8 * 7)

    const recentTasks = await prisma.task.findMany({
      where: {
        createdAt: { gte: eightWeeksAgo },
      },
      select: { createdAt: true },
    })

    // Group tasks by week start (Monday)
    const weekMap = new Map<string, number>()
    for (const task of recentTasks) {
      const date = new Date(task.createdAt)
      const day = date.getDay() // 0 = Sunday
      const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust to Monday
      const monday = new Date(date.setDate(diff))
      monday.setHours(0, 0, 0, 0)
      const key = monday.toISOString().split('T')[0]
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1)
    }

    const tasksPerWeek = Array.from(weekMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))

    // Priority distribution (non-archived)
    const priorityGroups = await prisma.task.groupBy({
      by: ['priority'],
      where: { archived: false },
      _count: { priority: true },
    })

    const priorityDistribution = priorityGroups.map((g) => ({
      priority: g.priority,
      count: g._count.priority,
    }))

    // Most active members (last 30 days) — top 10 by task history entries
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activityGroups = await prisma.taskHistory.groupBy({
      by: ['changedBy'],
      where: { changedAt: { gte: thirtyDaysAgo } },
      _count: { changedBy: true },
      orderBy: { _count: { changedBy: 'desc' } },
      take: 10,
    })

    const userIds = activityGroups.map((g) => g.changedBy)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const mostActiveMembers = activityGroups.map((g) => ({
      user: userMap.get(g.changedBy) ?? { id: g.changedBy, name: null, email: null },
      activityCount: g._count.changedBy,
    }))

    return response.json({
      tasksPerWeek,
      priorityDistribution,
      mostActiveMembers,
    })
  }

  async teamDetail(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!team) {
      throw new AppError('Team not found', 404)
    }

    return response.json(team)
  }

  async teamTasks(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id: teamId } = paramsSchema.parse(request.params)

    const team = await prisma.team.findUnique({ where: { id: teamId } })

    if (!team) {
      throw new AppError('Team not found', 404)
    }

    const tasks = await prisma.task.findMany({
      where: { teamId, deleted: false },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        requests: {
          select: { id: true, userId: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return response.json(tasks)
  }

  async updateTask(request: Request, response: Response) {
    const paramsSchema = z.object({ id: z.string().uuid() })
    const bodySchema = z.object({
      title: z.string().trim().min(1).optional(),
      description: z.string().trim().optional(),
      status: z.enum(['pending', 'in_progress', 'completed']).optional(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
      justification: z.string().optional(),
    })

    const { id } = paramsSchema.parse(request.params)
    const { title, description, status, priority, justification } = bodySchema.parse(request.body)

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) throw new AppError('Task not found', 404)

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
      },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    if (status !== undefined && status !== task.status) {
      await prisma.taskHistory.create({
        data: {
          taskId: id,
          changedBy: request.user.id,
          oldStatus: task.status,
          newStatus: status,
          justification: justification ?? null,
        },
      })
    }

    return response.json(updatedTask)
  }

  async deleteTask(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const task = await prisma.task.findUnique({ where: { id } })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    // Soft delete — reject pending requests
    await prisma.taskRequest.updateMany({
      where: { taskId: id, status: 'pending' },
      data: {
        status: 'rejected',
        resolvedBy: request.user.id,
        resolvedAt: new Date(),
      },
    })

    await prisma.task.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    })

    return response.json({ message: 'Task deleted successfully' })
  }

  async deletedTasks(request: Request, response: Response) {
    const querySchema = z.object({
      teamId: z.string().uuid().optional(),
    })

    const { teamId } = querySchema.parse(request.query)

    const tasks = await prisma.task.findMany({
      where: {
        deleted: true,
        ...(teamId && { teamId }),
      },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        team: {
          select: { id: true, name: true },
        },
        history: {
          include: {
            changer: {
              select: { id: true, name: true },
            },
          },
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { deletedAt: 'desc' },
    })

    return response.json(tasks)
  }

  async archiveTask(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      archived: z.boolean(),
    })

    const { id } = paramsSchema.parse(request.params)
    const { archived } = bodySchema.parse(request.body)

    const task = await prisma.task.findUnique({ where: { id } })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    if (archived) {
      // Auto-reject all pending requests when archiving
      await prisma.taskRequest.updateMany({
        where: { taskId: id, status: 'pending' },
        data: {
          status: 'rejected',
          resolvedBy: request.user.id,
          resolvedAt: new Date(),
        },
      })
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        archived,
        archivedAt: archived ? new Date() : null,
      },
    })

    return response.json(updatedTask)
  }

  async archiveTeamTasks(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id: teamId } = paramsSchema.parse(request.params)

    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) {
      throw new AppError('Team not found', 404)
    }

    // Archive all non-archived, non-deleted tasks
    const result = await prisma.task.updateMany({
      where: { teamId, archived: false, deleted: false },
      data: { archived: true, archivedAt: new Date() },
    })

    // Reject all pending requests for tasks in this team
    await prisma.taskRequest.updateMany({
      where: {
        task: { teamId },
        status: 'pending',
      },
      data: {
        status: 'rejected',
        resolvedBy: request.user.id,
        resolvedAt: new Date(),
      },
    })

    return response.json({
      message: `${result.count} tasks arquivadas com sucesso`,
      count: result.count,
    })
  }

  async archivedTasks(request: Request, response: Response) {
    const querySchema = z.object({
      teamId: z.string().uuid().optional(),
    })

    const { teamId } = querySchema.parse(request.query)

    const tasks = await prisma.task.findMany({
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
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: { archivedAt: 'desc' },
    })

    return response.json(tasks)
  }

  async pendingRequests(_request: Request, response: Response) {
    const requests = await prisma.taskRequest.findMany({
      where: { status: 'pending' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: {
          select: {
            id: true,
            title: true,
            team: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return response.json(requests)
  }

  async createTeam(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      description: z.string().trim().optional(),
    })

    const { name, description } = bodySchema.parse(request.body)

    const team = await prisma.team.create({
      data: {
        name,
        description,
      },
    })

    return response.status(201).json(team)
  }

  async deleteTeam(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const team = await prisma.team.findUnique({ where: { id } })

    if (!team) {
      throw new AppError('Team not found', 404)
    }

    // Reject pending task requests before deletion
    await prisma.taskRequest.updateMany({
      where: { task: { teamId: id }, status: 'pending' },
      data: {
        status: 'rejected',
        resolvedBy: request.user.id,
        resolvedAt: new Date(),
      },
    })

    // Soft-delete all tasks so they appear in the deleted tasks tab
    await prisma.task.updateMany({
      where: { teamId: id, deleted: false },
      data: { deleted: true, deletedAt: new Date() },
    })

    // Delete team members and team (onDelete: SetNull keeps tasks with teamId=null)
    await prisma.teamMember.deleteMany({ where: { teamId: id } })
    await prisma.team.delete({ where: { id } })

    return response.json({ message: 'Team deleted successfully' })
  }

  async addMember(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      email: z.string().email(),
    })

    const { id: teamId } = paramsSchema.parse(request.params)
    const { email } = bodySchema.parse(request.body)

    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) {
      throw new AppError('Team not found', 404)
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new AppError('Usuário não encontrado com este e-mail', 404)
    }

    const alreadyMember = await prisma.teamMember.findFirst({
      where: { teamId, userId: user.id },
    })

    if (alreadyMember) {
      throw new AppError('Usuário já é membro desta equipe', 409)
    }

    await prisma.teamMember.create({ data: { teamId, userId: user.id } })

    return response.status(201).json({
      message: 'Membro adicionado com sucesso',
      user: { id: user.id, name: user.name, email: user.email },
    })
  }

  async removeMember(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
    })

    const { id: teamId, userId } = paramsSchema.parse(request.params)

    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    })

    if (!member) {
      throw new AppError('Membro não encontrado nesta equipe', 404)
    }

    // Transfer ownership of tasks where user is owner in this team
    const ownedInTeam = await prisma.taskAssignment.findMany({
      where: { userId, role: 'owner', task: { teamId } },
    })

    for (const assignment of ownedInTeam) {
      const adminExisting = await prisma.taskAssignment.findUnique({
        where: { taskId_userId: { taskId: assignment.taskId, userId: request.user.id } },
      })
      if (adminExisting) {
        await prisma.taskAssignment.update({ where: { id: adminExisting.id }, data: { role: 'owner' } })
        await prisma.taskAssignment.delete({ where: { id: assignment.id } })
      } else {
        await prisma.taskAssignment.update({ where: { id: assignment.id }, data: { userId: request.user.id } })
      }
    }

    // Delete remaining (helper) assignments for this member in the team
    await prisma.taskAssignment.deleteMany({
      where: { userId, task: { teamId } },
    })

    await prisma.teamMember.delete({ where: { id: member.id } })

    return response.json({ message: 'Membro removido com sucesso' })
  }

  async resolveRequest(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      status: z.enum(['approved', 'rejected']),
    })

    const { id } = paramsSchema.parse(request.params)
    const { status } = bodySchema.parse(request.body)

    const taskRequest = await prisma.taskRequest.findUnique({
      where: { id },
      include: { task: true },
    })

    if (!taskRequest) {
      throw new AppError('Request not found', 404)
    }

    if (taskRequest.status !== 'pending') {
      throw new AppError('Request has already been resolved', 400)
    }

    await prisma.taskRequest.update({
      where: { id },
      data: {
        status,
        resolvedBy: request.user.id,
        resolvedAt: new Date(),
      },
    })

    return response.json({ message: 'Request resolved successfully' })
  }

  async listUsers(_request: Request, response: Response) {
    const users = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        teams: {
          include: { team: { select: { id: true, name: true } } },
        },
        _count: {
          select: { taskAssignments: { where: { status: 'assigned' } } },
        },
      },
      orderBy: { name: 'asc' },
    })

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      teams: u.teams.map((t) => t.team),
      assignedTasksCount: u._count.taskAssignments,
    }))

    return response.json(result)
  }

  async changeUserRole(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { role } = z.object({ role: z.enum(['admin', 'member']) }).parse(request.body)

    if (id === request.user.id) {
      throw new AppError('You cannot change your own role', 400)
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new AppError('User not found', 404)

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })

    return response.json(updated)
  }

  async removeUser(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    if (id === request.user.id) {
      throw new AppError('You cannot remove yourself', 400)
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new AppError('User not found', 404)
    if (!user.active) throw new AppError('User is already deactivated', 400)

    // Transfer task ownership to the admin performing the action
    const ownedAssignments = await prisma.taskAssignment.findMany({
      where: { userId: id, role: 'owner' },
    })

    for (const assignment of ownedAssignments) {
      const adminExisting = await prisma.taskAssignment.findUnique({
        where: { taskId_userId: { taskId: assignment.taskId, userId: request.user.id } },
      })

      if (adminExisting) {
        await prisma.taskAssignment.update({
          where: { id: adminExisting.id },
          data: { role: 'owner' },
        })
        await prisma.taskAssignment.delete({ where: { id: assignment.id } })
      } else {
        await prisma.taskAssignment.update({
          where: { id: assignment.id },
          data: { userId: request.user.id },
        })
      }
    }

    // Delete helper assignments
    await prisma.taskAssignment.deleteMany({
      where: { userId: id, role: 'helper' },
    })

    // Remove from teams
    await prisma.teamMember.deleteMany({ where: { userId: id } })

    // Soft-delete: deactivate user
    await prisma.user.update({
      where: { id },
      data: { active: false },
    })

    return response.json({ message: 'User deactivated successfully' })
  }

  async directAssign(request: Request, response: Response) {
    const { id: taskId } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.body)

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
          requestedById: request.user.id,
        },
      })
    }

    const updated = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    return response.json(updated)
  }
}

export const adminController = new AdminController()

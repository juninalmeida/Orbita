import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class TaskRequestsControllerClass {
  async available(request: Request, response: Response) {
    const { teamId } = z.object({
      teamId: z.string().uuid().optional(),
    }).parse(request.query)

    const where: Record<string, unknown> = {
      deleted: false,
      archived: false,
      status: { not: 'completed' },
      NOT: {
        assignments: {
          some: { userId: request.user.id, status: 'assigned' },
        },
      },
    }

    if (teamId) {
      where.teamId = teamId
    }

    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return response.json(tasks)
  }

  async createRequest(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    const body = z.object({
      type: z.enum(['view']),
      message: z.string().trim().max(500).optional(),
    }).parse(request.body)

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      throw new AppError('Task not found', 404)
    }

    const existing = await prisma.taskRequest.findUnique({
      where: {
        taskId_userId_type: {
          taskId: id,
          userId: request.user.id,
          type: body.type,
        },
      },
    })

    if (existing) {
      throw new AppError('You already have a request for this task', 409)
    }

    const taskRequest = await prisma.taskRequest.create({
      data: {
        taskId: id,
        userId: request.user.id,
        type: body.type,
        message: body.message,
      },
    })

    return response.status(201).json(taskRequest)
  }

  async completedTasks(request: Request, response: Response) {
    const { teamId } = z.object({
      teamId: z.string().uuid().optional(),
    }).parse(request.query)

    const where: Record<string, unknown> = {
      status: 'completed',
      deleted: false,
      archived: false,
    }

    if (teamId) {
      where.teamId = teamId
    }

    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        priority: true,
        updatedAt: true,
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true } } },
        },
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return response.json(tasks)
  }

  async allTeams(_request: Request, response: Response) {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: { tasks: { where: { status: 'completed', archived: false } } },
        },
      },
      orderBy: { name: 'asc' },
    })

    const result = teams.map((team) => ({
      id: team.id,
      name: team.name,
      members: team.members.map((m) => m.user),
      completedTasksCount: team._count.tasks,
    }))

    return response.json(result)
  }

  async teamCompleted(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

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

    const completedTasks = await prisma.task.findMany({
      where: { teamId: id, status: 'completed', deleted: false, archived: false },
      select: {
        id: true,
        title: true,
        priority: true,
        updatedAt: true,
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return response.json({
      ...team,
      members: team.members.map((m) => m.user),
      completedTasks,
    })
  }

  async myRequests(request: Request, response: Response) {
    const requests = await prisma.taskRequest.findMany({
      where: { userId: request.user.id },
      include: {
        task: {
          select: { id: true, title: true, status: true, priority: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return response.json(requests)
  }
}

export const TaskRequestsController = new TaskRequestsControllerClass()

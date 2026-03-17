import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class TasksController {
  async create(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      title: z.string().trim().min(2),
      description: z.string().trim().optional(),
      priority: z.enum(['high', 'medium', 'low']).default('medium'),
      assignedTo: z.string().uuid().optional(),
    })

    const { id: teamId } = paramsSchema.parse(request.params)
    const { title, description, priority, assignedTo } = bodySchema.parse(
      request.body,
    )

    const isMember = await prisma.teamMember.findFirst({
      where: { teamId, userId: request.user.id },
    })

    if (!isMember) {
      throw new AppError('You are not a member of this team', 403)
    }

    if (assignedTo) {
      const assignedMember = await prisma.teamMember.findFirst({
        where: { teamId, userId: assignedTo },
      })

      if (!assignedMember) {
        throw new AppError('Assigned user is not a member of this team', 400)
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        teamId,
        assignedTo,
      },
    })

    return response.status(201).json(task)
  }

  async index(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id: teamId } = paramsSchema.parse(request.params)

    const isMember = await prisma.teamMember.findFirst({
      where: { teamId, userId: request.user.id },
    })

    if (!isMember) {
      throw new AppError('You are not a member of this team', 403)
    }

    const tasks = await prisma.task.findMany({
      where: { teamId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return response.json(tasks)
  }

  async show(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        team: {
          select: { id: true, name: true },
        },
      },
    })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    const isMember = await prisma.teamMember.findFirst({
      where: { teamId: task.teamId, userId: request.user.id },
    })

    if (!isMember) {
      throw new AppError('You are not a member of this team', 403)
    }

    return response.json(task)
  }

  async updateStatus(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      status: z.enum(['pending', 'in_progress', 'completed']),
    })

    const { id } = paramsSchema.parse(request.params)
    const { status } = bodySchema.parse(request.body)

    const task = await prisma.task.findUnique({ where: { id } })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    const isMember = await prisma.teamMember.findFirst({
      where: { teamId: task.teamId, userId: request.user.id },
    })

    if (!isMember) {
      throw new AppError('You are not a member of this team', 403)
    }

    if (task.status === status) {
      throw new AppError('Task already has this status', 400)
    }

    await prisma.task.update({
      where: { id },
      data: { status },
    })

    await prisma.taskHistory.create({
      data: {
        taskId: id,
        changedBy: request.user.id,
        oldStatus: task.status,
        newStatus: status,
      },
    })

    return response.json({ message: 'Status updated successfully' })
  }

  async history(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const task = await prisma.task.findUnique({ where: { id } })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    const isMember = await prisma.teamMember.findFirst({
      where: { teamId: task.teamId, userId: request.user.id },
    })

    if (!isMember) {
      throw new AppError('You are not a member of this team', 403)
    }

    const history = await prisma.taskHistory.findMany({
      where: { taskId: id },
      include: {
        changer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { changedAt: 'desc' },
    })

    return response.json(history)
  }
}

export { TasksController }

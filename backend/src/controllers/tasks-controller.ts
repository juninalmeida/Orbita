import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

async function canAccessTask(userId: string, taskId: string, teamId: string | null): Promise<boolean> {
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

class TasksController {
  async create(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      title: z.string().trim().min(2),
      description: z.string().trim().optional(),
      priority: z.enum(['high', 'medium', 'low']).default('medium'),
    })

    const { id: teamId } = paramsSchema.parse(request.params)
    const { title, description, priority } = bodySchema.parse(request.body)

    const isAdmin = request.user.role === 'admin'

    if (!isAdmin) {
      const isMember = await prisma.teamMember.findFirst({
        where: { teamId, userId: request.user.id },
      })
      if (!isMember) throw new AppError('You are not a member of this team', 403)
    }

    const task = await prisma.task.create({
      data: { title, description, priority, teamId },
    })

    await prisma.taskAssignment.create({
      data: {
        taskId: task.id,
        userId: request.user.id,
        role: 'owner',
        status: 'assigned',
      },
    })

    const taskWithAssignments = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    return response.status(201).json(taskWithAssignments)
  }

  async index(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id: teamId } = paramsSchema.parse(request.params)

    if (request.user.role !== 'admin') {
      const isMember = await prisma.teamMember.findFirst({
        where: { teamId, userId: request.user.id },
      })

      if (!isMember) {
        throw new AppError('You are not a member of this team', 403)
      }
    }

    const tasks = await prisma.task.findMany({
      where: { teamId, archived: false, deleted: false },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
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
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            requestedBy: { select: { id: true, name: true } },
          },
        },
        team: { select: { id: true, name: true } },
      },
    })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    if (request.user.role !== 'admin') {
      const canAccess = await canAccessTask(request.user.id, id, task.teamId)
      if (!canAccess) throw new AppError('You do not have access to this task', 403)
    }

    return response.json(task)
  }

  async updateStatus(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      status: z.enum(['pending', 'in_progress', 'completed']),
      justification: z.string().trim().min(10).optional(),
    })

    const { id } = paramsSchema.parse(request.params)
    const body = bodySchema.parse(request.body)

    const task = await prisma.task.findUnique({ where: { id } })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    if (request.user.role !== 'admin') {
      const canAccess = await canAccessTask(request.user.id, id, task.teamId)
      if (!canAccess) throw new AppError('You do not have access to this task', 403)
    }

    if (task.status === body.status) {
      throw new AppError('Task already has this status', 400)
    }

    // Members must provide justification
    if (request.user.role === 'member') {
      if (!body.justification) {
        throw new AppError('Justification is required', 400)
      }
    }

    await prisma.task.update({
      where: { id },
      data: { status: body.status },
    })

    await prisma.taskHistory.create({
      data: {
        taskId: id,
        changedBy: request.user.id,
        oldStatus: task.status,
        newStatus: body.status,
        justification: body.justification || null,
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

    if (request.user.role !== 'admin') {
      const canAccess = await canAccessTask(request.user.id, id, task.teamId)
      if (!canAccess) throw new AppError('You do not have access to this task', 403)
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

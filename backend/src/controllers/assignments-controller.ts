import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class AssignmentsController {
  async requestHelp(request: Request, response: Response) {
    const { id: taskId } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.body)

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignments: true },
    })

    if (!task) throw new AppError('Task not found', 404)

    // Only task owner or admin can request help
    const isAdmin = request.user.role === 'admin'
    const isOwner = task.assignments.some(
      (a) => a.userId === request.user.id && a.role === 'owner',
    )

    if (!isAdmin && !isOwner) {
      throw new AppError('Only the task owner or admin can request help', 403)
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) throw new AppError('User not found', 404)

    // Check not already assigned
    const existing = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    })

    if (existing) throw new AppError('User already has an assignment for this task', 409)

    const assignment = await prisma.taskAssignment.create({
      data: {
        taskId,
        userId,
        role: 'helper',
        status: 'pending',
        requestedById: request.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        requestedBy: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    })

    return response.status(201).json(assignment)
  }

  async pending(request: Request, response: Response) {
    const assignments = await prisma.taskAssignment.findMany({
      where: { userId: request.user.id, status: 'pending' },
      include: {
        task: { select: { id: true, title: true } },
        requestedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return response.json(assignments)
  }

  async respond(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { status } = z.object({
      status: z.enum(['assigned', 'rejected']),
    }).parse(request.body)

    const assignment = await prisma.taskAssignment.findUnique({ where: { id } })

    if (!assignment) throw new AppError('Assignment not found', 404)
    if (assignment.userId !== request.user.id) {
      throw new AppError('You can only respond to your own assignments', 403)
    }
    if (assignment.status !== 'pending') {
      throw new AppError('Assignment already resolved', 400)
    }

    if (status === 'rejected') {
      await prisma.taskAssignment.delete({ where: { id } })
      return response.json({ message: 'Assignment rejected' })
    }

    const updated = await prisma.taskAssignment.update({
      where: { id },
      data: { status: 'assigned' },
    })

    return response.json(updated)
  }

  async remove(request: Request, response: Response) {
    const { id: taskId, userId } = z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
    }).parse(request.params)

    const assignment = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    })

    if (!assignment) throw new AppError('Assignment not found', 404)
    if (assignment.role === 'owner') {
      throw new AppError('Cannot remove the task owner', 400)
    }

    // Only task owner or admin can remove helpers
    const isAdmin = request.user.role === 'admin'
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignments: true },
    })

    const isOwner = task?.assignments.some(
      (a) => a.userId === request.user.id && a.role === 'owner',
    )

    if (!isAdmin && !isOwner) {
      throw new AppError('Only the task owner or admin can remove helpers', 403)
    }

    await prisma.taskAssignment.delete({ where: { id: assignment.id } })

    return response.json({ message: 'Helper removed' })
  }
}

export const assignmentsController = new AssignmentsController()

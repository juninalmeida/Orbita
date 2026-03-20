import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class AssignmentService {
  async requestHelp(
    taskId: string,
    targetUserId: string,
    requesterId: string,
    requesterRole: string,
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignments: true },
    })

    if (!task) throw new AppError('Task not found', 404)

    const isAdmin = requesterRole === 'admin'
    const isOwner = task.assignments.some(
      (a) => a.userId === requesterId && a.role === 'owner',
    )

    if (!isAdmin && !isOwner) {
      throw new AppError('Only the task owner or admin can request help', 403)
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!targetUser) throw new AppError('User not found', 404)

    const existing = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId: targetUserId } },
    })
    if (existing) throw new AppError('User already has an assignment for this task', 409)

    return prisma.taskAssignment.create({
      data: {
        taskId,
        userId: targetUserId,
        role: 'helper',
        status: 'pending',
        requestedById: requesterId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        requestedBy: { select: { id: true, name: true, avatar: true } },
        task: { select: { id: true, title: true } },
      },
    })
  }

  async getPending(userId: string) {
    return prisma.taskAssignment.findMany({
      where: { userId, status: 'pending' },
      include: {
        task: { select: { id: true, title: true } },
        requestedBy: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async respond(assignmentId: string, userId: string, status: 'assigned' | 'rejected') {
    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: assignmentId },
    })

    if (!assignment) throw new AppError('Assignment not found', 404)
    if (assignment.userId !== userId) {
      throw new AppError('You can only respond to your own assignments', 403)
    }
    if (assignment.status !== 'pending') {
      throw new AppError('Assignment already resolved', 400)
    }

    if (status === 'rejected') {
      await prisma.taskAssignment.delete({ where: { id: assignmentId } })
      return null
    }

    return prisma.taskAssignment.update({
      where: { id: assignmentId },
      data: { status: 'assigned' },
    })
  }

  async removeHelper(
    taskId: string,
    targetUserId: string,
    requesterId: string,
    requesterRole: string,
  ) {
    const assignment = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId: targetUserId } },
    })

    if (!assignment) throw new AppError('Assignment not found', 404)
    if (assignment.role === 'owner') {
      throw new AppError('Cannot remove the task owner', 400)
    }

    const isAdmin = requesterRole === 'admin'
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignments: true },
    })

    const isOwner = task?.assignments.some(
      (a) => a.userId === requesterId && a.role === 'owner',
    )

    if (!isAdmin && !isOwner) {
      throw new AppError('Only the task owner or admin can remove helpers', 403)
    }

    await prisma.taskAssignment.delete({ where: { id: assignment.id } })
  }
}

export const assignmentService = new AssignmentService()

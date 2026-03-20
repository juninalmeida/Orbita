import { prisma } from '@/database/prisma'

class OwnershipTransfer {
  async transfer(
    fromUserId: string,
    toUserId: string,
    filter?: { teamId?: string },
  ) {
    const where: Record<string, unknown> = {
      userId: fromUserId,
      role: 'owner',
    }

    if (filter?.teamId) {
      where.task = { teamId: filter.teamId }
    }

    const ownedAssignments = await prisma.taskAssignment.findMany({ where })

    for (const assignment of ownedAssignments) {
      const existing = await prisma.taskAssignment.findUnique({
        where: {
          taskId_userId: { taskId: assignment.taskId, userId: toUserId },
        },
      })

      if (existing) {
        await prisma.taskAssignment.update({
          where: { id: existing.id },
          data: { role: 'owner' },
        })
        await prisma.taskAssignment.delete({ where: { id: assignment.id } })
      } else {
        await prisma.taskAssignment.update({
          where: { id: assignment.id },
          data: { userId: toUserId },
        })
      }
    }
  }
}

export const ownershipTransfer = new OwnershipTransfer()

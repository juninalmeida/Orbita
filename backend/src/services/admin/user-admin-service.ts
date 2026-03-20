import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'
import { ownershipTransfer } from '@/services/admin/ownership-transfer'

class UserAdminService {
  async list() {
    const users = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
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

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.createdAt,
      teams: u.teams.map((t) => t.team),
      assignedTasksCount: u._count.taskAssignments,
    }))
  }

  async changeRole(
    targetUserId: string,
    adminId: string,
    role: 'admin' | 'member',
  ) {
    if (targetUserId === adminId) {
      throw new AppError('You cannot change your own role', 400)
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!user) throw new AppError('User not found', 404)

    return prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    })
  }

  async deactivate(targetUserId: string, adminId: string) {
    if (targetUserId === adminId) {
      throw new AppError('You cannot remove yourself', 400)
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!user) throw new AppError('User not found', 404)
    if (!user.active) throw new AppError('User is already deactivated', 400)

    await ownershipTransfer.transfer(targetUserId, adminId)

    await prisma.taskAssignment.deleteMany({
      where: { userId: targetUserId, role: 'helper' },
    })

    await prisma.teamMember.deleteMany({ where: { userId: targetUserId } })

    await prisma.user.update({
      where: { id: targetUserId },
      data: { active: false },
    })
  }
}

export const userAdminService = new UserAdminService()

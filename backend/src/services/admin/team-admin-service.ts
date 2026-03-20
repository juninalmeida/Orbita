import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'
import { ownershipTransfer } from '@/services/admin/ownership-transfer'

class TeamAdminService {
  async getDetail(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    })

    if (!team) throw new AppError('Team not found', 404)
    return team
  }

  async getTasks(teamId: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) throw new AppError('Team not found', 404)

    return prisma.task.findMany({
      where: { teamId, deleted: false },
      include: {
        assignments: {
          where: { status: 'assigned' },
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        requests: {
          select: { id: true, userId: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: { name: string; description?: string }) {
    return prisma.team.create({ data })
  }

  async delete(teamId: string, adminId: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) throw new AppError('Team not found', 404)

    await prisma.taskRequest.updateMany({
      where: { task: { teamId }, status: 'pending' },
      data: { status: 'rejected', resolvedBy: adminId, resolvedAt: new Date() },
    })

    await prisma.task.updateMany({
      where: { teamId, deleted: false },
      data: { deleted: true, deletedAt: new Date() },
    })

    await prisma.teamMember.deleteMany({ where: { teamId } })
    await prisma.team.delete({ where: { id: teamId } })
  }

  async archiveAllTasks(teamId: string, adminId: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) throw new AppError('Team not found', 404)

    const result = await prisma.task.updateMany({
      where: { teamId, archived: false, deleted: false },
      data: { archived: true, archivedAt: new Date() },
    })

    await prisma.taskRequest.updateMany({
      where: { task: { teamId }, status: 'pending' },
      data: { status: 'rejected', resolvedBy: adminId, resolvedAt: new Date() },
    })

    return result.count
  }

  async addMember(teamId: string, email: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) throw new AppError('Team not found', 404)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new AppError('User not found with this email', 404)

    const alreadyMember = await prisma.teamMember.findFirst({
      where: { teamId, userId: user.id },
    })
    if (alreadyMember) throw new AppError('User is already a member of this team', 409)

    await prisma.teamMember.create({ data: { teamId, userId: user.id } })

    return { id: user.id, name: user.name, email: user.email }
  }

  async removeMember(teamId: string, userId: string, adminId: string) {
    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    })
    if (!member) throw new AppError('Member not found in this team', 404)

    await ownershipTransfer.transfer(userId, adminId, { teamId })

    await prisma.taskAssignment.deleteMany({
      where: { userId, task: { teamId } },
    })

    await prisma.teamMember.delete({ where: { id: member.id } })
  }
}

export const teamAdminService = new TeamAdminService()

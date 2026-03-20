import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class TeamService {
  async create(userId: string, data: { name: string; description?: string }) {
    return prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        members: { create: { userId } },
      },
    })
  }

  async listByUser(userId: string) {
    return prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: { _count: { select: { members: true, tasks: true } } },
    })
  }

  async ensureMembership(teamId: string, userId: string) {
    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    })

    if (!member) {
      throw new AppError('You must be a member of this team', 403)
    }
  }

  async addMember(teamId: string, userId: string, requesterId: string) {
    await this.ensureMembership(teamId, requesterId)

    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) throw new AppError('Team not found', 404)

    const userExists = await prisma.user.findUnique({ where: { id: userId } })
    if (!userExists) throw new AppError('User not found', 404)

    const alreadyMember = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    })
    if (alreadyMember) {
      throw new AppError('User is already a member of this team', 409)
    }

    await prisma.teamMember.create({ data: { teamId, userId } })
  }

  async removeMember(teamId: string, userId: string, requesterId: string) {
    await this.ensureMembership(teamId, requesterId)

    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    })
    if (!member) throw new AppError('Member not found in this team', 404)

    await prisma.teamMember.delete({ where: { id: member.id } })
  }
}

export const teamService = new TeamService()

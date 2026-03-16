import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class TeamsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      description: z.string().trim().optional(),
    })

    const { name, description } = bodySchema.parse(request.body)

    const team = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          create: { userId: request.user.id },
        },
      },
    })

    return response.status(201).json(team)
  }

  async index(request: Request, response: Response) {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId: request.user.id },
        },
      },
      include: {
        _count: { select: { members: true, tasks: true } },
      },
    })
    return response.json(teams)
  }

  async addMember(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      userId: z.string().uuid(),
    })

    const { id: teamId } = paramsSchema.parse(request.params)
    const { userId } = bodySchema.parse(request.body)

    const team = await prisma.team.findUnique({ where: { id: teamId } })

    if (!team) {
      throw new AppError('Team not found', 404)
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } })

    if (!userExists) {
      throw new AppError('User not found', 404)
    }

    const alreadyMember = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    })

    if (alreadyMember) {
      throw new AppError('User is already a member of this team', 409)
    }

    await prisma.teamMember.create({ data: { teamId, userId } })

    return response.status(201).json({ message: 'Member added successfully' })
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
      throw new AppError('Member not found in this team', 404)
    }

    await prisma.teamMember.delete({ where: { id: member.id } })

    return response.json({ message: 'Member removed successfully' })
  }
}

export { TeamsController }

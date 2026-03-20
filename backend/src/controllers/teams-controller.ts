import { Request, Response } from 'express'
import { z } from 'zod'
import { teamService } from '@/services/team-service'

class TeamsController {
  async create(request: Request, response: Response) {
    const data = z
      .object({
        name: z.string().trim().min(2),
        description: z.string().trim().optional(),
      })
      .parse(request.body)

    const team = await teamService.create(request.user.id, data)

    return response.status(201).json(team)
  }

  async index(request: Request, response: Response) {
    const teams = await teamService.listByUser(request.user.id)

    return response.json(teams)
  }

  async addMember(request: Request, response: Response) {
    const { id: teamId } = z
      .object({ id: z.string().uuid() })
      .parse(request.params)
    const { userId } = z
      .object({ userId: z.string().uuid() })
      .parse(request.body)

    await teamService.addMember(teamId, userId, request.user.id)

    return response.status(201).json({ message: 'Member added successfully' })
  }

  async removeMember(request: Request, response: Response) {
    const { id: teamId, userId } = z
      .object({ id: z.string().uuid(), userId: z.string().uuid() })
      .parse(request.params)

    await teamService.removeMember(teamId, userId, request.user.id)

    return response.json({ message: 'Member removed successfully' })
  }
}

export { TeamsController }

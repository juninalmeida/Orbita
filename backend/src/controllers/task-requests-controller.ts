import { Request, Response } from 'express'
import { z } from 'zod'
import { taskRequestService } from '@/services/task-request-service'

class TaskRequestsControllerClass {
  async available(request: Request, response: Response) {
    const { teamId } = z
      .object({ teamId: z.string().uuid().optional() })
      .parse(request.query)

    const tasks = await taskRequestService.getAvailable(request.user.id, teamId)

    return response.json(tasks)
  }

  async createRequest(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    const data = z
      .object({
        type: z.enum(['view']),
        message: z.string().trim().max(500).optional(),
      })
      .parse(request.body)

    const taskRequest = await taskRequestService.createRequest(
      id,
      request.user.id,
      data,
    )

    return response.status(201).json(taskRequest)
  }

  async completedTasks(request: Request, response: Response) {
    const { teamId } = z
      .object({ teamId: z.string().uuid().optional() })
      .parse(request.query)

    const tasks = await taskRequestService.getCompleted(teamId)

    return response.json(tasks)
  }

  async allTeams(_request: Request, response: Response) {
    const teams = await taskRequestService.getAllTeams()

    return response.json(teams)
  }

  async teamCompleted(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    const result = await taskRequestService.getTeamCompleted(id)

    return response.json(result)
  }

  async myRequests(request: Request, response: Response) {
    const requests = await taskRequestService.getMyRequests(request.user.id)

    return response.json(requests)
  }
}

export const TaskRequestsController = new TaskRequestsControllerClass()

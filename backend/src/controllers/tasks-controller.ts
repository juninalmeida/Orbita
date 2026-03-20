import { Request, Response } from 'express'
import { z } from 'zod'
import { taskService } from '@/services/task-service'

class TasksController {
  async create(request: Request, response: Response) {
    const { id: teamId } = z
      .object({ id: z.string().uuid() })
      .parse(request.params)

    const data = z
      .object({
        title: z.string().trim().min(2),
        description: z.string().trim().optional(),
        priority: z.enum(['high', 'medium', 'low']).default('medium'),
      })
      .parse(request.body)

    const task = await taskService.create(
      teamId,
      request.user.id,
      request.user.role,
      data,
    )

    return response.status(201).json(task)
  }

  async index(request: Request, response: Response) {
    const { id: teamId } = z
      .object({ id: z.string().uuid() })
      .parse(request.params)

    const tasks = await taskService.listByTeam(
      teamId,
      request.user.id,
      request.user.role,
    )

    return response.json(tasks)
  }

  async show(request: Request, response: Response) {
    const { id } = z
      .object({ id: z.string().uuid() })
      .parse(request.params)

    const task = await taskService.getById(id, request.user.id, request.user.role)

    return response.json(task)
  }

  async updateStatus(request: Request, response: Response) {
    const { id } = z
      .object({ id: z.string().uuid() })
      .parse(request.params)

    const data = z
      .object({
        status: z.enum(['pending', 'in_progress', 'completed']),
        justification: z.string().trim().min(10).optional(),
      })
      .parse(request.body)

    await taskService.updateStatus(id, request.user.id, request.user.role, data)

    return response.json({ message: 'Status updated successfully' })
  }

  async history(request: Request, response: Response) {
    const { id } = z
      .object({ id: z.string().uuid() })
      .parse(request.params)

    const history = await taskService.getHistory(
      id,
      request.user.id,
      request.user.role,
    )

    return response.json(history)
  }
}

export { TasksController }

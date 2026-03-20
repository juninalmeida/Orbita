import { Request, Response } from 'express'
import { z } from 'zod'
import { assignmentService } from '@/services/assignment-service'

class AssignmentsController {
  async requestHelp(request: Request, response: Response) {
    const { id: taskId } = z
      .object({ id: z.string().uuid() })
      .parse(request.params)
    const { userId } = z
      .object({ userId: z.string().uuid() })
      .parse(request.body)

    const assignment = await assignmentService.requestHelp(
      taskId,
      userId,
      request.user.id,
      request.user.role,
    )

    return response.status(201).json(assignment)
  }

  async pending(request: Request, response: Response) {
    const assignments = await assignmentService.getPending(request.user.id)

    return response.json(assignments)
  }

  async respond(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { status } = z
      .object({ status: z.enum(['assigned', 'rejected']) })
      .parse(request.body)

    const result = await assignmentService.respond(id, request.user.id, status)

    if (!result) {
      return response.json({ message: 'Assignment rejected' })
    }

    return response.json(result)
  }

  async remove(request: Request, response: Response) {
    const { id: taskId, userId } = z
      .object({ id: z.string().uuid(), userId: z.string().uuid() })
      .parse(request.params)

    await assignmentService.removeHelper(
      taskId,
      userId,
      request.user.id,
      request.user.role,
    )

    return response.json({ message: 'Helper removed' })
  }
}

export const assignmentsController = new AssignmentsController()

import { Request, Response } from 'express'
import { z } from 'zod'
import { overviewService } from '@/services/admin/overview-service'
import { teamAdminService } from '@/services/admin/team-admin-service'
import { taskAdminService } from '@/services/admin/task-admin-service'
import { userAdminService } from '@/services/admin/user-admin-service'
import { requestAdminService } from '@/services/admin/request-admin-service'

class AdminController {
  // ── Overview & Analytics ──

  async overview(_request: Request, response: Response) {
    const data = await overviewService.getOverview()

    return response.json(data)
  }

  async analytics(_request: Request, response: Response) {
    const data = await overviewService.getAnalytics()

    return response.json(data)
  }

  // ── Teams ──

  async teamDetail(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    const team = await teamAdminService.getDetail(id)

    return response.json(team)
  }

  async teamTasks(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    const tasks = await teamAdminService.getTasks(id)

    return response.json(tasks)
  }

  async createTeam(request: Request, response: Response) {
    const data = z
      .object({
        name: z.string().trim().min(2),
        description: z.string().trim().optional(),
      })
      .parse(request.body)

    const team = await teamAdminService.create(data)

    return response.status(201).json(team)
  }

  async deleteTeam(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    await teamAdminService.delete(id, request.user.id)

    return response.json({ message: 'Team deleted successfully' })
  }

  async archiveTeamTasks(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    const count = await teamAdminService.archiveAllTasks(id, request.user.id)

    return response.json({
      message: `${count} tasks archived successfully`,
      count,
    })
  }

  async addMember(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { email } = z.object({ email: z.string().email() }).parse(request.body)

    const user = await teamAdminService.addMember(id, email)

    return response.status(201).json({
      message: 'Member added successfully',
      user,
    })
  }

  async removeMember(request: Request, response: Response) {
    const { id, userId } = z
      .object({ id: z.string().uuid(), userId: z.string().uuid() })
      .parse(request.params)

    await teamAdminService.removeMember(id, userId, request.user.id)

    return response.json({ message: 'Member removed successfully' })
  }

  // ── Tasks ──

  async updateTask(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    const data = z
      .object({
        title: z.string().trim().min(1).optional(),
        description: z.string().trim().optional(),
        status: z.enum(['pending', 'in_progress', 'completed']).optional(),
        priority: z.enum(['high', 'medium', 'low']).optional(),
        justification: z.string().optional(),
      })
      .parse(request.body)

    const task = await taskAdminService.update(id, request.user.id, data)

    return response.json(task)
  }

  async deleteTask(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    await taskAdminService.softDelete(id, request.user.id)

    return response.json({ message: 'Task deleted successfully' })
  }

  async deletedTasks(request: Request, response: Response) {
    const { teamId } = z
      .object({ teamId: z.string().uuid().optional() })
      .parse(request.query)

    const tasks = await taskAdminService.getDeleted(teamId)

    return response.json(tasks)
  }

  async archiveTask(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { archived } = z.object({ archived: z.boolean() }).parse(request.body)

    const task = await taskAdminService.toggleArchive(id, archived, request.user.id)

    return response.json(task)
  }

  async archivedTasks(request: Request, response: Response) {
    const { teamId } = z
      .object({ teamId: z.string().uuid().optional() })
      .parse(request.query)

    const tasks = await taskAdminService.getArchived(teamId)

    return response.json(tasks)
  }

  async directAssign(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.body)

    const task = await taskAdminService.directAssign(id, userId, request.user.id)

    return response.json(task)
  }

  // ── Requests ──

  async pendingRequests(_request: Request, response: Response) {
    const requests = await requestAdminService.getPending()

    return response.json(requests)
  }

  async resolveRequest(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { status } = z
      .object({ status: z.enum(['approved', 'rejected']) })
      .parse(request.body)

    await requestAdminService.resolve(id, request.user.id, status)

    return response.json({ message: 'Request resolved successfully' })
  }

  // ── Users ──

  async listUsers(_request: Request, response: Response) {
    const users = await userAdminService.list()

    return response.json(users)
  }

  async changeUserRole(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { role } = z
      .object({ role: z.enum(['admin', 'member']) })
      .parse(request.body)

    const user = await userAdminService.changeRole(id, request.user.id, role)

    return response.json(user)
  }

  async removeUser(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    await userAdminService.deactivate(id, request.user.id)

    return response.json({ message: 'User deactivated successfully' })
  }
}

export const adminController = new AdminController()

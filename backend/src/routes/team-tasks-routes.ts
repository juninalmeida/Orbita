import { Router } from 'express'
import { TasksController } from '@/controllers/tasks-controller'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'

const teamTasksRoutes = Router({ mergeParams: true })
const tasksController = new TasksController()

teamTasksRoutes.use(ensureAuthenticated)

teamTasksRoutes.post('/', tasksController.create)
teamTasksRoutes.get('/', tasksController.index)

export { teamTasksRoutes }

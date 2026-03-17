// src/routes/task-routes.ts
import { Router } from 'express'
import { TasksController } from '@/controllers/tasks-controller'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'

const taskRoutes = Router()
const tasksController = new TasksController()

taskRoutes.use(ensureAuthenticated)

taskRoutes.get('/:id', tasksController.show)
taskRoutes.patch('/:id/status', tasksController.updateStatus)
taskRoutes.get('/:id/history', tasksController.history)

export { taskRoutes }

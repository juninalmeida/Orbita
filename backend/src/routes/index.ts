import { Router } from 'express'
import { usersRoutes } from './users-routes'
import { sessionsRoutes } from './sessions-routes'
import { teamsRoutes } from './team-routes'
import { teamTasksRoutes } from './team-tasks-routes'
import { taskRequestsRoutes } from './task-requests-routes'
import { taskRoutes } from './tasks-routes'
import { adminRoutes } from './admin-routes'
import { assignmentsRoutes } from './assignments-routes'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'
import { assignmentsController } from '@/controllers/assignments-controller'

const routes = Router()

routes.get('/health', (_req, res) => {
  res.json({ status: 'Orbita API Online!' })
})

routes.use('/users', usersRoutes)
routes.use('/sessions', sessionsRoutes)
routes.use('/teams', teamsRoutes)
routes.use('/teams/:id/tasks', teamTasksRoutes)
routes.use('/tasks', taskRequestsRoutes)
routes.use('/tasks', taskRoutes)
routes.use('/admin', adminRoutes)
routes.use('/task-assignments', assignmentsRoutes)
routes.post('/tasks/:id/request-help', ensureAuthenticated, assignmentsController.requestHelp)
routes.delete('/tasks/:id/assignments/:userId', ensureAuthenticated, assignmentsController.remove)

export { routes }

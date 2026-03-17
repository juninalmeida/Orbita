import { Router } from 'express'
import { usersRoutes } from './users-routes'
import { sessionsRoutes } from './sessions-routes'
import { teamsRoutes } from './team-routes'
import { teamTasksRoutes } from './team-tasks-routes'
import { taskRoutes } from './tasks-routes'

const routes = Router()

routes.get('/health', (_req, res) => {
  res.json({ status: 'Orbita API Online!' })
})

routes.use('/users', usersRoutes)
routes.use('/sessions', sessionsRoutes)
routes.use('/teams', teamsRoutes)
routes.use('/teams/:id/tasks', teamTasksRoutes)
routes.use('/tasks', taskRoutes)

export { routes }

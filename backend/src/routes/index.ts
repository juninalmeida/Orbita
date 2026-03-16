import { Router } from 'express'
import { usersRoutes } from './users-routes'
import { sessionsRoutes } from './sessions-routes'

const routes = Router()

routes.get('/health', (_req, res) => {
  res.json({ status: 'Orbita API Online!' })
})

routes.use('/users', usersRoutes)
routes.use('/sessions', sessionsRoutes)

export { routes }

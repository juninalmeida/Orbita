import { Router } from 'express'
import { SessionsController } from '@/controllers/sessions-controller'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'

const sessionsRoutes = Router()
const sessionsController = new SessionsController()

sessionsRoutes.get('/me', ensureAuthenticated, sessionsController.show)

sessionsRoutes.post('/', sessionsController.create) // login
sessionsRoutes.delete('/', sessionsController.remove) // logout

export { sessionsRoutes }

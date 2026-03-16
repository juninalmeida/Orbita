import { Router } from 'express'
import { SessionsController } from '@/controllers/sessions-controller'

const sessionsRoutes = Router()
const sessionsController = new SessionsController()

sessionsRoutes.post('/', sessionsController.create) // login
sessionsRoutes.delete('/', sessionsController.remove) // logout

export { sessionsRoutes }

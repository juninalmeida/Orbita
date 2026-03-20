import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { SessionsController } from '@/controllers/sessions-controller'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'

const sessionsRoutes = Router()
const sessionsController = new SessionsController()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

sessionsRoutes.get('/me', ensureAuthenticated, sessionsController.show)

sessionsRoutes.post('/', loginLimiter, sessionsController.create) // login
sessionsRoutes.delete('/', ensureAuthenticated, sessionsController.remove) // logout

export { sessionsRoutes }

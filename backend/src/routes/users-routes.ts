import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { UsersController } from '@/controllers/users-controller'

const usersRoutes = Router()
const usersController = new UsersController()

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many accounts created. Try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
})

usersRoutes.post('/', registerLimiter, usersController.create)

export { usersRoutes }

import { Router } from 'express'
import { usersPublicController } from '@/controllers/users-controller-public'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'

const usersPublicRoutes = Router()

usersPublicRoutes.use(ensureAuthenticated)
usersPublicRoutes.get('/', usersPublicController.list)

export { usersPublicRoutes }

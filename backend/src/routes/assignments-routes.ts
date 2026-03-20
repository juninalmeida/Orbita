import { Router } from 'express'
import { assignmentsController } from '@/controllers/assignments-controller'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'

const assignmentsRoutes = Router()

assignmentsRoutes.use(ensureAuthenticated)

assignmentsRoutes.get('/pending', assignmentsController.pending)
assignmentsRoutes.patch('/:id/respond', assignmentsController.respond)

export { assignmentsRoutes }

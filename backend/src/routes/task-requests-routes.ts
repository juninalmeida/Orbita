import { Router } from 'express'
import { TaskRequestsController } from '@/controllers/task-requests-controller'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'

const taskRequestsRoutes = Router()

taskRequestsRoutes.use(ensureAuthenticated)

taskRequestsRoutes.get('/available', TaskRequestsController.available)
taskRequestsRoutes.get('/completed', TaskRequestsController.completedTasks)
taskRequestsRoutes.get('/teams', TaskRequestsController.allTeams)
taskRequestsRoutes.get('/teams/:id', TaskRequestsController.teamCompleted)
taskRequestsRoutes.post('/:id/request', TaskRequestsController.createRequest)
taskRequestsRoutes.get('/my-requests', TaskRequestsController.myRequests)

export { taskRequestsRoutes }

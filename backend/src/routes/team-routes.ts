import { Router } from 'express'
import { TeamsController } from '@/controllers/teams-controller'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'

const teamsRoutes = Router()
const teamsController = new TeamsController()

teamsRoutes.use(ensureAuthenticated)

teamsRoutes.post('/', teamsController.create)
teamsRoutes.get('/', teamsController.index)
teamsRoutes.post('/:id/members', teamsController.addMember)
teamsRoutes.delete('/:id/members/:userId', teamsController.removeMember)

export { teamsRoutes }

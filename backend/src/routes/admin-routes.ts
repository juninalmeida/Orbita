import { Router } from 'express'
import { adminController } from '@/controllers/admin-controller'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'
import { ensureAdmin } from '@/middlewares/ensure-admin'

const adminRoutes = Router()

adminRoutes.use(ensureAuthenticated, ensureAdmin)

adminRoutes.get('/overview', adminController.overview)
adminRoutes.get('/analytics', adminController.analytics)
adminRoutes.post('/teams', adminController.createTeam)
adminRoutes.get('/teams/:id', adminController.teamDetail)
adminRoutes.get('/teams/:id/tasks', adminController.teamTasks)
adminRoutes.delete('/teams/:id', adminController.deleteTeam)
adminRoutes.post('/teams/:id/archive', adminController.archiveTeamTasks)
adminRoutes.post('/teams/:id/members', adminController.addMember)
adminRoutes.delete('/teams/:id/members/:userId', adminController.removeMember)
adminRoutes.patch('/tasks/:id', adminController.updateTask)
adminRoutes.delete('/tasks/:id', adminController.deleteTask)
adminRoutes.patch('/tasks/:id/archive', adminController.archiveTask)
adminRoutes.get('/archived', adminController.archivedTasks)
adminRoutes.get('/deleted', adminController.deletedTasks)
adminRoutes.get('/requests', adminController.pendingRequests)
adminRoutes.patch('/requests/:id', adminController.resolveRequest)
adminRoutes.get('/users', adminController.listUsers)
adminRoutes.patch('/users/:id/role', adminController.changeUserRole)
adminRoutes.delete('/users/:id', adminController.removeUser)
adminRoutes.post('/tasks/:id/assign', adminController.directAssign)

export { adminRoutes }

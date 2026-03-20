import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { profileController } from '@/controllers/profile-controller'
import { ensureAuthenticated } from '@/middlewares/ensure-authenticated'

const profileRoutes = Router()

profileRoutes.use(ensureAuthenticated)

const avatarUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many avatar uploads. Try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as Express.Request).user.id,
})

profileRoutes.patch('/profile', profileController.update)
profileRoutes.patch(
  '/profile/avatar',
  avatarUploadLimiter,
  profileController.updateAvatar,
)
profileRoutes.delete('/profile/avatar', profileController.removeAvatar)
profileRoutes.get('/:id/profile', profileController.publicProfile)

export { profileRoutes }

import { Request, Response } from 'express'
import { z } from 'zod'
import { profileService } from '@/services/profile-service'

class ProfileController {
  async update(request: Request, response: Response) {
    const data = z
      .object({
        name: z.string().trim().min(2).max(100).optional(),
        bio: z.string().trim().max(300).optional().nullable(),
      })
      .parse(request.body)

    const user = await profileService.updateProfile(request.user.id, data)

    return response.json(user)
  }

  async updateAvatar(request: Request, response: Response) {
    const { avatar } = z
      .object({ avatar: z.string().min(1) })
      .parse(request.body)

    await profileService.updateAvatar(request.user.id, avatar)

    return response.json({ message: 'Avatar updated successfully' })
  }

  async removeAvatar(request: Request, response: Response) {
    await profileService.removeAvatar(request.user.id)

    return response.json({ message: 'Avatar removed successfully' })
  }

  async publicProfile(request: Request, response: Response) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    const profile = await profileService.getPublicProfile(id)

    return response.json(profile)
  }
}

export const profileController = new ProfileController()

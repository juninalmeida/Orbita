import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
}

const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46]
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50]

const MAX_AVATAR_SIZE = 500 * 1024

function detectMimeType(buffer: Buffer): string | null {
  for (const [mime, bytes] of Object.entries(MAGIC_BYTES)) {
    if (bytes.every((b, i) => buffer[i] === b)) return mime
  }

  if (
    buffer.length >= 12 &&
    WEBP_RIFF.every((b, i) => buffer[i] === b) &&
    WEBP_MARKER.every((b, i) => buffer[i + 8] === b)
  ) {
    return 'image/webp'
  }

  return null
}

class ProfileService {
  async updateProfile(
    userId: string,
    data: { name?: string; bio?: string | null },
  ) {
    const { password: _, avatar: __, ...user } = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
    })

    return user
  }

  async updateAvatar(userId: string, base64String: string) {
    const buffer = Buffer.from(base64String, 'base64')

    if (buffer.length > MAX_AVATAR_SIZE) {
      throw new AppError('Image must be smaller than 500KB', 413)
    }

    const mime = detectMimeType(buffer)

    if (!mime) {
      throw new AppError(
        'Invalid image format. Only JPEG, PNG, and WebP are accepted.',
        400,
      )
    }

    const dataUrl = `data:${mime};base64,${base64String}`

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: dataUrl },
    })
  }

  async removeAvatar(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    })
  }

  async getPublicProfile(targetUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        active: true,
        createdAt: true,
      },
    })

    if (!user || !user.active) {
      throw new AppError('User not found', 404)
    }

    const totalAssigned = await prisma.taskAssignment.count({
      where: { userId: targetUserId, status: 'assigned' },
    })

    const totalCompleted = await prisma.taskAssignment.count({
      where: {
        userId: targetUserId,
        status: 'assigned',
        task: { status: 'completed' },
      },
    })

    const completionRate =
      totalAssigned > 0
        ? Math.round((totalCompleted / totalAssigned) * 100)
        : 0

    const teamMembers = await prisma.teamMember.findMany({
      where: { userId: targetUserId },
      select: { team: { select: { id: true, name: true } } },
    })

    const { active: _, ...profile } = user

    return {
      ...profile,
      metrics: { totalAssigned, totalCompleted, completionRate },
      teams: teamMembers.map((tm) => tm.team),
    }
  }
}

export const profileService = new ProfileService()

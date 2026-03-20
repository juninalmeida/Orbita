import { prisma } from '@/database/prisma'
import { AppError } from '@/utils/AppError'

class RequestAdminService {
  async getPending() {
    return prisma.taskRequest.findMany({
      where: { status: 'pending' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: {
          select: {
            id: true,
            title: true,
            team: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async resolve(requestId: string, adminId: string, status: 'approved' | 'rejected') {
    const taskRequest = await prisma.taskRequest.findUnique({
      where: { id: requestId },
      include: { task: true },
    })

    if (!taskRequest) throw new AppError('Request not found', 404)

    if (taskRequest.status !== 'pending') {
      throw new AppError('Request has already been resolved', 400)
    }

    await prisma.taskRequest.update({
      where: { id: requestId },
      data: {
        status,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      },
    })
  }
}

export const requestAdminService = new RequestAdminService()

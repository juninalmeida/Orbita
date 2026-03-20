import { prisma } from '@/database/prisma'

class OverviewService {
  async getOverview() {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
          },
        },
        tasks: {
          where: { archived: false, deleted: false },
        },
      },
    })

    const totalTeams = teams.length

    const totalMembers = teams.reduce((acc, team) => {
      const memberCount = team.members.filter(
        (m) => m.user.role === 'member',
      ).length
      return acc + memberCount
    }, 0)

    let totalTasks = 0
    let completedTasks = 0

    const teamsData = teams.map((team) => {
      const tasks = team.tasks

      totalTasks += tasks.length
      completedTasks += tasks.filter((t) => t.status === 'completed').length

      const tasksByStatus = {
        pending: tasks.filter((t) => t.status === 'pending').length,
        in_progress: tasks.filter((t) => t.status === 'in_progress').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
      }

      const tasksByPriority = {
        high: tasks.filter((t) => t.priority === 'high').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        low: tasks.filter((t) => t.priority === 'low').length,
      }

      const progress =
        tasks.length > 0
          ? Math.round((tasksByStatus.completed / tasks.length) * 100)
          : 0

      return {
        id: team.id,
        name: team.name,
        members: team.members.map((m) => m.user),
        tasksByStatus,
        tasksByPriority,
        totalTasks: tasks.length,
        progress,
      }
    })

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const activeTasks = totalTasks - completedTasks

    return {
      metrics: { totalTeams, totalMembers, activeTasks, completionRate },
      teams: teamsData,
    }
  }

  async getAnalytics() {
    const now = new Date()

    const eightWeeksAgo = new Date(now)
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 8 * 7)

    const recentTasks = await prisma.task.findMany({
      where: { createdAt: { gte: eightWeeksAgo } },
      select: { createdAt: true },
    })

    const weekMap = new Map<string, number>()
    for (const task of recentTasks) {
      const date = new Date(task.createdAt)
      const day = date.getDay()
      const diff = date.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(date.setDate(diff))
      monday.setHours(0, 0, 0, 0)
      const key = monday.toISOString().split('T')[0]
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1)
    }

    const tasksPerWeek = Array.from(weekMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))

    const priorityGroups = await prisma.task.groupBy({
      by: ['priority'],
      where: { archived: false },
      _count: { priority: true },
    })

    const priorityDistribution = priorityGroups.map((g) => ({
      priority: g.priority,
      count: g._count.priority,
    }))

    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activityGroups = await prisma.taskHistory.groupBy({
      by: ['changedBy'],
      where: { changedAt: { gte: thirtyDaysAgo } },
      _count: { changedBy: true },
      orderBy: { _count: { changedBy: 'desc' } },
      take: 10,
    })

    const userIds = activityGroups.map((g) => g.changedBy)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, avatar: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const mostActiveMembers = activityGroups.map((g) => ({
      user: userMap.get(g.changedBy) ?? { id: g.changedBy, name: null, email: null },
      activityCount: g._count.changedBy,
    }))

    return { tasksPerWeek, priorityDistribution, mostActiveMembers }
  }
}

export const overviewService = new OverviewService()

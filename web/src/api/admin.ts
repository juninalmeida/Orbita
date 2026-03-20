import { api } from '@/lib/axios'

export async function getAdminOverview() {
  const { data } = await api.get('/admin/overview')
  return data
}

export async function getAdminAnalytics() {
  const { data } = await api.get('/admin/analytics')
  return data
}

export async function getAdminTeam(teamId: string) {
  const { data } = await api.get(`/admin/teams/${teamId}`)
  return data
}

export async function getAdminTeamTasks(teamId: string) {
  const { data } = await api.get(`/admin/teams/${teamId}/tasks`)
  return data
}

export async function updateAdminTask(taskId: string, body: Record<string, unknown>) {
  const { data } = await api.patch(`/admin/tasks/${taskId}`, body)
  return data
}

export async function deleteAdminTask(taskId: string) {
  const { data } = await api.delete(`/admin/tasks/${taskId}`)
  return data
}

export async function archiveTask(taskId: string, archived: boolean) {
  const { data } = await api.patch(`/admin/tasks/${taskId}/archive`, { archived })
  return data
}

export async function getArchivedTasks(teamId?: string) {
  const params = teamId ? `?teamId=${teamId}` : ''
  const { data } = await api.get(`/admin/archived${params}`)
  return data
}

export async function getPendingRequests() {
  const { data } = await api.get('/admin/requests')
  return data
}

export async function resolveRequest(requestId: string, status: 'approved' | 'rejected') {
  const { data } = await api.patch(`/admin/requests/${requestId}`, { status })
  return data
}

export async function createAdminTeam(name: string, description?: string) {
  const { data } = await api.post('/admin/teams', { name, description })
  return data
}

export async function deleteAdminTeam(teamId: string) {
  const { data } = await api.delete(`/admin/teams/${teamId}`)
  return data
}

export async function addAdminTeamMember(teamId: string, email: string) {
  const { data } = await api.post(`/admin/teams/${teamId}/members`, { email })
  return data
}

export async function removeAdminTeamMember(teamId: string, userId: string) {
  const { data } = await api.delete(`/admin/teams/${teamId}/members/${userId}`)
  return data
}

export async function getDeletedTasks(teamId?: string) {
  const params = teamId ? `?teamId=${teamId}` : ''
  const { data } = await api.get(`/admin/deleted${params}`)
  return data
}

export async function archiveTeamTasks(teamId: string) {
  const { data } = await api.post(`/admin/teams/${teamId}/archive`)
  return data
}

export async function getAdminUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

export async function changeUserRole(userId: string, role: 'admin' | 'member') {
  const { data } = await api.patch(`/admin/users/${userId}/role`, { role })
  return data
}

export async function removeUser(userId: string) {
  const { data } = await api.delete(`/admin/users/${userId}`)
  return data
}

export async function directAssignTask(taskId: string, userId: string) {
  const { data } = await api.post(`/admin/tasks/${taskId}/assign`, { userId })
  return data
}

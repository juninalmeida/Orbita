import { api } from '@/lib/axios'

export async function getAvailableTasks(teamId?: string) {
  const params = teamId ? `?teamId=${teamId}` : ''
  const { data } = await api.get(`/tasks/available${params}`)
  return data
}

export async function createTaskRequest(
  taskId: string,
  type: 'view' | 'participate',
  message?: string,
) {
  const { data } = await api.post(`/tasks/${taskId}/request`, { type, message })
  return data
}

export async function getMyRequests() {
  const { data } = await api.get('/tasks/my-requests')
  return data
}

export async function getCompletedTasks(teamId?: string) {
  const params = teamId ? `?teamId=${teamId}` : ''
  const { data } = await api.get(`/tasks/completed${params}`)
  return data
}

export async function getAllTeams() {
  const { data } = await api.get('/tasks/teams')
  return data
}

export async function getTeamCompleted(teamId: string) {
  const { data } = await api.get(`/tasks/teams/${teamId}`)
  return data
}

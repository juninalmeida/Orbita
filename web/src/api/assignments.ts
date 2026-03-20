import { api } from '@/lib/axios'
import type { TaskAssignment } from '@/types/assignment'

export async function requestHelp(taskId: string, userId: string) {
  const { data } = await api.post<TaskAssignment>(`/tasks/${taskId}/request-help`, { userId })
  return data
}

export async function getPendingAssignments() {
  const { data } = await api.get<TaskAssignment[]>('/task-assignments/pending')
  return data
}

export async function respondAssignment(id: string, status: 'assigned' | 'rejected') {
  const { data } = await api.patch(`/task-assignments/${id}/respond`, { status })
  return data
}

export async function removeHelper(taskId: string, userId: string) {
  const { data } = await api.delete(`/tasks/${taskId}/assignments/${userId}`)
  return data
}

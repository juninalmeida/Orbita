import type { Task, TaskHistory } from '@/types/task'
import { api } from '@/lib/axios'


export async function getTeamTasks(teamId: string) {
  const response = await api.get<Task[]>(`/teams/${teamId}/tasks`)
  return response.data
}

export async function createTask(
  teamId: string,
  data: {
    title: string
    description?: string
    priority: string
  },
) {
  const response = await api.post<Task>(`/teams/${teamId}/tasks`, data)
  return response.data
}

export async function getTask(taskId: string) {
  const response = await api.get<Task>(`/tasks/${taskId}`)
  return response.data
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  justification?: string,
) {
  const { data } = await api.patch(`/tasks/${taskId}/status`, {
    status,
    justification,
  })
  return data
}

export async function getTaskHistory(taskId: string) {
  const response = await api.get<TaskHistory[]>(`/tasks/${taskId}/history`)
  return response.data
}
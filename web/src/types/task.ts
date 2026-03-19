import type { User } from './user'

export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  teamId: string
  assignedTo: User | null
  createdAt: string
  updatedAt: string
}

export interface TaskHistory {
  id: string
  taskId: string
  fromStatus: TaskStatus | null
  toStatus: TaskStatus
  changedAt: string
  changer: User
}

export type RequestType = 'view' | 'participate'
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface TaskRequest {
  id: string
  taskId: string
  userId: string
  type: RequestType
  status: RequestStatus
  message: string | null
  resolvedBy: string | null
  createdAt: string
  resolvedAt: string | null
  user?: {
    id: string
    name: string
    email: string
  }
  task?: {
    id: string
    title: string
    status: string
    priority: string
    team?: {
      id: string
      name: string
    }
  }
}

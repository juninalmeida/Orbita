export interface TaskAssignment {
  id: string
  user: { id: string; name: string; email: string; avatar?: string | null }
  role: 'owner' | 'helper'
  status: 'assigned' | 'pending' | 'rejected'
  requestedBy?: { id: string; name: string } | null
  task?: { id: string; title: string }
}

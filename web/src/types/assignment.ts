export interface TaskAssignment {
  id: string
  user: { id: string; name: string; email: string }
  role: 'owner' | 'helper'
  status: 'assigned' | 'pending' | 'rejected'
  requestedBy?: { id: string; name: string } | null
  task?: { id: string; title: string }
}

import { api } from '@/lib/axios'

export interface UserListItem {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
}

export async function listUsers() {
  const { data } = await api.get<UserListItem[]>('/users/list')
  return data
}

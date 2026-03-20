import { api } from '@/lib/axios'

export async function updateProfile(data: { name?: string; bio?: string | null }) {
  const { data: result } = await api.patch('/users/profile', data)
  return result
}

export async function updateAvatar(avatar: string) {
  const { data: result } = await api.patch('/users/profile/avatar', { avatar })
  return result
}

export async function removeAvatar() {
  const { data: result } = await api.delete('/users/profile/avatar')
  return result
}

export interface PublicProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  bio: string | null
  avatar: string | null
  createdAt: string
  metrics: {
    totalAssigned: number
    totalCompleted: number
    completionRate: number
  }
  teams: { id: string; name: string }[]
}

export async function getPublicProfile(userId: string) {
  const { data } = await api.get<PublicProfile>(`/users/${userId}/profile`)
  return data
}

import type { User } from '@/types/user'
import { api } from '@/lib/axios'

export async function getMe() {
  const response = await api.get<User>('/sessions/me')
  return response.data
}

export async function login(email: string, password: string) {
  const response = await api.post<{ message: string }>('/sessions', {
    email,
    password,
  })
  return response.data
}

export async function register(name: string, email: string, password: string) {
  const response = await api.post<User>('/users', { name, email, password })
  return response.data
}

export async function logout() {
  const response = await api.delete<{ message: string }>('/sessions')
  return response.data
}

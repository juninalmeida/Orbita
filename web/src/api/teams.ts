import type { Team, TeamMember } from '@/types/team'
import { api } from '@/lib/axios'

export async function getTeams() {
  const response = await api.get<Team[]>('/teams')
  return response.data
}

export async function createTeam(name: string) {
  const response = await api.post<Team>('/teams', { name })
  return response.data
}

export async function addMember(teamId: string, email: string) {
  const response = await api.post<TeamMember>(`/teams/${teamId}/members`, {
    email,
  })
  return response.data
}

export async function removeMember(teamId: string, memberId: string) {
  await api.delete(`/teams/${teamId}/members/${memberId}`)
}

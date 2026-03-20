import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAvailableTasks,
  createTaskRequest,
  getMyRequests,
  getCompletedTasks,
  getAllTeams,
  getTeamCompleted,
} from '@/api/task-requests'

export function useAvailableTasks(teamId?: string) {
  const { data: availableTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'available', teamId ?? 'all'],
    queryFn: () => getAvailableTasks(teamId || undefined),
  })

  return { availableTasks, isLoading }
}

export function useMyRequests() {
  const queryClient = useQueryClient()

  const { data: myRequests = [], isLoading } = useQuery({
    queryKey: ['tasks', 'my-requests'],
    queryFn: getMyRequests,
  })

  const { mutate: requestAccess, isPending: isRequesting } = useMutation({
    mutationFn: ({
      taskId,
      type,
      message,
    }: {
      taskId: string
      type: 'view' | 'participate'
      message?: string
    }) => createTaskRequest(taskId, type, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my-requests'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'available'] })
    },
  })

  return { myRequests, isLoading, requestAccess, isRequesting }
}

export function useCompletedTasks(teamId?: string) {
  const { data: completedTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'completed', teamId ?? 'all'],
    queryFn: () => getCompletedTasks(teamId || undefined),
  })

  return { completedTasks, isLoading }
}

export function useAllTeams() {
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['member', 'teams'],
    queryFn: getAllTeams,
  })

  return { teams, isLoading }
}

export function useTeamCompleted(teamId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['member', 'team', teamId],
    queryFn: () => getTeamCompleted(teamId),
    enabled: !!teamId,
  })

  return { team: data, isLoading }
}

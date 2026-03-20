import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTeamTasks, createTask, updateTaskStatus } from '@/api/tasks'

export function useTasks(teamId: string) {
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', teamId],
    queryFn: () => getTeamTasks(teamId),
  })

  const { mutate: addTask, isPending: isCreating } = useMutation({
    mutationFn: (data: {
      title: string
      description?: string
      priority: string
    }) => createTask(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', teamId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ taskId, status, justification }: { taskId: string; status: string; justification?: string }) =>
      updateTaskStatus(taskId, status, justification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  return { tasks, isLoading, addTask, isCreating, changeStatus }
}

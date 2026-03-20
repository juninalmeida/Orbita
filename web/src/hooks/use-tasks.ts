import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTeamTasks, createTask, updateTaskStatus } from '@/api/tasks'
import type { TaskStatus } from '@/types/task'

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
      assignedToId?: string
    }) => createTask(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', teamId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', teamId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  return { tasks, isLoading, addTask, isCreating, changeStatus }
}

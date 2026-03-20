import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTask, getTaskHistory, updateTaskStatus } from '@/api/tasks'
import type { TaskStatus } from '@/types/task'

export function useTaskDetail(taskId: string | null) {
  const queryClient = useQueryClient()

  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ['tasks', 'detail', taskId],
    queryFn: () => getTask(taskId!),
    enabled: !!taskId,
  })

  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['tasks', 'history', taskId],
    queryFn: () => getTaskHistory(taskId!),
    enabled: !!taskId,
  })

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ status, justification }: { status: TaskStatus; justification?: string }) =>
      updateTaskStatus(taskId!, status, justification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'history', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { task, history, isLoadingTask, isLoadingHistory, changeStatus }
}
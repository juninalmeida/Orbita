import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPendingAssignments, respondAssignment, requestHelp, removeHelper } from '@/api/assignments'

export function usePendingAssignments() {
  const queryClient = useQueryClient()

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['assignments', 'pending'],
    queryFn: getPendingAssignments,
    refetchInterval: 30000,
  })

  const { mutate: respond } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'assigned' | 'rejected' }) =>
      respondAssignment(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { pending, isLoading, respond }
}

export function useRequestHelp() {
  const queryClient = useQueryClient()

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      requestHelp(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { sendRequest, isPending }
}

export function useRemoveHelper() {
  const queryClient = useQueryClient()

  const { mutate: remove, isPending } = useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      removeHelper(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { remove, isPending }
}

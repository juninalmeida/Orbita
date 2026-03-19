import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTeams, createTeam } from '@/api/teams'

export function useTeams() {
  const queryClient = useQueryClient()

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const { mutate: addTeam, isPending } = useMutation({
    mutationFn: (name: string) => createTeam(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  return { teams, isLoading, addTeam, isPending }
}
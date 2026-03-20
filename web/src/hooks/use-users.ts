import { useQuery } from '@tanstack/react-query'
import { listUsers } from '@/api/users'

export function useUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
  })

  return { users, isLoading }
}

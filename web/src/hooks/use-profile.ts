import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateProfile,
  updateAvatar,
  removeAvatar,
  getPublicProfile,
} from '@/api/profile'

export function usePublicProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => getPublicProfile(userId!),
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'me'] })
    },
  })
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'me'] })
    },
  })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'me'] })
    },
  })
}

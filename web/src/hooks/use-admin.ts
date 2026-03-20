import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminOverview,
  getAdminAnalytics,
  getAdminTeamTasks,
  updateAdminTask,
  deleteAdminTask,
  archiveTask,
  getArchivedTasks,
  getPendingRequests,
  resolveRequest,
  createAdminTeam,
  deleteAdminTeam,
  addAdminTeamMember,
  removeAdminTeamMember,
  getDeletedTasks,
  archiveTeamTasks,
  getAdminUsers,
  changeUserRole,
  removeUser,
  directAssignTask,
} from '@/api/admin'

export function useAdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getAdminOverview,
  })

  return { data, isLoading }
}

export function useAdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: getAdminAnalytics,
  })

  return { data, isLoading }
}

export function useAdminTeamTasks(teamId: string) {
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['admin', 'tasks', teamId],
    queryFn: () => getAdminTeamTasks(teamId),
    enabled: !!teamId,
  })

  const { mutate: editTask, isPending: isEditing } = useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: Record<string, unknown> }) =>
      updateAdminTask(taskId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks', teamId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const { mutate: removeTask, isPending: isRemoving } = useMutation({
    mutationFn: (taskId: string) => deleteAdminTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks', teamId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'deleted'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const { mutate: toggleArchive, isPending: isArchiving } = useMutation({
    mutationFn: ({ taskId, archived }: { taskId: string; archived: boolean }) =>
      archiveTask(taskId, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks', teamId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'archived'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { tasks, isLoading, editTask, isEditing, removeTask, isRemoving, toggleArchive, isArchiving }
}

export function useArchivedTasks(teamId?: string) {
  const queryClient = useQueryClient()

  const { data: archivedTasks = [], isLoading } = useQuery({
    queryKey: ['admin', 'archived', teamId],
    queryFn: () => getArchivedTasks(teamId),
  })

  const { mutate: unarchive, isPending: isUnarchiving } = useMutation({
    mutationFn: (taskId: string) => archiveTask(taskId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'archived'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { archivedTasks, isLoading, unarchive, isUnarchiving }
}

export function useDeletedTasks(teamId?: string) {
  const { data: deletedTasks = [], isLoading } = useQuery({
    queryKey: ['admin', 'deleted', teamId],
    queryFn: () => getDeletedTasks(teamId),
  })

  return { deletedTasks, isLoading }
}

export function useArchiveTeamTasks() {
  const queryClient = useQueryClient()

  const { mutate: archiveAll, isPending: isArchiving } = useMutation({
    mutationFn: (teamId: string) => archiveTeamTasks(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { archiveAll, isArchiving }
}

export function useAdminTeams() {
  const queryClient = useQueryClient()

  const { mutate: createTeam, isPending: isCreating } = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      createAdminTeam(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })

  const { mutate: deleteTeam, isPending: isDeleting } = useMutation({
    mutationFn: (teamId: string) => deleteAdminTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'deleted'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })
    },
  })

  const { mutate: addMember, isPending: isAddingMember } = useMutation({
    mutationFn: ({ teamId, email }: { teamId: string; email: string }) =>
      addAdminTeamMember(teamId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
      queryClient.invalidateQueries({ queryKey: ['admin-team'] })
    },
  })

  const { mutate: removeMember, isPending: isRemovingMember } = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeAdminTeamMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
      queryClient.invalidateQueries({ queryKey: ['admin-team'] })
    },
  })

  return {
    createTeam, isCreating,
    deleteTeam, isDeleting,
    addMember, isAddingMember,
    removeMember, isRemovingMember,
  }
}

export function useAdminUsers(enabled = true) {
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
    enabled,
  })

  const { mutate: changeRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'member' }) =>
      changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const { mutate: deleteUser } = useMutation({
    mutationFn: (userId: string) => removeUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
  })

  const { mutate: assignToTask } = useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      directAssignTask(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
  })

  return { users, isLoading, changeRole, deleteUser, assignToTask }
}

export function usePendingRequests() {
  const queryClient = useQueryClient()

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin', 'requests'],
    queryFn: getPendingRequests,
  })

  const { mutate: resolve, isPending: isResolving } = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: 'approved' | 'rejected' }) =>
      resolveRequest(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'requests'] })
    },
  })

  return { requests, isLoading, resolve, isResolving }
}

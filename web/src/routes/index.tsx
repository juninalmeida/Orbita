import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, AdminRoute } from '@/components/protected-route'
import { Layout } from '@/components/layout/layout'
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { AuthShell } from '@/pages/auth/auth-shell'
import { DashboardPage } from '@/pages/dashboard'
import { TeamDetailPage } from '@/pages/team-detail'
import { AdminDashboard } from '@/pages/admin/admin-dashboard'
import { AdminTeamDetail } from '@/pages/admin/admin-team-detail'
import { ArchivedTasks } from '@/pages/admin/archived-tasks'
import { RequestsManager } from '@/pages/admin/requests-manager'
import { AdminUsers } from '@/pages/admin/admin-users'
import { AvailableTasks } from '@/pages/available-tasks'
import { CompletedTasksPage } from '@/pages/completed-tasks'
import { TeamsListPage } from '@/pages/teams-list'
import { MemberTeamDetailPage } from '@/pages/member-team-detail'
import { ProfilePage } from '@/pages/profile'
import { UserProfilePage } from '@/pages/user-profile'

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthShell />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/teams/:id" element={<AdminTeamDetail />} />
          <Route path="/admin/archived" element={<ArchivedTasks />} />
          <Route path="/admin/requests" element={<RequestsManager />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      {/* Member routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/available" element={<AvailableTasks />} />
          <Route path="/dashboard/completed" element={<CompletedTasksPage />} />
          <Route path="/dashboard/teams" element={<TeamsListPage />} />
          <Route path="/dashboard/teams/:id" element={<MemberTeamDetailPage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
        </Route>
      </Route>

      {/* Shared authenticated routes (both admin and member) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users/:id" element={<UserProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

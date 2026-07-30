import UserLayout from '../layouts/UserLayout'
import DashboardPage from '../pages/user/DashboardPage'
import ExpensesPage from '../pages/user/ExpensesPage'
import ExpenseFormPage from '../pages/user/ExpenseFormPage'
import AnalyticsPage from '../pages/user/AnalyticsPage'
import ProfilePage from '../pages/user/ProfilePage'
import { ProtectedRoute } from './ProtectedRoute'

export const UserRoutes = {
  path: '/',
  element: (
    <ProtectedRoute requiredRole="user">
      <UserLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <DashboardPage /> },
    { path: 'dashboard', element: <DashboardPage /> },
    { path: 'expenses', element: <ExpensesPage /> },
    { path: 'expenses/new', element: <ExpenseFormPage /> },
    { path: 'expenses/:id/edit', element: <ExpenseFormPage /> },
    { path: 'analytics', element: <AnalyticsPage /> },
    { path: 'profile', element: <ProfilePage /> },
  ],
}

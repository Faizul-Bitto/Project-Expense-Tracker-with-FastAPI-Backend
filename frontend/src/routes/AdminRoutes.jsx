import AdminLayout from '../layouts/AdminLayout'
import AdminDashboardPage from '../pages/admin/DashboardPage'
import AdminUsersPage from '../pages/admin/UsersPage'
import AdminExpensesPage from '../pages/admin/ExpensesPage'
import AdminCategoriesPage from '../pages/admin/CategoriesPage'
import AdminAnalyticsPage from '../pages/admin/AnalyticsPage'
import { ProtectedRoute } from './ProtectedRoute'

export const AdminRoutes = {
  path: '/admin',
  element: (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <AdminDashboardPage /> },
    { path: 'users', element: <AdminUsersPage /> },
    { path: 'expenses', element: <AdminExpensesPage /> },
    { path: 'categories', element: <AdminCategoriesPage /> },
    { path: 'analytics', element: <AdminAnalyticsPage /> },
  ],
}
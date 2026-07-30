export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    forgotPassword: '/auth/forgot-password',
    verifyOTP: '/auth/verify-otp',
    resetPassword: '/auth/reset-password',
  },
  users: {
    me: '/users/me',
    updatePassword: '/users/me/password',
  },
  expenses: {
    list: '/expenses',
    create: '/expenses',
    byDate: (date) => `/expenses/date/${date}`,
    byId: (id) => `/expenses/${id}`,
  },
  categories: {
    list: '/expense-categories',
    byId: (id) => `/expense-categories/${id}`,
  },
  analytics: {
    summary: '/analytics/summary',
    weekly: '/analytics/weekly',
    monthly: '/analytics/monthly',
    yearly: '/analytics/yearly',
    categories: '/analytics/categories',
    trends: '/analytics/trends',
  },
  admin: {
    users: {
      list: '/admin/users',
      search: (query) => `/admin/users/search?query=${encodeURIComponent(query)}`,
      byId: (id) => `/admin/users/${id}`,
      create: '/admin/users',
      update: (id) => `/admin/users/${id}`,
      delete: (id) => `/admin/users/${id}`,
      resetPassword: (id) => `/admin/users/${id}/reset-password`,
    },
    categories: {
      create: '/admin/expense-categories',
      update: (id) => `/admin/expense-categories/${id}`,
      delete: (id) => `/admin/expense-categories/${id}`,
    },
    expenses: {
      listByUser: (userId) => `/admin/users/${userId}/expenses`,
      byId: (userId, expenseId) => `/admin/users/${userId}/expenses/${expenseId}`,
      update: (userId, expenseId) => `/admin/users/${userId}/expenses/${expenseId}`,
      delete: (userId, expenseId) => `/admin/users/${userId}/expenses/${expenseId}`,
      byDate: (userId, date) => `/admin/users/${userId}/expenses/date/${date}`,
    },
    analytics: {
      summary: '/admin/analytics/summary',
      users: '/admin/analytics/users',
      topUsers: '/admin/analytics/top-users',
      categories: '/admin/analytics/categories',
      monthlyTrend: '/admin/analytics/monthly-trend',
      weeklyTrend: '/admin/analytics/weekly-trend',
      recentExpenses: '/admin/analytics/recent-expenses',
    },
  },
  health: '/healthy',
}
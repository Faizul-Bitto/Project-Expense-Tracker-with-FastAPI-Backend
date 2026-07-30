import apiClient from '../client'
import { API_ENDPOINTS } from '../endpoints'

export const adminAnalyticsApi = {
  getSummary() {
    return apiClient.get(API_ENDPOINTS.admin.analytics.summary)
  },

  getUsers() {
    return apiClient.get(API_ENDPOINTS.admin.analytics.users)
  },

  getTopUsers() {
    return apiClient.get(API_ENDPOINTS.admin.analytics.topUsers)
  },

  getCategories() {
    return apiClient.get(API_ENDPOINTS.admin.analytics.categories)
  },

  getMonthlyTrend() {
    return apiClient.get(API_ENDPOINTS.admin.analytics.monthlyTrend)
  },

  getWeeklyTrend() {
    return apiClient.get(API_ENDPOINTS.admin.analytics.weeklyTrend)
  },

  getRecentExpenses() {
    return apiClient.get(API_ENDPOINTS.admin.analytics.recentExpenses)
  },
}
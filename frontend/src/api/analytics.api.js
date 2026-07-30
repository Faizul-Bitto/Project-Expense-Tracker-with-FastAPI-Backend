import apiClient from './client'
import { API_ENDPOINTS } from './endpoints'

export const analyticsApi = {
  getSummary() {
    return apiClient.get(API_ENDPOINTS.analytics.summary)
  },

  getWeekly() {
    return apiClient.get(API_ENDPOINTS.analytics.weekly)
  },

  getMonthly() {
    return apiClient.get(API_ENDPOINTS.analytics.monthly)
  },

  getYearly() {
    return apiClient.get(API_ENDPOINTS.analytics.yearly)
  },

  getCategories() {
    return apiClient.get(API_ENDPOINTS.analytics.categories)
  },

  getTrends() {
    return apiClient.get(API_ENDPOINTS.analytics.trends)
  },
}
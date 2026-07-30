import apiClient from './client'
import { API_ENDPOINTS } from './endpoints'

export const usersApi = {
  getProfile() {
    return apiClient.get(API_ENDPOINTS.users.me)
  },

  updateProfile(data) {
    return apiClient.put(API_ENDPOINTS.users.me, data)
  },

  updatePassword(data) {
    return apiClient.put(API_ENDPOINTS.users.updatePassword, data)
  },
}
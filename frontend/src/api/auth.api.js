import apiClient from './client'
import { API_ENDPOINTS } from './endpoints'

export const authApi = {
  register(data) {
    return apiClient.post(API_ENDPOINTS.auth.register, data)
  },

  login(data) {
    const formData = new URLSearchParams()
    formData.append('username', data.email)
    formData.append('password', data.password)
    return apiClient.post(API_ENDPOINTS.auth.login, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },

  forgotPassword(data) {
    return apiClient.post(API_ENDPOINTS.auth.forgotPassword, data)
  },

  verifyOTP(data) {
    return apiClient.post(API_ENDPOINTS.auth.verifyOTP, data)
  },

  resetPassword(data) {
    return apiClient.post(API_ENDPOINTS.auth.resetPassword, data)
  },
}
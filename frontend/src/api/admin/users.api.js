import apiClient from '../client'
import { API_ENDPOINTS } from '../endpoints'

export const adminUsersApi = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.admin.users.list)
  },

  search(query) {
    return apiClient.get(API_ENDPOINTS.admin.users.search(query))
  },

  getById(id) {
    return apiClient.get(API_ENDPOINTS.admin.users.byId(id))
  },

  create(data) {
    return apiClient.post(API_ENDPOINTS.admin.users.create, data)
  },

  update(id, data) {
    return apiClient.put(API_ENDPOINTS.admin.users.update(id), data)
  },

  delete(id) {
    return apiClient.delete(API_ENDPOINTS.admin.users.delete(id))
  },

  resetPassword(id) {
    return apiClient.post(API_ENDPOINTS.admin.users.resetPassword(id))
  },
}
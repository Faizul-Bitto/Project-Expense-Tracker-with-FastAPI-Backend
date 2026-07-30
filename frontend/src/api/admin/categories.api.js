import apiClient from '../client'
import { API_ENDPOINTS } from '../endpoints'

export const adminCategoriesApi = {
  create(data) {
    return apiClient.post(API_ENDPOINTS.admin.categories.create, data)
  },

  update(id, data) {
    return apiClient.put(API_ENDPOINTS.admin.categories.update(id), data)
  },

  delete(id) {
    return apiClient.delete(API_ENDPOINTS.admin.categories.delete(id))
  },
}
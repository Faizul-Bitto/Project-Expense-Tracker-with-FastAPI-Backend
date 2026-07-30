import apiClient from './client'
import { API_ENDPOINTS } from './endpoints'

export const categoriesApi = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.categories.list)
  },

  getById(id) {
    return apiClient.get(API_ENDPOINTS.categories.byId(id))
  },
}
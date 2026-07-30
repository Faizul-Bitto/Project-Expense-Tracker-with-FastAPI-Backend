import apiClient from './client'
import { API_ENDPOINTS } from './endpoints'

export const expensesApi = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.expenses.list)
  },

  getById(id) {
    return apiClient.get(API_ENDPOINTS.expenses.byId(id))
  },

  create(data) {
    return apiClient.post(API_ENDPOINTS.expenses.create, data)
  },

  update(id, data) {
    return apiClient.put(API_ENDPOINTS.expenses.byId(id), data)
  },

  delete(id) {
    return apiClient.delete(API_ENDPOINTS.expenses.byId(id))
  },

  getByDate(date) {
    return apiClient.get(API_ENDPOINTS.expenses.byDate(date))
  },
}
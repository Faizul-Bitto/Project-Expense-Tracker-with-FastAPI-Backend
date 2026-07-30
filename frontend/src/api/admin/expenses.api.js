import apiClient from '../client'
import { API_ENDPOINTS } from '../endpoints'

export const adminExpensesApi = {
  getUserExpenses(userId) {
    return apiClient.get(API_ENDPOINTS.admin.expenses.listByUser(userId))
  },

  getUserExpenseById(userId, expenseId) {
    return apiClient.get(API_ENDPOINTS.admin.expenses.byId(userId, expenseId))
  },

  updateUserExpense(userId, expenseId, data) {
    return apiClient.put(API_ENDPOINTS.admin.expenses.update(userId, expenseId), data)
  },

  deleteUserExpense(userId, expenseId) {
    return apiClient.delete(API_ENDPOINTS.admin.expenses.delete(userId, expenseId))
  },

  getUserExpensesByDate(userId, date) {
    return apiClient.get(API_ENDPOINTS.admin.expenses.byDate(userId, date))
  },
}
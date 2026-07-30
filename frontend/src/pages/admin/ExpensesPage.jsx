import { useState, useEffect } from 'react'
import { adminUsersApi } from '../../api/admin/users.api'
import { adminExpensesApi } from '../../api/admin/expenses.api'

export default function AdminExpensesPage() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expensesLoading, setExpensesLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    adminUsersApi.getAll()
      .then((res) => setUsers(res.data.users))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const loadExpenses = async (userId) => {
    setExpensesLoading(true)
    setError('')
    try {
      const res = await adminExpensesApi.getUserExpenses(userId)
      setExpenses(res.data.expenses)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load expenses')
      setExpenses([])
    } finally {
      setExpensesLoading(false)
    }
  }

  const handleUserSelect = (userId) => {
    const user = users.find((u) => u.id === userId)
    setSelectedUser(user)
    loadExpenses(userId)
  }

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await adminExpensesApi.deleteUserExpense(selectedUser.id, expenseId)
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete expense')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Expenses</h1>
        <p className="text-gray-500 mt-1">View and manage expenses by user</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
        <select
          value={selectedUser?.id || ''}
          onChange={(e) => handleUserSelect(Number(e.target.value))}
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
        >
          <option value="">Choose a user...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {selectedUser && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Viewing expenses for <strong>{selectedUser.name}</strong> ({selectedUser.email})
          </p>
        </div>
      )}

      {expensesLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : selectedUser && expenses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-lg">No expenses for this user</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{expense.date}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${Number(expense.total_amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{expense.items?.length || 0} item(s)</p>
                </div>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
              {expense.items && expense.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {expense.items.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-600">{item.description}</span>
                      <span className="font-medium">${Number(item.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
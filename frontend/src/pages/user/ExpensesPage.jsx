import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { expensesApi } from '../../api/expenses.api'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchExpenses = () => {
    setLoading(true)
    setError('')
    expensesApi.getAll()
      .then((res) => setExpenses(res.data.expenses))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load expenses'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchExpenses() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return
    try {
      await expensesApi.delete(id)
      setExpenses((prev) => prev.filter((e) => e.id !== id))
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
          <p className="text-gray-500 mt-1">Manage your expenses</p>
        </div>
        <Link
          to="/expenses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Expense
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {expenses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-lg">No expenses yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first expense to get started</p>
          <Link
            to="/expenses/new"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Expense
          </Link>
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
                <div className="flex gap-2">
                  <Link
                    to={`/expenses/${expense.id}/edit`}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expense.items && expense.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    {expense.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{item.description}</span>
                        <span className="font-medium">${Number(item.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
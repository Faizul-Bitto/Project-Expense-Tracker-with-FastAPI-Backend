import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { expensesApi } from '../../api/expenses.api'
import { categoriesApi } from '../../api/categories.api'

export default function ExpenseFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [categories, setCategories] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState([{ expense_category_id: '', description: '', amount: '' }])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.getAll()
      .then((res) => setCategories(res.data.expense_categories))
      .catch(() => {})
      .finally(() => {
        if (isEditing) {
          expensesApi.getById(id)
            .then((res) => {
              const exp = res.data.expense
              setDate(exp.date)
              setItems(exp.items.map((i) => ({
                expense_category_id: i.expense_category_id,
                description: i.description,
                amount: i.amount,
              })))
            })
            .catch((err) => setError(err.response?.data?.detail || 'Failed to load expense'))
            .finally(() => setFetching(false))
        } else {
          setFetching(false)
        }
      })
  }, [id])

  const addItem = () => {
    setItems([...items, { expense_category_id: '', description: '', amount: '' }])
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        date,
        items: items.map((item) => ({
          expense_category_id: Number(item.expense_category_id),
          description: item.description,
          amount: Number(item.amount),
        })),
      }
      if (isEditing) {
        await expensesApi.update(id, payload)
      } else {
        await expensesApi.create(payload)
      }
      navigate('/expenses')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save expense')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Expense' : 'Add Expense'}</h1>
        <p className="text-gray-500 mt-1">{isEditing ? 'Update your expense' : 'Record a new expense'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Items</label>
            <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              + Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Item {index + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} className="text-xs text-red-600 hover:text-red-800">
                    Remove
                  </button>
                )}
              </div>

              <select
                required
                value={item.expense_category_id}
                onChange={(e) => updateItem(index, 'expense_category_id', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <input
                type="text"
                required
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                placeholder="Description"
              />

              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={item.amount}
                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                placeholder="Amount"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Expense' : 'Create Expense'}
        </button>
      </form>
    </div>
  )
}
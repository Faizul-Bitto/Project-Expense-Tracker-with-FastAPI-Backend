import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { expensesApi } from '../../api/expenses.api'
import { categoriesApi } from '../../api/categories.api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

  const addItem = () => setItems([...items, { expense_category_id: '', description: '', amount: '' }])
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index))
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
        navigate('/expenses', { state: { toastMessage: 'Expense updated successfully.', toastType: 'success' } })
      } else {
        await expensesApi.create(payload)
        navigate('/expenses', { state: { toastMessage: 'Expense created successfully.', toastType: 'success' } })
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save expense')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Expense' : 'Add Expense'}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isEditing ? 'Update your expense' : 'Record a new expense'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Date</Label>
          <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-slate-700 dark:text-slate-300">Items</Label>
            <button type="button" onClick={addItem} className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium">+ Add Item</button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Item {index + 1}</span>
                {items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">Remove</button>}
              </div>

              <select required value={item.expense_category_id} onChange={(e) => updateItem(index, 'expense_category_id', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm">
                <option value="">Select category</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>

              <Input type="text" required value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" placeholder="Description" />

              <Input type="number" required min="0.01" step="0.01" value={item.amount} onChange={(e) => updateItem(index, 'amount', e.target.value)}
                className="border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" placeholder="Amount" />
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-user-primary w-full justify-center h-10">
          {loading ? 'Saving...' : isEditing ? 'Update Expense' : 'Create Expense'}
        </button>
      </form>
    </div>
  )
}
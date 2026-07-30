import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { expensesApi } from '../../api/expenses.api'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus, Wallet } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from 'sonner'

export default function ExpensesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  // Show toasts from route state (e.g., after creating an expense)
  useEffect(() => {
    if (location.state?.toastMessage) {
      const msg = location.state.toastMessage
      const type = location.state.toastType || 'success'
      if (type === 'success') toast.success(msg, { duration: 4000 })
      else if (type === 'error') toast.error(msg, { duration: 4000 })
      else toast(msg, { duration: 4000 })
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const fetchExpenses = () => {
    setLoading(true)
    setError('')
    expensesApi.getAll()
      .then((res) => setExpenses(res.data.expenses))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load expenses'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchExpenses() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await expensesApi.delete(deleteId)
      setExpenses((prev) => prev.filter((e) => e.id !== deleteId))
      toast.success('Expense deleted successfully.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete expense')
    }
    setDeleteId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your expenses</p>
        </div>
        <Link to="/expenses/new">
          <button className="btn-user-primary">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm">{error}</div>}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null) }}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />

      {expenses.length === 0 ? (
        <div className="text-center py-20 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No expenses yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add your first expense to get started</p>
          <Link to="/expenses/new">
            <Button className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white glow-purple glossy-btn">
              <Plus className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 card-glow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center shrink-0">
                    <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{expense.date}</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
                      ${Number(expense.total_amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{expense.items?.length || 0} item(s)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/expenses/${expense.id}/edit`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/50">
                      <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(expense.id)} className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              </div>
              {expense.items && expense.items.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="space-y-2.5">
                    {expense.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-500" />
                          <span className="text-slate-600 dark:text-slate-300">{item.description}</span>
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-white">${Number(item.amount).toFixed(2)}</span>
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
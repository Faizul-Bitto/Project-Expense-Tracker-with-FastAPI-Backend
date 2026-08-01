import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { expensesApi } from '../../api/expenses.api'
import { categoriesApi } from '../../api/categories.api'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus, Wallet, CalendarDays, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from 'sonner'
import { logger } from '../../utils/logger'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [categoryMap, setCategoryMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [filterDate, setFilterDate] = useState('')
  const [isFiltered, setIsFiltered] = useState(false)

  const fetchExpenses = () => {
    setLoading(true)
    setError('')
    expensesApi.getAll()
      .then((res) => setExpenses(res.data.expenses))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load expenses'))
      .finally(() => setLoading(false))
  }

  const fetchCategories = () => {
    categoriesApi.getAll()
      .then((res) => {
        const map = {}
        ;(res.data.expense_categories || []).forEach((cat) => {
          map[cat.id] = cat.name
        })
        setCategoryMap(map)
      })
      .catch(() => {})
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCategories()
      fetchExpenses()
    })
  }, [])

  const filterByDate = async () => {
    if (!filterDate) return
    setLoading(true)
    setError('')
    try {
      const res = await expensesApi.getByDate(filterDate)
      setExpenses(res.data.expenses)
      setIsFiltered(true)
      toast.success(`Showing expenses for ${filterDate}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to filter by date')
    } finally {
      setLoading(false)
    }
  }

  const clearFilter = () => {
    setFilterDate('')
    setIsFiltered(false)
    fetchExpenses()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await expensesApi.delete(deleteId)
      setExpenses((prev) => prev.filter((e) => e.id !== deleteId))
      logger.success('Expenses', `🗑️ Expense Deleted | ID=${deleteId}`)
      toast.success('Expense deleted successfully.')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete expense'
      logger.error('Expenses', `❌ Expense Delete Failed | ID=${deleteId} | Reason=${msg}`)
      toast.error(msg)
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

      {/* Date Filter */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <button onClick={filterByDate} disabled={!filterDate} className="btn-user-primary text-sm py-2">
          Search by Date
        </button>
        {isFiltered && (
          <button onClick={clearFilter} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
        {isFiltered && (
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Showing results for: {filterDate}
          </span>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm">{error}</div>}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null) }}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />

      {expenses.length === 0 && !isFiltered ? (
        <div className="text-center py-20 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/50">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No expenses yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add your first expense to get started</p>
        </div>
      ) : expenses.length === 0 && isFiltered ? (
        <div className="text-center py-20 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/50">
          <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No expenses for {filterDate}</p>
          <button onClick={clearFilter} className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline">Clear filter</button>
        </div>
      ) : (
        <div className="space-y-4">
          {isFiltered && (
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              Found {expenses.length} expense(s) for {filterDate}
            </p>
          )}
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 card-glow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center shrink-0">
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
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-500 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300 truncate">{item.description}</span>
                          {categoryMap[item.expense_category_id] && (
                            <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-medium">
                              {categoryMap[item.expense_category_id]}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-white shrink-0 ml-3">${Number(item.amount).toFixed(2)}</span>
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
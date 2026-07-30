import { useState, useEffect, useCallback } from 'react'
import { adminUsersApi } from '../../api/admin/users.api'
import { adminExpensesApi } from '../../api/admin/expenses.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Wallet, Search } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from 'sonner'

export default function AdminExpensesPage() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [expensesLoading, setExpensesLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { adminUsersApi.getAll().then((res) => setUsers(res.data.users)).catch(() => {}) }, [])

  const loadExpenses = useCallback(async (userId) => {
    setExpensesLoading(true); setError('')
    try { const res = await adminExpensesApi.getUserExpenses(userId); setExpenses(res.data.expenses) }
    catch (err) { setError(err.response?.data?.detail || 'Failed'); setExpenses([]) }
    finally { setExpensesLoading(false) }
  }, [])

  const selectUserById = (userId) => {
    if (!userId) { clearSelection(); return }
    const user = users.find(u => u.id === userId)
    if (!user) return
    setSelectedUser(user); setSearchQuery(user.name); setSearchResults([]); loadExpenses(user.id)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) { setSearchResults([]); setSearched(false); return }
    setSearching(true); setSearched(true); setError('')
    try {
      const res = await adminUsersApi.search(q)
      setSearchResults(res.data.users)
      if (res.data.users.length === 1) selectUserById(res.data.users[0].id)
    } catch (err) { setError(err.response?.data?.detail || 'Search failed'); setSearchResults([]) }
    finally { setSearching(false) }
  }

  const clearSelection = () => { setSelectedUser(null); setSearchQuery(''); setExpenses([]); setSearchResults([]) }

  const handleDelete = async () => {
    if (!deleteId || !selectedUser) return
    try {
      await adminExpensesApi.deleteUserExpense(selectedUser.id, deleteId)
      setExpenses((prev) => prev.filter((e) => e.id !== deleteId))
      toast.success('Expense deleted successfully.')
    } catch (err) { setError(err.response?.data?.detail || 'Failed') }
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Expenses</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search users and view their expenses</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="w-full sm:w-72">
          <select value={selectedUser?.id || ''} onChange={(e) => selectUserById(Number(e.target.value) || 0)}
            className="w-full h-10 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
            <option value="">Select a user...</option>
            {users.map((u) => (<option key={u.id} value={u.id}>{u.name} — {u.email}</option>))}
          </select>
        </div>

        <div className="relative flex-1 w-full max-w-md">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (!e.target.value.trim()) setSearchResults([]) }}
                placeholder="Search by name or email..." className="pl-10 h-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400" />
            </div>
            <Button type="submit" disabled={searching} className="h-10 bg-cyan-600 hover:bg-cyan-500 text-white">{searching ? '...' : 'Search'}</Button>
            {selectedUser && (<Button type="button" variant="outline" onClick={clearSelection} className="h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Clear</Button>)}
          </form>

          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden z-10 shadow-lg">
              {searchResults.map((user) => (
                <button key={user.id} onClick={() => selectUserById(user.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-700 dark:text-cyan-300 text-xs font-bold shrink-0">{user.name[0].toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0">{user.role}</span>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && !searching && !selectedUser && searched && (
            <p className="text-sm text-gray-500 mt-2">No users found matching "{searchQuery}"</p>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }} title="Delete Expense" description="Are you sure?" onConfirm={handleDelete} confirmText="Delete" />

      {selectedUser && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold shrink-0">{selectedUser.name[0].toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.name}</p>
            <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
          </div>
        </div>
      )}

      {expensesLoading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-300 border-t-cyan-600 dark:border-gray-600 dark:border-t-cyan-400 rounded-full animate-spin" /></div>
      ) : selectedUser && expenses.length === 0 ? (
        <div className="text-center py-20 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/50">
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-4"><Wallet className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No expenses for this user</p>
        </div>
      ) : expenses.length > 0 ? (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0"><Wallet className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{expense.date}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">${Number(expense.total_amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{expense.items?.length || 0} item(s)</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setDeleteId(expense.id)} className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</Button>
              </div>
              {expense.items && expense.items.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                  {expense.items.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between text-sm py-1.5">
                      <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-cyan-400" /><span className="text-gray-600 dark:text-gray-300">{item.description}</span></div>
                      <span className="font-semibold text-gray-900 dark:text-white">${Number(item.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
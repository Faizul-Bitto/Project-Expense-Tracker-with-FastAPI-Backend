import { useState, useEffect } from 'react'
import { adminUsersApi } from '../../api/admin/users.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Plus, Pencil, Trash2, KeyRound, Users } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [resetId, setResetId] = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    const api = search.trim() ? adminUsersApi.search(search.trim()) : adminUsersApi.getAll()
    api.then((res) => setUsers(res.data.users))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])
  const handleSearch = (e) => { e.preventDefault(); fetchUsers() }

  const openCreateForm = () => { setEditingUser(null); setForm({ name: '', email: '', password: '', role: 'user' }); setShowForm(true); setFormError('') }
  const openEditForm = (user) => { setEditingUser(user); setForm({ name: user.name, email: user.email, password: '', role: user.role }); setShowForm(true); setFormError('') }

  const handleFormSubmit = async (e) => {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      if (editingUser) {
        await adminUsersApi.update(editingUser.id, form)
        toast.success('User updated successfully.')
      } else {
        await adminUsersApi.create(form)
        toast.success('User created successfully.')
      }
      setShowForm(false); fetchUsers()
    } catch (err) { setFormError(err.response?.data?.detail || 'Operation failed') }
    finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await adminUsersApi.delete(deleteId); fetchUsers(); toast.success('User deleted successfully.') }
    catch (err) { setError(err.response?.data?.detail || 'Failed to delete user') }
    setDeleteId(null)
  }

  const handleResetPassword = async () => {
    if (!resetId) return
    try { await adminUsersApi.resetPassword(resetId); toast.success('Temporary password sent to user email.') }
    catch (err) { setError(err.response?.data?.detail || 'Failed to reset password') }
    setResetId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all registered users</p>
        </div>
        <button onClick={openCreateForm} className="btn-admin-primary">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-10 h-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400" />
        </div>
        <Button type="submit" variant="outline" className="h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Search</Button>
      </form>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 sm:max-w-md">
          <DialogHeader><DialogTitle className="text-gray-900 dark:text-white">{editingUser ? 'Edit User' : 'Create User'}</DialogTitle></DialogHeader>
          {formError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{formError}</div>}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 text-sm">Name</Label>
              <Input type="text" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 text-sm">Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 text-sm">Role</Label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="user">User</option><option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 text-sm">Password {editingUser && '(leave blank)'}</Label>
              <Input type="password" minLength={editingUser ? 0 : 6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <DialogFooter className="gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</Button>
              <Button type="submit" disabled={formLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600">{formLoading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }} title="Delete User" description="Are you sure?" onConfirm={handleDelete} confirmText="Delete User" />
      <ConfirmDialog open={!!resetId} onOpenChange={(o) => { if (!o) setResetId(null) }} title="Reset Password" description="A temporary password will be sent." onConfirm={handleResetPassword} confirmText="Reset Password" variant="default" />

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-300 border-t-cyan-600 dark:border-gray-600 dark:border-t-cyan-400 rounded-full animate-spin" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/50">
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No users found</p>
          <p className="text-sm text-gray-500 mt-1">Add a user to get started</p>
          <Button onClick={openCreateForm} className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white"><Plus className="w-4 h-4 mr-2" /> Add User</Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => openEditForm(u)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => setResetId(u.id)} className="border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400"><KeyRound className="w-3.5 h-3.5 mr-1.5" /> Reset</Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteId(u.id)} className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
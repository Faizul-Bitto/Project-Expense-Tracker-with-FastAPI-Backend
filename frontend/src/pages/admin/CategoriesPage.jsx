import { useState, useEffect } from 'react'
import { categoriesApi } from '../../api/categories.api'
import { adminCategoriesApi } from '../../api/admin/categories.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [name, setName] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const fetchCategories = () => {
    setLoading(true)
    categoriesApi.getAll().then((res) => setCategories(res.data.expense_categories))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { Promise.resolve().then(() => fetchCategories()) }, [])
  const openCreate = () => { setEditingCat(null); setName(''); setShowForm(true); setFormError('') }
  const openEdit = (cat) => { setEditingCat(cat); setName(cat.name); setShowForm(true); setFormError('') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      if (editingCat) {
        await adminCategoriesApi.update(editingCat.id, { name })
        toast.success('Category updated successfully.')
      } else {
        await adminCategoriesApi.create({ name })
        toast.success('Category created successfully.')
      }
      setShowForm(false); fetchCategories()
    } catch (err) { setFormError(err.response?.data?.detail || 'Operation failed') }
    finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await adminCategoriesApi.delete(deleteId); fetchCategories(); toast.success('Category deleted successfully.') }
    catch (err) { setError(err.response?.data?.detail || 'Failed to delete') }
    setDeleteId(null)
  }

  if (loading) return (<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-300 border-t-cyan-600 dark:border-gray-600 dark:border-t-cyan-400 rounded-full animate-spin" /></div>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage expense categories</p>
        </div>
        <Button onClick={openCreate} className="bg-cyan-600 hover:bg-cyan-500 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 sm:max-w-md">
          <DialogHeader><DialogTitle className="text-gray-900 dark:text-white">{editingCat ? 'Edit Category' : 'Create Category'}</DialogTitle></DialogHeader>
          {formError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{formError}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 text-sm">Name</Label>
              <Input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="h-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <DialogFooter className="gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</Button>
              <Button type="submit" disabled={formLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white">{formLoading ? 'Saving...' : editingCat ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }} title="Delete Category" description="Are you sure?" onConfirm={handleDelete} confirmText="Delete" />

      {categories.length === 0 ? (
        <div className="text-center py-20 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/50">
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-4"><FolderTree className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No categories</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{cat.name}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => openEdit(cat)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteId(cat.id)} className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</Button>
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
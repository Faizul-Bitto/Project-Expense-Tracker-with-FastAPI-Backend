import { useState, useEffect } from 'react'
import { categoriesApi } from '../../api/categories.api'

export default function UserCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.getAll()
      .then((res) => setCategories(res.data.expense_categories))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

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
        <h1 className="text-2xl font-bold text-gray-900">Expense Categories</h1>
        <p className="text-gray-500 mt-1">Available categories for your expenses</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-lg">No categories available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">{cat.name[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">ID: {cat.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
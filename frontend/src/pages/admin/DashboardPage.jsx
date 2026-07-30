import { useState, useEffect } from 'react'
import { adminAnalyticsApi } from '../../api/admin/analytics.api'

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminAnalyticsApi.getSummary()
      .then((res) => setSummary(res.data.summary))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
  }

  const cards = [
    { label: 'Total Users', value: summary?.total_users || 0, color: 'bg-blue-500' },
    { label: 'Total Expenses', value: summary?.total_expenses || 0, color: 'bg-green-500' },
    { label: 'Total Spending', value: `$${Number(summary?.total_spending || 0).toLocaleString()}`, color: 'bg-purple-500' },
    { label: 'Today', value: `$${Number(summary?.today_spending || 0).toFixed(2)}`, color: 'bg-orange-500' },
    { label: 'This Week', value: `$${Number(summary?.weekly_spending || 0).toFixed(2)}`, color: 'bg-teal-500' },
    { label: 'This Month', value: `$${Number(summary?.monthly_spending || 0).toFixed(2)}`, color: 'bg-indigo-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className={`w-3 h-3 rounded-full ${card.color} mb-3`}></div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Average Expense</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${Number(summary?.average_expense || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Highest Expense</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${Number(summary?.highest_expense || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.total_admins || 0}</p>
        </div>
      </div>
    </div>
  )
}